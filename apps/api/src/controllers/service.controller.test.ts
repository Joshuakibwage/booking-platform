
import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import express from "express";
import type { Request, Response, NextFunction } from "express";

const {
    createServiceMock,
    updateServiceMock,
    deactivateServiceMock,
    findProfessionalProfileIdByUserIdMock,
} = vi.hoisted(() => ({
    createServiceMock: vi.fn(),
    updateServiceMock: vi.fn(),
    deactivateServiceMock: vi.fn(),
    findProfessionalProfileIdByUserIdMock: vi.fn(),
}));

vi.mock("../repositories/service.repository.js", () => ({
    createService: createServiceMock,
    updateService: updateServiceMock,
    deactivateService: deactivateServiceMock,
}));

vi.mock("../repositories/professional-profile.repository.js", () => ({
    findProfessionalProfileIdByUserId:
        findProfessionalProfileIdByUserIdMock,
}));

import {
    createServiceHandler,
    updateServiceHandler,
    deactivateServiceHandler,
} from "./service.controller.js";

const userId = "550e8400-e29b-41d4-a716-446655440000";
const professionalId = "7ba7b810-9dad-41d1-80b4-00c04fd430c8";
const serviceId = "3ba7b810-9dad-41d1-80b4-00c04fd430c8";

const app = express();

app.use(express.json());

app.use((req: Request, _res: Response, next: NextFunction) => {
    req.session = { user: { userId } } as Request["session"];
    next();
});

app.post("/professionals/services", createServiceHandler);
app.patch("/professionals/services/:serviceId", updateServiceHandler);
app.patch(
    "/professionals/services/:serviceId/deactivate",
    deactivateServiceHandler,
);

describe("POST /professionals/services", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        findProfessionalProfileIdByUserIdMock.mockResolvedValue(
            professionalId,
        );
    });

    it("creates a service for the authenticated professional", async () => {
        const service = {
            service_id: serviceId,
            professional_id: professionalId,
            name: "Haircut",
            description: "A standard haircut",
            duration_minutes: 30,
            price: "500.00",
            is_active: true,
            created_at: new Date("2026-10-27T07:00:00.000Z"),
        };

        createServiceMock.mockResolvedValue(service);

        const response = await request(app)
            .post("/professionals/services")
            .send({
                name: "Haircut",
                description: "A standard haircut",
                durationMinutes: 30,
                price: 500,
            });

        expect(response.status).toBe(201);
        expect(response.body.status).toBe("success");
        expect(response.body.data.service_id).toBe(serviceId);

        expect(findProfessionalProfileIdByUserIdMock).toHaveBeenCalledWith(
            userId,
        );

        expect(createServiceMock).toHaveBeenCalledWith({
            professionalId,
            name: "Haircut",
            description: "A standard haircut",
            durationMinutes: 30,
            price: 500,
        });
    });

    it("rejects invalid input without querying the database", async () => {
        const response = await request(app)
            .post("/professionals/services")
            .send({
                name: "Haircut",
                durationMinutes: 0,
                price: 500,
            });

        expect(response.status).toBe(400);
        expect(createServiceMock).not.toHaveBeenCalled();
        expect(
            findProfessionalProfileIdByUserIdMock,
        ).not.toHaveBeenCalled();
    });

    it("rejects creation when the user has no professional profile", async () => {
        findProfessionalProfileIdByUserIdMock.mockResolvedValue(null);

        const response = await request(app)
            .post("/professionals/services")
            .send({
                name: "Haircut",
                durationMinutes: 30,
                price: 500,
            });

        expect(response.status).toBe(403);
        expect(response.body.message).toBe("Professional profile required");
        expect(createServiceMock).not.toHaveBeenCalled();
    });

    it("forwards repository errors to Express error handling", async () => {
        createServiceMock.mockRejectedValue(new Error("Database failure"));

        const errorApp = express();
        errorApp.use(express.json());
        errorApp.use((req: Request, _res: Response, next: NextFunction) => {
            req.session = { user: { userId } } as Request["session"];
            next();
        });

        errorApp.post("/professionals/services", createServiceHandler);

        errorApp.use((
            error: Error,
            _req: Request,
            res: Response,
            _next: NextFunction,
        ) => {
            res.status(500).json({ message: error.message });
        });

        const response = await request(errorApp)
            .post("/professionals/services")
            .send({
                name: "Haircut",
                durationMinutes: 30,
                price: 500,
            });

        expect(response.status).toBe(500);
        expect(response.body.message).toBe("Database failure");
    });
});

