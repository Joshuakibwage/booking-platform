
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

import {
    listWeeklyAvailabilityHandler,
    createWeeklyAvailabilityHandler,
    updateWeeklyAvailabilityHandler,
    deleteWeeklyAvailabilityHandler,
} from "../controllers/weekly-availability.controller.js";

import {
    listAvailabilityExceptionsHandler,
    createAvailabilityExceptionHandler,
    updateAvailabilityExceptionHandler,
    deleteAvailabilityExceptionHandler,
} from "../controllers/availability-exception.controller.js";

const router: ExpressRouter = Router();

router.get("/:professionalId/availability", getAvailability);

router.get("/bookings", requireAuth, getProfessionalBookings);

router.post("/profile", requireAuth, createProfessionalProfileHandler);

router.patch("/profile", requireAuth, updateProfessionalProfileHandler);

router.get("/:professionalId/profile", getProfessionalProfileHandler);

router.post("/services", requireAuth, createServiceHandler);

router.patch("/services/:serviceId", requireAuth, updateServiceHandler);

router.patch("/services/:serviceId/deactivate", requireAuth, deactivateServiceHandler);

router.get("/weekly-availability", requireAuth, listWeeklyAvailabilityHandler);

router.post("/weekly-availability", requireAuth, createWeeklyAvailabilityHandler);

router.patch(
    "/weekly-availability/:availabilityId",
    requireAuth,
    updateWeeklyAvailabilityHandler
);

router.delete(
    "/weekly-availability/:availabilityId",
    requireAuth,
    deleteWeeklyAvailabilityHandler,
);

router.get(
    "/exceptions",
    requireAuth,
    listAvailabilityExceptionsHandler,
);

router.post(
    "/exceptions",
    requireAuth,
    createAvailabilityExceptionHandler,
);

router.patch(
    "/exceptions/:exceptionId",
    requireAuth,
    updateAvailabilityExceptionHandler,
);

router.delete(
    "/exceptions/:exceptionId",
    requireAuth,
    deleteAvailabilityExceptionHandler,
);

export default router;
