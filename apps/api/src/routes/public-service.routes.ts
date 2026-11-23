import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import {
    getPublicServiceHandler,
    getPublicServicesHandler,
} from "../controllers/public-service.controller.js";

const router: ExpressRouter = Router();

router.get("/", getPublicServicesHandler);
router.get("/:serviceId", getPublicServiceHandler);

export default router;