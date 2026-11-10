import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import { getServiceCategoriesHandler } from "../controllers/service-category.controller.js";

const router: ExpressRouter = Router();

router.get("/", getServiceCategoriesHandler);

export default router;