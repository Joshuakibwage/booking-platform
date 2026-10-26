
import { Router, type Router as ExpressRouter } from "express";
import { getCustomerBookings } from "../controllers/customer-bookings.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";


const customerRouter: ExpressRouter = Router();

customerRouter.get(
    "/bookings",
    requireAuth,
    getCustomerBookings,
);

export default customerRouter;
