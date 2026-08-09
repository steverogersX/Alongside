import type {
  agentConnections,
  agentRuns,
  chatMessages,
  documentLinks,
  documents,
  grants,
  orgs,
  chatAccess,
  roleName,
  runStatus,
  sessions,
  users,
  workspaces,
} from "@/db/schema/index.ts";

export type Org = typeof orgs.$inferSelect;
export type User = typeof users.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type Workspace = typeof workspaces.$inferSelect;
export type Document = typeof documents.$inferSelect;
export type Grant = typeof grants.$inferSelect;
export type DocumentLink = typeof documentLinks.$inferSelect;
export type AgentRun = typeof agentRuns.$inferSelect;
export type AgentConnection = typeof agentConnections.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;

export type Role = (typeof roleName.enumValues)[number];
export type ChatAccess = (typeof chatAccess.enumValues)[number];
export type RunStatus = (typeof runStatus.enumValues)[number];

export type PublicUser = Pick<
  User,
  | "id"
  | "orgId"
  | "kind"
  | "displayName"
  | "avatarSeed"
  | "isOrgAdmin"
  | "email"
  | "model"
>;
