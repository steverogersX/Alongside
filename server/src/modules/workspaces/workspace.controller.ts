import type { Request, Response } from "express";

import { workspaceService } from "@/modules/workspaces/workspace.service.ts";
import type {
  AddMemberInput,
  CreateDocumentInput,
  CreateWorkspaceInput,
} from "@/modules/workspaces/workspace.schema.ts";
import { body, currentUser, param } from "@/shared/request.ts";
import { created, ok } from "@/shared/response.ts";

export const workspaceController = {
  async list(req: Request, res: Response) {
    const workspaces = await workspaceService.list(currentUser(req));
    ok(res, { workspaces }, { count: workspaces.length });
  },

  async create(req: Request, res: Response) {
    const workspace = await workspaceService.create(
      currentUser(req),
      body<CreateWorkspaceInput>(req)
    );
    created(res, { workspace });
  },

  async detail(req: Request, res: Response) {
    const detail = await workspaceService.detail(
      currentUser(req),
      param(req, "id")
    );
    ok(res, detail);
  },

  async agents(req: Request, res: Response) {
    const agents = await workspaceService.agents(
      currentUser(req),
      param(req, "id")
    );
    ok(res, { agents }, { count: agents.length });
  },

  async addMember(req: Request, res: Response) {
    const grant = await workspaceService.addMember(
      currentUser(req),
      param(req, "id"),
      body<AddMemberInput>(req)
    );
    created(res, { grant });
  },

  async removeMember(req: Request, res: Response) {
    await workspaceService.removeMember(
      currentUser(req),
      param(req, "id"),
      param(req, "userId")
    );
    ok(res, { removed: true });
  },

  async createDocument(req: Request, res: Response) {
    const document = await workspaceService.createDocument(
      currentUser(req),
      param(req, "id"),
      body<CreateDocumentInput>(req)
    );
    created(res, { document });
  },
};
