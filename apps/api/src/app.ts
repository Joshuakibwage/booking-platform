
import dotenv from "dotenv";
import { resolve } from "node:path";

dotenv.config({
    path: resolve(process.cwd(), "../../.env.local"),
});

import express, { type Express, } from "express";
import errorHandler from "./error-handler.js";
import pool from "./db.js";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";

// routers
import bookingRouter from "./routes/booking.routes.js";
import availabilityRouter from "./routes/availability.routes.js";
import customerRouter from "./routes/customer.routes.js";
import authRouter from "./routes/auth.routes.js";


const app: Express = express();

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
            sameSite: "lax",
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


// routes
app.use("/bookings", bookingRouter);
app.use("/professionals", availabilityRouter);
app.use("/customers", customerRouter);
app.use("/auth", authRouter);


app.use((_req, res) => {
    res.status(404).json({
        status: "error",
        message: "Route not found"
    });
});

app.use(errorHandler);

export default app;