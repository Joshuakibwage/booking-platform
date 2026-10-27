
import { Router } from "express";
import type { Router as ExpressRouter } from "express";

import { getAvailability } from "../controllers/availability.controller.js";
import { getProfessionalBookings } from "../controllers/professional-bookings.controller.js";
import {
    createProfessionalProfileHandler,
    updateProfessionalProfileHandler,
    getProfessionalProfileHandler,
} from "../controllers/professional-profile.controller.js";
import {
    createServiceHandler,
    updateServiceHandler,
    deactivateServiceHandler,
} from "../controllers/service.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router: ExpressRouter = Router();

router.get("/:professionalId/availability", getAvailability);

router.get("/bookings", requireAuth, getProfessionalBookings);

router.post("/profile", requireAuth, createProfessionalProfileHandler);

router.patch("/profile", requireAuth, updateProfessionalProfileHandler);

router.get("/:professionalId/profile", getProfessionalProfileHandler);

router.post("/services", requireAuth, createServiceHandler);

router.patch("/services/:serviceId", requireAuth, updateServiceHandler);

router.patch("/services/:serviceId/deactivate", requireAuth, deactivateServiceHandler);

export default router;
