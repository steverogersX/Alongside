import type { Role } from "@/db/types.ts";

const RANK: Record<Role, number> = { viewer: 1, editor: 2, admin: 3 };

export const rank = (role: Role) => RANK[role];

export const atLeast = (role: Role, required: Role) =>
  RANK[role] >= RANK[required];

export const lower = (a: Role, b: Role): Role => (RANK[a] <= RANK[b] ? a : b);

export const highest = (roles: Role[]): Role | null =>
  roles.length === 0
    ? null
    : roles.reduce((acc, role) => (RANK[role] > RANK[acc] ? role : acc));
