import express, { type Express, } from "express";
import errorHandler from "./error-handler.js";

const app: Express = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
  });
});


app.use((_req, res) => {
    res.status(404).json({
        status: "error",
        message: "Route not found"
    });
});

app.use(errorHandler);

export default app;