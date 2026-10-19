import express, { type Express, } from "express";
import errorHandler from "./error-handler.js";
import pool from "./db.js";

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

app.use((_req, res) => {
    res.status(404).json({
        status: "error",
        message: "Route not found"
    });
});

app.use(errorHandler);

export default app;