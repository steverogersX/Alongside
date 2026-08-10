import { and, desc, eq, isNull, or, sql } from "drizzle-orm";

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
      prompt: string;
      ceiling: Role;
      status?: RunStatus;
      triggerMessageId?: string;
    } & (
      | { invokedBy: string }
      | {
          invokedByLinkId: string;
          invokedByVisitorId: string;
          invokedByName: string;
        }
    )
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
   * One run per document at a time: the same agent asked by three people would
   * otherwise race itself, and each edit would invalidate the others' anchors.
   * SKIP LOCKED keeps two workers from claiming the same row.
   */
  async claimNext() {
    const claimed = await db.execute<{ id: string }>(sql`
      update agent_runs set
        status = 'running',
        claimed_at = now(),
        attempts = attempts + 1
      where id = (
        select r.id from agent_runs r
        where r.status = 'queued'
          and not exists (
            select 1 from agent_runs busy
            where busy.document_id = r.document_id
              and busy.status = 'running'
          )
        order by r.created_at
        limit 1
        for update skip locked
      )
      returning id
    `);

    const id = claimed.rows[0]?.id;
    return id ? this.find(id) : null;
  },

  async claim(runId: string, connectionId: string) {
    const claimed = await db.execute<{ id: string }>(sql`
      update agent_runs set
        status = 'running',
        connection_id = ${connectionId},
        claimed_at = now(),
        attempts = attempts + 1
      where id = (
        select id from agent_runs
        where id = ${runId} and status = 'queued'
        for update skip locked
      )
      returning id
    `);

    return claimed.rows[0] ? this.find(runId) : null;
  },

  /**
   * What this connection is being asked to do: anything its own human queued,
   * plus anything a share-link guest queued for this agent — a guest has no
   * account to match on, so those would otherwise be waited on by nobody.
   */
  async queuedForUser(userId: string, agentId: string, limit: number) {
    return db
      .select({ run: agentRuns, document: documents })
      .from(agentRuns)
      .innerJoin(documents, eq(documents.id, agentRuns.documentId))
      .where(
        and(
          eq(agentRuns.status, "queued"),
          or(
            eq(agentRuns.invokedBy, userId),
            and(eq(agentRuns.agentId, agentId), isNull(agentRuns.invokedBy))
          )
        )
      )
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
