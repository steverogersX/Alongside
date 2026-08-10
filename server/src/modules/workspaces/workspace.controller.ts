import { workspaceService } from "@/modules/workspaces/workspace.service.ts";
import {
  addMemberSchema,
  createDocumentSchema,
  createWorkspaceSchema,
  memberParams,
} from "@/modules/workspaces/workspace.schema.ts";
import { created, ok } from "@/shared/response.ts";
import { route } from "@/shared/route.ts";
import { idParams, noQuery } from "@/shared/validation.ts";

export const workspaceController = {
  list: route({ query: noQuery }, async ({ user, res }) => {
    const workspaces = await workspaceService.list(user);
    ok(res, { workspaces }, { count: workspaces.length });
  }),

  create: route(
    { body: createWorkspaceSchema, query: noQuery },
    async ({ body, user, res }) => {
      const workspace = await workspaceService.create(user, body);
      created(res, { workspace });
    }
  ),

  detail: route(
    { params: idParams, query: noQuery },
    async ({ params, user, res }) => {
      ok(res, await workspaceService.detail(user, params.id));
    }
  ),

  remove: route(
    { params: idParams, query: noQuery },
    async ({ params, user, res }) => {
      await workspaceService.remove(user, params.id);
      ok(res, { deleted: true });
    }
  ),

  agents: route(
    { params: idParams, query: noQuery },
    async ({ params, user, res }) => {
      const agents = await workspaceService.agents(user, params.id);
      ok(res, { agents }, { count: agents.length });
    }
  ),

  addMember: route(
    { params: idParams, body: addMemberSchema, query: noQuery },
    async ({ params, body, user, res }) => {
      const grant = await workspaceService.addMember(user, params.id, body);
      created(res, { grant });
    }
  ),

  removeMember: route(
    { params: memberParams, query: noQuery },
    async ({ params, user, res }) => {
      await workspaceService.removeMember(user, params.id, params.userId);
      ok(res, { removed: true });
    }
  ),

  createDocument: route(
    { params: idParams, body: createDocumentSchema, query: noQuery },
    async ({ params, body, user, res }) => {
      const document = await workspaceService.createDocument(
        user,
        params.id,
        body
      );
      created(res, { document });
    }
  ),
};
