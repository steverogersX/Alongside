import { Router } from "express";

import { linkController } from "@/modules/links/link.controller.ts";

export const linkRoutes = Router();

linkRoutes.get("/session", linkController.session);
linkRoutes.post("/leave", linkController.leave);
linkRoutes.post("/:token/redeem", linkController.redeem);