describe("PATCH /professionals/services/:serviceId", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        findProfessionalProfileIdByUserIdMock.mockResolvedValue(
            professionalId,
        );
    });

    it("updates a service using the authenticated professional's profile", async () => {
        const updatedService = {
            service_id: serviceId,
            professional_id: professionalId,
            name: "Premium Haircut",
            description: null,
            duration_minutes: 45,
            price: "750.00",
            is_active: true,
            created_at: new Date("2026-10-27T07:00:00.000Z"),
        };

        updateServiceMock.mockResolvedValue(updatedService);

        const response = await request(app)
            .patch(`/professionals/services/${serviceId}`)
            .send({ price: 750 });

        expect(response.status).toBe(200);
        expect(response.body.status).toBe("success");
        expect(response.body.data.name).toBe("Premium Haircut");

        expect(findProfessionalProfileIdByUserIdMock).toHaveBeenCalledWith(
            userId,
        );

        expect(updateServiceMock).toHaveBeenCalledWith({
            serviceId,
            professionalId,
            price: 750,
        });
    });

    it("rejects invalid update input", async () => {
        const response = await request(app)
            .patch(`/professionals/services/${serviceId}`)
            .send({ price: -10 });

        expect(response.status).toBe(400);
        expect(updateServiceMock).not.toHaveBeenCalled();
        expect(
            findProfessionalProfileIdByUserIdMock,
        ).not.toHaveBeenCalled();
    });

    it("returns 403 when the user has no professional profile", async () => {
        findProfessionalProfileIdByUserIdMock.mockResolvedValue(null);

        const response = await request(app)
            .patch(`/professionals/services/${serviceId}`)
            .send({ price: 750 });

        expect(response.status).toBe(403);
        expect(response.body.message).toBe("Professional profile required");
        expect(updateServiceMock).not.toHaveBeenCalled();
    });

    it("returns 404 when the service cannot be updated", async () => {
        updateServiceMock.mockResolvedValue(null);

        const response = await request(app)
            .patch(`/professionals/services/${serviceId}`)
            .send({ price: 750 });

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Service not found");
    });

    it("forwards repository errors to Express error handling", async () => {
        updateServiceMock.mockRejectedValue(
            new Error("Database failure"),
        );

        const errorApp = express();
        errorApp.use(express.json());
        errorApp.use((req: Request, _res: Response, next: NextFunction) => {
            req.session = { user: { userId } } as Request["session"];
            next();
        });

        errorApp.patch(
            "/professionals/services/:serviceId",
            updateServiceHandler,
        );

        errorApp.use((
            error: Error,
            _req: Request,
            res: Response,
            _next: NextFunction,
        ) => {
            res.status(500).json({ message: error.message });
        });

        const response = await request(errorApp)
            .patch(`/professionals/services/${serviceId}`)
            .send({ price: 750 });

        expect(response.status).toBe(500);
        expect(response.body.message).toBe("Database failure");
    });
});



describe("PATCH /professionals/services/:serviceId/deactivate", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        findProfessionalProfileIdByUserIdMock.mockResolvedValue(
            professionalId,
        );
    });

    it("deactivates a service belonging to the authenticated professional", async () => {
        const deactivatedService = {
            service_id: serviceId,
            professional_id: professionalId,
            name: "Haircut",
            description: "A standard haircut",
            duration_minutes: 30,
            price: "500.00",
            is_active: false,
            created_at: new Date("2026-10-27T07:00:00.000Z"),
        };

        deactivateServiceMock.mockResolvedValue(deactivatedService);

        const response = await request(app).patch(
            `/professionals/services/${serviceId}/deactivate`,
        );

        expect(response.status).toBe(200);
        expect(response.body.status).toBe("success");
        expect(response.body.data.is_active).toBe(false);

        expect(findProfessionalProfileIdByUserIdMock).toHaveBeenCalledWith(
            userId,
        );

        expect(deactivateServiceMock).toHaveBeenCalledWith(
            serviceId,
            professionalId,
        );
    });

    it("returns 403 when the user has no professional profile", async () => {
        findProfessionalProfileIdByUserIdMock.mockResolvedValue(null);

        const response = await request(app).patch(
            `/professionals/services/${serviceId}/deactivate`,
        );

        expect(response.status).toBe(403);
        expect(response.body.message).toBe("Professional profile required");
        expect(deactivateServiceMock).not.toHaveBeenCalled();
    });

    it("returns 404 when the service cannot be deactivated", async () => {
        deactivateServiceMock.mockResolvedValue(null);

        const response = await request(app).patch(
            `/professionals/services/${serviceId}/deactivate`,
        );

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Service not found");

        expect(deactivateServiceMock).toHaveBeenCalledWith(
            serviceId,
            professionalId,
        );
    });

    it("forwards repository errors to Express error handling", async () => {
        deactivateServiceMock.mockRejectedValue(
            new Error("Database failure"),
        );

        const errorApp = express();
        errorApp.use(express.json());

        errorApp.use((req: Request, _res: Response, next: NextFunction) => {
            req.session = { user: { userId } } as Request["session"];
            next();
        });

        errorApp.patch(
            "/professionals/services/:serviceId/deactivate",
            deactivateServiceHandler,
        );

        errorApp.use((
            error: Error,
            _req: Request,
            res: Response,
            _next: NextFunction,
        ) => {
            res.status(500).json({ message: error.message });
        });

        const response = await request(errorApp).patch(
            `/professionals/services/${serviceId}/deactivate`,
        );

        expect(response.status).toBe(500);
        expect(response.body.message).toBe("Database failure");
    });
});
