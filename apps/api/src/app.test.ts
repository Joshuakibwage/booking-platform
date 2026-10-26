
import { beforeEach, describe, it, expect, vi } from "vitest";
import request from "supertest";
import express from "express";
import app from "./app.js";
import errorHandler from "./error-handler.js";

const { queryMock, registerUserMock } = vi.hoisted(() => ({
    queryMock: vi.fn(),
    registerUserMock: vi.fn(),
}));

vi.mock("./db.js", () => ({
    default: {
        query: queryMock,
    },
}));

vi.mock("./services/auth.service.js", () => ({
    registerUser: registerUserMock,
}));

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
    });

    it("should return a 404 for an unknown route", async () => {
        const response = await request(app).get("/unknown");

        expect(response.status).toBe(404);
        expect(response.body).toEqual({
            status: "error",
            message: "Route not found",
        });
    });
});

describe("GET /health/db", () => {
    beforeEach(() => {
        queryMock.mockReset();
    });

    it("should return 200 when the database is connected", async () => {
        queryMock.mockResolvedValueOnce({ rows: [] });

        const response = await request(app).get("/health/db");

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            status: "ok",
            database: "connected",
        });
        expect(queryMock).toHaveBeenCalledWith("SELECT 1");
    });

    it("should return 503 when the database query fails", async () => {
        queryMock.mockRejectedValueOnce(
            new Error("Database unavailable"),
        );

        const response = await request(app).get("/health/db");

        expect(response.status).toBe(503);
        expect(response.body).toEqual({
            status: "error",
            database: "disconnected",
        });
    });
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

describe("POST /auth/register", () => {
    beforeEach(() => {
        registerUserMock.mockReset();
    });

    it("should return 400 for invalid registration input", async () => {
        const response = await request(app)
            .post("/auth/register")
            .send({
                email: "not-an-email",
                password: "short",
                displayName: "",
            });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            status: "error",
            message: "Invalid registration request",
        });
        expect(registerUserMock).not.toHaveBeenCalled();
    });

    it("should return 409 when the email is already registered", async () => {
        registerUserMock.mockRejectedValueOnce({
            code: "23505",
        });

        const response = await request(app)
            .post("/auth/register")
            .send({
                email: "joe@example.com",
                password: "secure-password-123",
                displayName: "Joe Kibwage",
            });

        expect(response.status).toBe(409);
        expect(response.body).toEqual({
            status: "error",
            message: "Email address is already registered",
        });
    });
});
