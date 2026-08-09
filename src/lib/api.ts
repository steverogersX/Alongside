export type ApiError = {
  code: string;
  message: string;
  details?: { path: string; message: string }[];
};

export type ApiResponse<T> =
  | { success: true; data: T; meta?: Record<string, unknown> }
  | { success: false; error: ApiError };

export class ApiRequestError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details?: { path: string; message: string }[];

  constructor(status: number, error: ApiError) {
    super(error.message);
    this.name = "ApiRequestError";
    this.status = status;
    this.code = error.code;
    this.details = error.details;
  }

  fieldErrors() {
    const map: Record<string, string> = {};
    for (const detail of this.details ?? []) map[detail.path] = detail.message;
    return map;
  }
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export async function api<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "content-type": "application/json",
      ...init.headers,
    },
  });

  let payload: ApiResponse<T>;

  try {
    payload = (await response.json()) as ApiResponse<T>;
  } catch {
    throw new ApiRequestError(response.status, {
      code: "network_error",
      message: "The server sent an unreadable response",
    });
  }

  if (!payload.success) throw new ApiRequestError(response.status, payload.error);

  return payload.data;
}

export const apiPost = <T>(path: string, body: unknown) =>
  api<T>(path, { method: "POST", body: JSON.stringify(body) });

export const apiDelete = <T>(path: string) =>
  api<T>(path, { method: "DELETE" });
