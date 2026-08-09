import { eq } from "drizzle-orm";

import { isProd } from "@/config/env.ts";
import { db } from "@/db/client.ts";
import { users } from "@/db/schema/index.ts";
import type { AgentRun, User } from "@/db/types.ts";
import { chatRepository } from "@/modules/chat/chat.repository.ts";
import { agentPresence } from "@/modules/collab/collab.agent-presence.ts";
import {
  adapterFor,
  baseUrlFor,
  type Provider,
} from "@/modules/providers/index.ts";
import { ProviderError } from "@/modules/providers/provider.error.ts";
import { withRetry } from "@/modules/providers/provider.retry.ts";
import type { Turn } from "@/modules/providers/provider.types.ts";
import { runRepository } from "@/modules/runs/run.repository.ts";
import { runTool, toolsFor } from "@/modules/runs/run.tools.ts";
import { open } from "@/shared/crypto.ts";
import { atLeast } from "@/shared/role.ts";

const POLL_MS = 1500;
const MAX_STEPS = 10;
const TIMEOUT_MS = 150_000;

const handleOf = (displayName: string) =>
  displayName.trim().split(/\s+/)[0]!.toLowerCase();

function systemPrompt(agent: User, invoker: User, canEdit: boolean) {
  return [
    `You are ${agent.displayName}, working inside a shared document in Alongside.`,
    `${invoker.displayName} asked you to do something. Other people are reading the same document live.`,
    canEdit
      ? "You may change the document. Make the smallest edit that does the job — never rewrite blocks that were not asked about."
      : "You have read-only access. You cannot change the document; answer in your summary instead.",
    "Always call read_document first. It returns numbered blocks, so positions in the request map to indices: the first paragraph is the first block of type p, 'the last block' is lastIndex, 'at the top' is insert_block with after -1, 'at the bottom' is after lastIndex.",
    "There are no pages. If someone says 'page', treat it as the section under the nearest heading and say which section you took it to mean.",
    "Left and right do not exist in this document — ask instead of guessing.",
    "Use replace_block, delete_block and insert_block for whole blocks, and replace_text only for a phrase inside one.",
    "Block edits need expect: copy the start of that block from read_document. If a tool answers moved or no_match, someone edited while you were working — read_document again and redo it from the new text.",
    "When you are done, call finish with a short summary written to the person who asked.",
  ].join(" ");
}

async function execute(run: AgentRun) {
  const [agent] = await db
    .select()
    .from(users)
    .where(eq(users.id, run.agentId))
    .limit(1);

  const [invoker] = await db
    .select()
    .from(users)
    .where(eq(users.id, run.invokedBy))
    .limit(1);

  if (!agent || !invoker) {
    await runRepository.finish(run.id, {
      status: "failed",
      error: "That agent no longer exists.",
    });
    return;
  }

  if (!agent.keyCipher || !agent.provider || !agent.model) {
    await settle(run, agent, invoker, {
      status: "failed",
      message: "No provider key is set for this agent.",
    });
    return;
  }

  const adapter = adapterFor(agent.provider as Provider);
  const tools = toolsFor(run);
  const deadline = Date.now() + TIMEOUT_MS;

  const turns: Turn[] = [{ role: "user", text: run.prompt }];

  await agentPresence.join(run.documentId, agent, invoker);

  try {
    for (let step = 0; step < MAX_STEPS; step += 1) {
      if (Date.now() > deadline) {
        await settle(run, agent, invoker, {
          status: "failed",
          message: "I ran out of time on that one.",
        });
        return;
      }

      // Someone may have hit Stop between calls; that is the only place a run
      // can be interrupted, so check it every time round.
      const current = await runRepository.find(run.id);
      if (!current || current.status === "cancelled") return;

      const reply = await withRetry(
        () =>
          adapter.send({
            apiKey: open(agent.keyCipher!),
            baseUrl: baseUrlFor(agent.provider as Provider, agent.baseUrl),
            model: agent.model!,
            system: systemPrompt(agent, invoker, atLeast(run.ceiling, "editor")),
            turns,
            tools,
          }),
        {
          deadline,
          onWait: ({ attempt, waitMs, status }) => {
            if (!isProd) {
              console.log(
                `[worker] ${status} from provider, retry ${attempt} in ${waitMs}ms`
              );
            }
          },
        }
      );

      const finish = reply.calls.find((call) => call.name === "finish");
      if (finish) {
        await settle(run, agent, invoker, {
          status: "succeeded",
          message: String(finish.input.summary ?? "Done."),
        });
        return;
      }

      if (reply.calls.length === 0) {
        await settle(run, agent, invoker, {
          status: "succeeded",
          message: reply.text || "Done.",
        });
        return;
      }

      turns.push({ role: "assistant", text: reply.text, calls: reply.calls });

      for (const call of reply.calls) {
        const result = await runTool(run, agent, call.name, call.input);
        turns.push({
          role: "tool",
          callId: call.id,
          name: call.name,
          result,
        });
      }
    }

    await settle(run, agent, invoker, {
      status: "failed",
      message: "I went in circles on that one and stopped.",
    });
  } catch (error) {
    await settle(run, agent, invoker, {
      status: "failed",
      message: explain(error),
    });
  } finally {
    await agentPresence.leave(run.documentId);
  }
}

function explain(error: unknown) {
  if (error instanceof ProviderError) {
    if (error.status === 429) {
      return "Your provider is rate limiting right now. I waited and tried again a few times — give it a minute and ask me once more.";
    }

    if (error.status === 401 || error.status === 403) {
      return "The provider rejected the API key for this agent.";
    }

    if (error.status >= 500) {
      return "The provider is having trouble. I retried a few times without luck.";
    }

    return error.message;
  }

  if (error instanceof TypeError) {
    return "I could not reach the provider — check the base URL for this agent.";
  }

  return error instanceof Error ? error.message : "Something went wrong.";
}

async function settle(
  run: AgentRun,
  agent: User,
  invoker: User,
  outcome: { status: "succeeded" | "failed"; message: string }
) {
  await chatRepository.create({
    documentId: run.documentId,
    body: `@${handleOf(invoker.displayName)} ${outcome.message}`,
    authorId: agent.id,
    runId: run.id,
  });

  await runRepository.finish(run.id, {
    status: outcome.status,
    summary: outcome.status === "succeeded" ? outcome.message : null,
    error: outcome.status === "failed" ? outcome.message : null,
  });
}

let timer: ReturnType<typeof setInterval> | null = null;
let busy = false;

export function startRunWorker() {
  if (timer) return;

  timer = setInterval(async () => {
    if (busy) return;
    busy = true;

    try {
      const run = await runRepository.claimNext();
      if (run) await execute(run);
    } catch (error) {
      if (!isProd) console.error("[worker]", error);
    } finally {
      busy = false;
    }
  }, POLL_MS);

  timer.unref();
}
