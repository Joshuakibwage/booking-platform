import express, { type Express, } from "express";
import errorHandler from "./error-handler.js";
import pool from "./db.js";

// routers
import bookingRouter from "./routes/booking.routes.js";
import availabilityRouter from "./routes/availability.routes.js";
import customerRouter from "./routes/customer.routes.js";


const app: Express = express();

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


app.use((_req, res) => {
    res.status(404).json({
        status: "error",
        message: "Route not found"
    });
});

app.use(errorHandler);

export default app;