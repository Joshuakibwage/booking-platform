
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

describe("CORS", () => {
    it("should allow requests from the local frontend", async () => {
        const response = await request(app)
            .get("/health")
            .set("Origin", "http://localhost:3000");

        expect(response.headers["access-control-allow-origin"]).toBe(
            "http://localhost:3000",
        );
        expect(response.headers["access-control-allow-credentials"]).toBe(
            "true",
        );
    });

    it("should not allow an unapproved origin", async () => {
        const response = await request(app)
            .get("/health")
            .set("Origin", "https://malicious.example");

        expect(
            response.headers["access-control-allow-origin"],
        ).toBeUndefined();
    });

    it("should handle preflight requests from the local frontend", async () => {
        const response = await request(app)
            .options("/auth/login")
            .set("Origin", "http://localhost:3000")
            .set("Access-Control-Request-Method", "POST")
            .set("Access-Control-Request-Headers", "content-type");

        expect(response.status).toBe(204);
        expect(response.headers["access-control-allow-origin"]).toBe(
            "http://localhost:3000",
        );
        expect(response.headers["access-control-allow-credentials"]).toBe(
            "true",
        );
    });
});

describe("GET /services", () => {
    beforeEach(() => {
        queryMock.mockReset();
    });

    it("should return public services without authentication", async () => {
        const services = [
            {
                service_id: "service-1",
                professional_id: "professional-1",
                category_id: "category-1",
                name: "Haircut",
                description: "Professional haircut",
                duration_minutes: 45,
                price: "1500.00",
                professional_name: "Alex",
                category_name: "Beauty & personal care",
                category_slug: "beauty-personal-care",
            },
        ];

        queryMock.mockResolvedValueOnce({ rows: services });

        const response = await request(app).get("/services");

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            status: "success",
            data: services,
        });
        expect(queryMock).toHaveBeenCalledOnce();
        expect(queryMock.mock.calls[0]?.[1]).toEqual([null, null]);
    });

    it("should pass search and category filters to the repository", async () => {
        queryMock.mockResolvedValueOnce({ rows: [] });

        const response = await request(app).get(
            "/services?search=haircut&category=beauty-personal-care",
        );

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            status: "success",
            data: [],
        });
        expect(queryMock.mock.calls[0]?.[1]).toEqual([
            "haircut",
            "beauty-personal-care",
        ]);
    });

    it("should reject invalid query parameters", async () => {
        const response = await request(app).get(
            "/services?search=haircut&search=trim",
        );

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            status: "error",
            message: "Invalid service filters.",
        });
        expect(queryMock).not.toHaveBeenCalled();
    });
});