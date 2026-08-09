export type Role = "viewer" | "editor" | "admin";

export type Member = {
  id: string;
  orgId: string;
  kind: "human" | "bot";
  displayName: string;
  avatarSeed: string;
  isOrgAdmin: boolean;
  email: string | null;
  model: string | null;
};

export type Workspace = {
  id: string;
  orgId: string;
  name: string;
  purpose: string | null;
  createdBy: string;
  createdAt: string;
};

export type DocumentSummary = {
  id: string;
  workspaceId: string;
  title: string;
  status: "draft" | "in_review" | "final";
  content: unknown;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type WorkspaceDetail = {
  workspace: Workspace;
  role: Role;
  members: { user: Member; role: Role }[];
  documents: DocumentSummary[];
};

export type ChatAccess = "none" | "read" | "write";

export type ChatMessage = {
  id: string;
  documentId: string;
  authorId: string | null;
  body: string;
  runId: string | null;
  createdAt: string;
  author: Member & { isGuest: boolean };
};

export type AgentRun = {
  id: string;
  documentId: string;
  agentId: string;
  invokedBy: string;
  prompt: string;
  ceiling: Role;
  status:
    | "queued"
    | "running"
    | "succeeded"
    | "failed"
    | "cancelled"
    | "proposed"
    | "accepted"
    | "discarded";
  proposal: unknown;
  summary: string | null;
  error: string | null;
  connectionId: string | null;
  triggerMessageId: string | null;
  decidedBy: string | null;
  createdAt: string;
  endedAt: string | null;
};

export type DocumentLink = {
  id: string;
  documentId: string;
  role: "viewer" | "editor";
  chatAccess: ChatAccess;
  label: string | null;
  expiresAt: string | null;
  revokedAt: string | null;
  createdBy: string;
  createdAt: string;
};

export type LinkSession = {
  documentId: string;
  role: Role;
};

export type Connection = {
  id: string;
  label: string;
  agentId: string;
  agentName: string;
  model: string | null;
  workspaceIds: string[] | null;
  lastSeenAt: string | null;
  revokedAt: string | null;
  createdAt: string;
};
