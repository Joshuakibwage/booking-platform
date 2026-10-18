import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "./app.js";
import express from "express";
import errorHandler from "./error-handler.js";


const errorTestApp = express();

errorTestApp.get("/trigger-error", (_req, _res, next) => {
  next(new Error("Test error"));
});

errorTestApp.use(errorHandler);

describe("GET /health", () => {
    it("should return a 200 status and an ok message", async () => {
        const response = await request(app).get("/health");

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            status: "ok",
        });
    }),

    it("Should return a 404 for an unknown route", async() => {
        const response = await request(app).get("/unknown");

        expect(response.status).toBe(404);
        expect(response.body).toEqual({
            status: "error",
            message: "Route not found"
        })
    })
});

describe("Error handling", () => {
    it("should return a 500 status and a generic error message", async () => {
        const response = await request(errorTestApp).get("/trigger-error");

        expect(response.status).toBe(500);
        expect(response.body).toEqual({
            status: "error",
            message: "Internal Server Error",
        });
    });
});