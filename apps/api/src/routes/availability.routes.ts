
import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import { getAvailability } from "../controllers/availability.controller.js";

const router: ExpressRouter = Router();

router.get("/:professionalId/availability", getAvailability);

export default router;
