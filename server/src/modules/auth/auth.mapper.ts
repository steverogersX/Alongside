import type { PublicUser, User } from "@/db/types.ts";

export const toPublicUser = (user: User): PublicUser => ({
  id: user.id,
  orgId: user.orgId,
  kind: user.kind,
  displayName: user.displayName,
  avatarSeed: user.avatarSeed,
  isOrgAdmin: user.isOrgAdmin,
  email: user.email,
  model: user.model,
});
