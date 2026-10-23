
import { Router, type Router as ExpressRouter } from "express";
import { getCustomerBookings } from "../controllers/customer-bookings.controller.js";

const customerRouter: ExpressRouter = Router();

customerRouter.get("/:customerId/bookings", getCustomerBookings);

export default customerRouter;
