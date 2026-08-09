import { Router } from "express";

import { requireUser } from "@/middleware/auth.ts";
import { connectionController } from "@/modules/connections/connection.controller.ts";

export const connectionRoutes = Router();

connectionRoutes.use(requireUser);

connectionRoutes.get("/", connectionController.list);
connectionRoutes.post("/", connectionController.create);
connectionRoutes.delete("/:id", connectionController.revoke);
