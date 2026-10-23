
import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import { getAvailability } from "../controllers/availability.controller.js";
import { getProfessionalBookings } from "../controllers/professional-bookings.controller.js";

const router: ExpressRouter = Router();

router.get("/:professionalId/availability", getAvailability);
router.get("/:professionalId/bookings", getProfessionalBookings);

export default router;
