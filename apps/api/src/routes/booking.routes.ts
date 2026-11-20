
import { Router, type Router as ExpressRouter } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";

import {
    cancelBooking,
    createBooking,
    rescheduleBooking,
} from "../controllers/booking.controller.js";

const bookingRouter: ExpressRouter = Router();

bookingRouter.post("/", requireAuth, createBooking);
bookingRouter.patch("/:bookingId/cancel", requireAuth, cancelBooking);
bookingRouter.patch("/:bookingId/reschedule", requireAuth, rescheduleBooking);

export default bookingRouter;
