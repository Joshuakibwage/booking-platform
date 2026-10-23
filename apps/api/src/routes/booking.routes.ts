
import { Router, type Router as ExpressRouter } from "express";
import {
    cancelBooking,
    createBooking,
} from "../controllers/booking.controller.js";

const bookingRouter: ExpressRouter = Router();

bookingRouter.post("/", createBooking);
bookingRouter.patch("/:bookingId/cancel", cancelBooking);

export default bookingRouter;
