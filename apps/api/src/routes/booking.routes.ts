
import { Router, type Router as ExpressRouter } from "express";

import {
    cancelBooking,
    createBooking,
    rescheduleBooking,
} from "../controllers/booking.controller.js";

const bookingRouter: ExpressRouter = Router();

bookingRouter.post("/", createBooking);
bookingRouter.patch("/:bookingId/cancel", cancelBooking);
bookingRouter.patch("/:bookingId/reschedule", rescheduleBooking);

export default bookingRouter;
