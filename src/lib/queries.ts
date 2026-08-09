"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { api, apiPost } from "@/lib/api";
import type { SessionUser } from "@/lib/auth";
import type {
  AgentRun,
  ChatAccess,
  ChatMessage,
  DocumentLink,
  DocumentSummary,
  LinkSession,
  Member,
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
  chat: (id: string) => ["chat", id] as const,
  chatAccess: (id: string) => ["chat-access", id] as const,
  runs: (id: string) => ["runs", id] as const,
  links: (id: string) => ["links", id] as const,
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
  });
}

export function useWorkspace(id: string) {
  return useQuery({
    queryKey: keys.workspace(id),
    queryFn: () => api<WorkspaceDetail>(`/workspaces/${id}`),
    enabled: Boolean(id),
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
  });
}

export function useChat(documentId: string) {
  return useQuery({
    queryKey: keys.chat(documentId),
    queryFn: () =>
      api<{ messages: ChatMessage[] }>(`/documents/${documentId}/chat`),
    enabled: Boolean(documentId),
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
    retry: false,
  });
}

export function useRuns(documentId: string) {
  return useQuery({
    queryKey: keys.runs(documentId),
    queryFn: () => api<{ runs: AgentRun[] }>(`/documents/${documentId}/runs`),
    enabled: Boolean(documentId),
  });
}

export function useOrgAgents() {
  return useQuery({
    queryKey: keys.agents,
    queryFn: () => api<{ agents: Member[] }>("/agents"),
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

export function useAddMember(workspaceId: string) {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (input: { userId: string; role: Role }) =>
      apiPost(`/workspaces/${workspaceId}/members`, input),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: keys.workspace(workspaceId) }),
  });
}

export function useSaveDocument(documentId: string) {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (patch: {
      title?: string;
      status?: DocumentSummary["status"];
      content?: unknown;
    }) =>
      api<{ document: DocumentSummary }>(`/documents/${documentId}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      }),
    onSuccess: (data) =>
      client.setQueryData(
        keys.document(documentId),
        (
          previous:
            | { document: DocumentSummary; role: Role; via: "member" | "link" }
            | undefined
        ) => (previous ? { ...previous, document: data.document } : previous)
      ),
  });
}

export function useSendMessage(documentId: string) {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (body: string) =>
      apiPost<{ message: ChatMessage }>(`/documents/${documentId}/chat`, {
        body,
      }),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: keys.chat(documentId) }),
  });
}

export function useStartRun(documentId: string) {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (input: { agentId: string; prompt: string }) =>
      apiPost<{ run: AgentRun }>(`/documents/${documentId}/runs`, input),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: keys.runs(documentId) });
      void client.invalidateQueries({ queryKey: keys.chat(documentId) });
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

export function useLinkSession() {
  return useQuery({
    queryKey: keys.linkSession,
    queryFn: () => api<LinkSession>("/links/session"),
    retry: false,
    staleTime: 5 * 60_000,
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
