import { and, desc, eq } from "drizzle-orm";

import { db, type Tx } from "@/db/client.ts";
import { agentRuns } from "@/db/schema/index.ts";
import type { Role, RunStatus } from "@/db/types.ts";

export const runRepository = {
  async listForDocument(documentId: string, limit = 50) {
    return db
      .select()
      .from(agentRuns)
      .where(eq(agentRuns.documentId, documentId))
      .orderBy(desc(agentRuns.createdAt))
      .limit(limit);
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
    }
  ) {
    const [run] = await tx.insert(agentRuns).values(input).returning();
    return run!;
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
