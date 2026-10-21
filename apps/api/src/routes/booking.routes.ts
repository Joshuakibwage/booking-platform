
import { Router, type Router as ExpressRouter } from "express";
import { createBooking } from "../controllers/booking.controller.js";

const bookingRouter: ExpressRouter = Router();

bookingRouter.post("/", createBooking);

export default bookingRouter;
