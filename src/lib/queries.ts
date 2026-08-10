"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { api, apiDelete, apiPost } from "@/lib/api";
import type { SessionUser } from "@/lib/auth";
import type {
  AgentRun,
  ChatAccess,
  ChatMessage,
  Connection,
  DocumentLink,
  DocumentSummary,
  Member,
  RecentDocument,
  Role,
  Workspace,
  WorkspaceDetail,
} from "@/lib/types";

export const keys = {
  session: ["session"] as const,
  workspaces: ["workspaces"] as const,
  workspace: (id: string) => ["workspace", id] as const,
  agents: ["agents"] as const,
  document: (id: string) => ["document", id] as const,
  documentAgents: (id: string) => ["document-agents", id] as const,
  chat: (id: string) => ["chat", id] as const,
  chatAccess: (id: string) => ["chat-access", id] as const,
  runs: (id: string) => ["runs", id] as const,
  recent: ["recent-documents"] as const,
  links: (id: string) => ["links", id] as const,
  connections: ["connections"] as const,
  linkSession: ["link-session"] as const,
};

export function useSession() {
  return useQuery({
    queryKey: keys.session,
    queryFn: () => api<{ user: SessionUser }>("/auth/me"),
    retry: false,
    staleTime: 5 * 60_000,
  });
}

export function useWorkspaces() {
  return useQuery({
    queryKey: keys.workspaces,
    queryFn: () => api<{ workspaces: Workspace[] }>("/workspaces"),
    staleTime: 60_000,
  });
}

export function useWorkspace(id: string) {
  return useQuery({
    queryKey: keys.workspace(id),
    queryFn: () => api<WorkspaceDetail>(`/workspaces/${id}`),
    enabled: Boolean(id),
    staleTime: 60_000,
  });
}

export function useDocument(id: string) {
  return useQuery({
    queryKey: keys.document(id),
    queryFn: () =>
      api<{
        document: DocumentSummary;
        role: Role;
        via: "member" | "link";
      }>(`/documents/${id}`),
    enabled: Boolean(id),
    staleTime: 30_000,
  });
}

/**
 * Who can be summoned in this document. A member gets the same names from the
 * workspace, but a guest cannot read a workspace at all — and still has to be
 * offered someone when they type @.
 */
export function useDocumentAgents(documentId: string, enabled = true) {
  return useQuery({
    queryKey: keys.documentAgents(documentId),
    queryFn: () =>
      api<{ agents: { agent: Member; role: Role }[] }>(
        `/documents/${documentId}/agents`
      ),
    enabled: enabled && Boolean(documentId),
    staleTime: 60_000,
  });
}

export function useChat(documentId: string, enabled = true, poll = false) {
  return useQuery({
    queryKey: keys.chat(documentId),
    queryFn: () =>
      api<{ messages: ChatMessage[] }>(`/documents/${documentId}/chat`),
    enabled: Boolean(documentId) && enabled,
    refetchInterval: poll ? 2000 : false,
  });
}

export function useChatAccess(documentId: string) {
  return useQuery({
    queryKey: keys.chatAccess(documentId),
    queryFn: () =>
      api<{ chat: ChatAccess; viewerId: string | null }>(
        `/documents/${documentId}/chat/access`
      ),
    enabled: Boolean(documentId),
    staleTime: 60_000,
    retry: false,
  });
}

export function useRuns(documentId: string, poll = false) {
  return useQuery({
    queryKey: keys.runs(documentId),
    queryFn: () => api<{ runs: AgentRun[] }>(`/documents/${documentId}/runs`),
    enabled: Boolean(documentId),
    refetchInterval: poll ? 2000 : false,
  });
}

export function useRecentDocuments(limit = 6) {
  return useQuery({
    queryKey: keys.recent,
    queryFn: () =>
      api<{ documents: RecentDocument[] }>(`/documents/recent?limit=${limit}`),
    staleTime: 30_000,
  });
}

export function useCreateWorkspace() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (input: { name: string; purpose?: string }) =>
      apiPost<{ workspace: Workspace }>("/workspaces", input),
    onSuccess: () => client.invalidateQueries({ queryKey: keys.workspaces }),
  });
}

