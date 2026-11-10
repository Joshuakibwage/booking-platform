
import "./config/env.js";

import cors from "cors";
import express, { type Express } from "express";
import errorHandler from "./error-handler.js";
import pool from "./db.js";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";

// Routers
import bookingRouter from "./routes/booking.routes.js";
import availabilityRouter from "./routes/availability.routes.js";
import customerRouter from "./routes/customer.routes.js";
import authRouter from "./routes/auth.routes.js";
import serviceCategoryRouter from "./routes/service-category.routes.js";
import publicServiceRouter from "./routes/public-service.routes.js";

const app: Express = express();

const allowedOrigins = [
  "http://localhost:3000",
  process.env.FRONTEND_URL,
].filter((origin): origin is string => Boolean(origin));

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

app.set("trust proxy", 1);

const PgSessionStore = connectPgSimple(session);

const sessionSecret = process.env.SESSION_SECRET;

if (!sessionSecret) {
  throw new Error("SESSION_SECRET is not defined");
}

app.use(
  session({
    store: new PgSessionStore({
      pool,
      tableName: "user_sessions",
    }),
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite:
        process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 1000 * 60 * 60 * 24,
    },
  }),
);

app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
  });
});

app.get("/health/db", async (_req, res) => {
  try {
    await pool.query("SELECT 1");

    res.status(200).json({
      status: "ok",
      database: "connected",
    });
  } catch {
    res.status(503).json({
      status: "error",
      database: "disconnected",
    });
  }
});

// Routes
app.use("/bookings", bookingRouter);
app.use("/professionals", availabilityRouter);
app.use("/customers", customerRouter);
app.use("/auth", authRouter);
app.use("/categories", serviceCategoryRouter);
app.use("/services", publicServiceRouter);

app.use((_req, res) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
  });
});

app.use(errorHandler);

export default app;
