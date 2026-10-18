import express, { type Express,  type ErrorRequestHandler } from "express";

const app: Express = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
  });
});

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    console.error(err),
    res.status(500).json({
        status: "error",
        message: "Internal Server Error"
    })
};

app.get("/test-error", (req, res) => {
  throw new Error("Test error");
});

app.use((_req, res) => {
    res.status(404).json({
        status: "error",
        message: "Route not found"
    });
});

app.use(errorHandler);

export default app;