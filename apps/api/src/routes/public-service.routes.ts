import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import { getPublicServicesHandler } from "../controllers/public-service.controller.js";

const router: ExpressRouter = Router();

router.get("/", getPublicServicesHandler);

export default router;