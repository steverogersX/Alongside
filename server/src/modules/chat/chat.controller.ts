import type { Request, Response } from "express";

import { chatService } from "@/modules/chat/chat.service.ts";
import type { PostMessageInput } from "@/modules/chat/chat.schema.ts";
import { body, currentUser, param, query } from "@/shared/request.ts";
import { created, ok } from "@/shared/response.ts";
import type { PaginationQuery } from "@/shared/validation.ts";

export const chatController = {
  async list(req: Request, res: Response) {
    const messages = await chatService.list(
      currentUser(req),
      param(req, "id"),
      query<PaginationQuery>(req)
    );
    ok(res, { messages }, { count: messages.length });
  },

  async post(req: Request, res: Response) {
    const message = await chatService.post(
      currentUser(req),
      param(req, "id"),
      body<PostMessageInput>(req)
    );
    created(res, { message });
  },
};
