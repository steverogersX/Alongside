import { and, eq, isNull } from "drizzle-orm";

import { db, type Tx } from "@/db/client.ts";
import { orgs, userIdentities, users } from "@/db/schema/index.ts";

export const authRepository = {
  async findUserByEmail(email: string, tx: Tx | typeof db = db) {
    const [user] = await tx
      .select()
      .from(users)
      .where(and(eq(users.email, email), isNull(users.deletedAt)))
      .limit(1);

    return user ?? null;
  },

  async findPasswordIdentity(email: string) {
    const [row] = await db
      .select({ user: users, identity: userIdentities })
      .from(userIdentities)
      .innerJoin(users, eq(users.id, userIdentities.userId))
      .where(
        and(
          eq(userIdentities.provider, "password"),
          eq(userIdentities.providerUserId, email),
          isNull(users.deletedAt)
        )
      )
      .limit(1);

    return row ?? null;
  },

  async createOrg(tx: Tx, name: string, slug: string) {
    const [org] = await tx.insert(orgs).values({ name, slug }).returning();
    return org!;
  },

  async createOwner(
    tx: Tx,
    input: { orgId: string; displayName: string; email: string }
  ) {
    const [user] = await tx
      .insert(users)
      .values({
        orgId: input.orgId,
        kind: "human",
        displayName: input.displayName,
        email: input.email,
        isOrgAdmin: true,
      })
      .returning();

    return user!;
  },

  async createPasswordIdentity(
    tx: Tx,
    input: { userId: string; email: string; passwordHash: string }
  ) {
    await tx.insert(userIdentities).values({
      userId: input.userId,
      provider: "password",
      providerUserId: input.email,
      passwordHash: input.passwordHash,
    });
  },

  async touchIdentity(id: string) {
    await db
      .update(userIdentities)
      .set({ lastUsedAt: new Date() })
      .where(eq(userIdentities.id, id));
  },
};
