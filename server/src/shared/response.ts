import type { Response } from "express";

export type ApiError = {
  code: string;
  message: string;
  details?: unknown;
};

export type ApiMeta = Record<string, unknown>;

export type ApiResponse<T> =
  | { success: true; data: T; meta?: ApiMeta }
  | { success: false; error: ApiError };

export function send<T>(res: Response, status: number, data: T, meta?: ApiMeta) {
  const payload: ApiResponse<T> = meta
    ? { success: true, data, meta }
    : { success: true, data };

  return res.status(status).json(payload);
}

export const ok = <T>(res: Response, data: T, meta?: ApiMeta) =>
  send(res, 200, data, meta);

export const created = <T>(res: Response, data: T, meta?: ApiMeta) =>
  send(res, 201, data, meta);

export const accepted = <T>(res: Response, data: T, meta?: ApiMeta) =>
  send(res, 202, data, meta);

export const fail = (res: Response, status: number, error: ApiError) =>
  res.status(status).json({ success: false, error } satisfies ApiResponse<never>);
