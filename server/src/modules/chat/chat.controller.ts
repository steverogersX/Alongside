import { chatService } from "@/modules/chat/chat.service.ts";
import { postMessageSchema } from "@/modules/chat/chat.schema.ts";
import { created, ok } from "@/shared/response.ts";
import { route } from "@/shared/route.ts";
import { idParams, noQuery, paginationQuery } from "@/shared/validation.ts";

export const chatController = {
  list: route(
    { params: idParams, query: paginationQuery },
    async ({ params, query, user, res }) => {
      const messages = await chatService.list(user, params.id, query);
      ok(res, { messages }, { count: messages.length });
    }
  ),

  post: route(
    { params: idParams, body: postMessageSchema, query: noQuery },
    async ({ params, body, user, res }) => {
      const message = await chatService.post(user, params.id, body);
      created(res, { message });
    }
  ),
};
