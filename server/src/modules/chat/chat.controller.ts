import { chatService } from "@/modules/chat/chat.service.ts";
import { postMessageSchema } from "@/modules/chat/chat.schema.ts";
import { created, ok } from "@/shared/response.ts";
import { publicRoute } from "@/shared/route.ts";
import { idParams, noQuery, paginationQuery } from "@/shared/validation.ts";

export const chatController = {
  list: publicRoute(
    { params: idParams, query: paginationQuery },
    async ({ params, query, req, res }) => {
      const messages = await chatService.list(req, params.id, query);
      ok(res, { messages }, { count: messages.length });
    }
  ),

  post: publicRoute(
    { params: idParams, body: postMessageSchema, query: noQuery },
    async ({ params, body, req, res }) => {
      const message = await chatService.post(req, params.id, body);
      created(res, { message });
    }
  ),

  access: publicRoute(
    { params: idParams, query: noQuery },
    async ({ params, req, res }) => {
      ok(res, await chatService.access(req, params.id));
    }
  ),
};