export function useCreateDocument(workspaceId: string) {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (input: { title: string }) =>
      apiPost<{ document: DocumentSummary }>(
        `/workspaces/${workspaceId}/documents`,
        input
      ),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: keys.workspace(workspaceId) }),
  });
}

/**
 * Deleting takes every document in the room with it, so the caches that could
 * still be holding one — the workspace itself, the home list, recents — are
 * dropped rather than refetched.
 */
export function useDeleteWorkspace() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (workspaceId: string) =>
      apiDelete<{ deleted: true }>(`/workspaces/${workspaceId}`),
    onSuccess: (_data, workspaceId) => {
      client.removeQueries({ queryKey: keys.workspace(workspaceId) });
      void client.invalidateQueries({ queryKey: keys.workspaces });
      void client.invalidateQueries({ queryKey: keys.recent });
    },
  });
}

export function useDeleteDocument(workspaceId?: string) {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (documentId: string) =>
      apiDelete<{ deleted: true }>(`/documents/${documentId}`),
    onSuccess: (_data, documentId) => {
      client.removeQueries({ queryKey: keys.document(documentId) });
      void client.invalidateQueries({ queryKey: keys.recent });
      if (workspaceId) {
        void client.invalidateQueries({ queryKey: keys.workspace(workspaceId) });
      }
    },
  });
}

export function useAddMember(workspaceId: string) {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (input: { userId: string; role: Role }) =>
      apiPost(`/workspaces/${workspaceId}/members`, input),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: keys.workspace(workspaceId) }),
  });
}

export function useConnections(poll = false) {
  return useQuery({
    queryKey: keys.connections,
    queryFn: () => api<{ connections: Connection[] }>("/connections"),
    staleTime: 30_000,
    refetchInterval: poll ? 2000 : false,
  });
}

export function useCreateAgent() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      displayName: string;
      model: string;
      provider: string;
      apiKey: string;
      baseUrl?: string;
    }) => apiPost<{ agent: Member }>("/agents", input),
    onSuccess: () => client.invalidateQueries({ queryKey: keys.agents }),
  });
}

export function useRemoveAgent(workspaceId: string) {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (agentId: string) => apiDelete(`/agents/${agentId}`),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: keys.agents });
      void client.invalidateQueries({ queryKey: keys.workspace(workspaceId) });
    },
  });
}

export function useCancelRun(documentId: string) {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (runId: string) =>
      apiPost<{ run: AgentRun }>(
        `/documents/${documentId}/runs/${runId}/cancel`,
        {}
      ),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: keys.runs(documentId) });
      void client.invalidateQueries({ queryKey: keys.chat(documentId) });
    },
  });
}

export function useSendMessage(documentId: string) {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (body: string) =>
      apiPost<{ message: ChatMessage; run: AgentRun | null }>(
        `/documents/${documentId}/chat`,
        { body }
      ),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: keys.chat(documentId) });
      void client.invalidateQueries({ queryKey: keys.runs(documentId) });
    },
  });
}

export function useLogout() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: () => apiPost("/auth/logout", {}),
    onSuccess: () => client.clear(),
  });
}

export function useDocumentLinks(documentId: string, enabled = true) {
  return useQuery({
    queryKey: keys.links(documentId),
    queryFn: () => api<{ links: DocumentLink[] }>(`/documents/${documentId}/links`),
    enabled: enabled && Boolean(documentId),
  });
}

export function useCreateLink(documentId: string) {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      role: "viewer" | "editor";
      chatAccess: ChatAccess;
      label?: string;
      expiresInDays?: number;
    }) =>
      apiPost<{ link: DocumentLink; token: string }>(
        `/documents/${documentId}/links`,
        input
      ),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: keys.links(documentId) }),
  });
}

export function useRevokeLink(documentId: string) {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (linkId: string) =>
      api<{ link: DocumentLink }>(`/documents/${documentId}/links/${linkId}`, {
        method: "DELETE",
      }),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: keys.links(documentId) }),
  });
}
