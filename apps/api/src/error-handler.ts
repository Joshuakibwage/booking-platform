import type { ErrorRequestHandler } from "express";

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    status: "error",
    message: "Internal Server Error",
  });
};

export default errorHandler;