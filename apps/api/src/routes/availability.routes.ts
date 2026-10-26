
import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import { getAvailability } from "../controllers/availability.controller.js";
import { getProfessionalBookings } from "../controllers/professional-bookings.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router: ExpressRouter = Router();

router.get("/:professionalId/availability", getAvailability);
router.get(
    "/bookings",
    requireAuth,
    getProfessionalBookings,
);

export default router;
