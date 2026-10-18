import express, { type Express } from "express";

const app: Express = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
  });
});


app.use((_req, res) => {
    res.status(404).json({
        "status": "error",
        "message": "Route not found"
    })
})

export default app;