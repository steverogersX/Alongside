import { and, desc, eq, sql } from "drizzle-orm";

import { db, type Tx } from "@/db/client.ts";
import { agentRuns, documents } from "@/db/schema/index.ts";
import type { Role, RunStatus } from "@/db/types.ts";

export const runRepository = {
  async listForDocument(documentId: string, limit: number, offset: number) {
    return db
      .select()
      .from(agentRuns)
      .where(eq(agentRuns.documentId, documentId))
      .orderBy(desc(agentRuns.createdAt))
      .limit(limit)
      .offset(offset);
  },

  async findForDocument(runId: string, documentId: string) {
    const [run] = await db
      .select()
      .from(agentRuns)
      .where(
        and(eq(agentRuns.id, runId), eq(agentRuns.documentId, documentId))
      )
      .limit(1);

    return run ?? null;
  },

  async create(
    tx: Tx,
    input: {
      documentId: string;
      agentId: string;
      invokedBy: string;
      prompt: string;
      ceiling: Role;
      status?: RunStatus;
      triggerMessageId?: string;
    }
  ) {
    const [run] = await tx.insert(agentRuns).values(input).returning();
    return run!;
  },

  async find(runId: string) {
    const [run] = await db
      .select()
      .from(agentRuns)
      .where(eq(agentRuns.id, runId))
      .limit(1);

    return run ?? null;
  },

  /**
   * SKIP LOCKED means two executors racing for the same run cannot both win —
   * the loser sees the row as taken and moves on instead of blocking.
   */
  async claim(runId: string, connectionId: string) {
    const [run] = await db.execute<{ id: string }>(
      sql`update ${agentRuns} set status = 'running', connection_id = ${connectionId},
            claimed_at = now(), attempts = ${agentRuns.attempts} + 1
          where id = (
            select id from ${agentRuns}
            where id = ${runId} and status = 'queued'
            for update skip locked
          )
          returning id`
    ).then((result) => result.rows);

    return run ? this.find(runId) : null;
  },

  async queuedForUser(userId: string, limit: number) {
    return db
      .select({ run: agentRuns, document: documents })
      .from(agentRuns)
      .innerJoin(documents, eq(documents.id, agentRuns.documentId))
      .where(and(eq(agentRuns.invokedBy, userId), eq(agentRuns.status, "queued")))
      .orderBy(desc(agentRuns.createdAt))
      .limit(limit);
  },

  async finish(
    runId: string,
    input: { status: RunStatus; summary?: string | null; error?: string | null }
  ) {
    const [run] = await db
      .update(agentRuns)
      .set({ ...input, endedAt: new Date() })
      .where(eq(agentRuns.id, runId))
      .returning();

    return run ?? null;
  },

  async settle(
    tx: Tx,
    runId: string,
    input: { status: RunStatus; decidedBy: string }
  ) {
    const [run] = await tx
      .update(agentRuns)
      .set({ ...input, endedAt: new Date() })
      .where(eq(agentRuns.id, runId))
      .returning();

    return run!;
  },
};
