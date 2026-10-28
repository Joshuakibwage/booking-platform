import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import express from "express";
import type { Request, Response, NextFunction } from "express";

const {
    listAvailabilityExceptionsMock,
    createAvailabilityExceptionMock,
    updateAvailabilityExceptionMock,
    deleteAvailabilityExceptionMock,
    findProfessionalProfileIdByUserIdMock,
} = vi.hoisted(() => ({
    listAvailabilityExceptionsMock: vi.fn(),
    createAvailabilityExceptionMock: vi.fn(),
    updateAvailabilityExceptionMock: vi.fn(),
    deleteAvailabilityExceptionMock: vi.fn(),
    findProfessionalProfileIdByUserIdMock: vi.fn(),
}));

vi.mock("../repositories/availability.repository.js", () => ({
    listAvailabilityExceptions: listAvailabilityExceptionsMock,
    createAvailabilityException: createAvailabilityExceptionMock,
    updateAvailabilityException: updateAvailabilityExceptionMock,
    deleteAvailabilityException: deleteAvailabilityExceptionMock,
}));

vi.mock("../repositories/professional-profile.repository.js", () => ({
    findProfessionalProfileIdByUserId:
        findProfessionalProfileIdByUserIdMock,
}));

import {
    listAvailabilityExceptionsHandler,
    createAvailabilityExceptionHandler,
    updateAvailabilityExceptionHandler,
    deleteAvailabilityExceptionHandler,
} from "./availability-exception.controller.js";

const userId = "550e8400-e29b-41d4-a716-446655440000";
const professionalId = "7ba7b810-9dad-41d1-80b4-00c04fd430c8";

const app = express();

app.use(express.json());

app.use((req: Request, _res: Response, next: NextFunction) => {
    req.session = { user: { userId } } as Request["session"];
    next();
});

app.get(
    "/professionals/availability/exceptions",
    listAvailabilityExceptionsHandler,
);

app.post(
    "/professionals/availability/exceptions",
    createAvailabilityExceptionHandler,
);

app.patch(
    "/professionals/availability/exceptions/:exceptionId",
    updateAvailabilityExceptionHandler,
);

app.delete(
    "/professionals/availability/exceptions/:exceptionId",
    deleteAvailabilityExceptionHandler,
);

describe("GET /professionals/availability/exceptions", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        findProfessionalProfileIdByUserIdMock.mockResolvedValue(
            professionalId,
        );
    });

    it("returns exceptions for the authenticated professional", async () => {
        const exceptions = [
            {
                exception_id: "9ba7b810-9dad-41d1-80b4-00c04fd430c8",
                professional_id: professionalId,
                exception_date: "2026-12-25",
                is_available: false,
                start_time: null,
                end_time: null,
                reason: "Holiday",
            },
        ];

        listAvailabilityExceptionsMock.mockResolvedValue(exceptions);

        const response = await request(app).get(
            "/professionals/availability/exceptions",
        );

        expect(response.status).toBe(200);
        expect(response.body.status).toBe("success");
        expect(response.body.data).toEqual(exceptions);

        expect(findProfessionalProfileIdByUserIdMock).toHaveBeenCalledWith(
            userId,
        );
        expect(listAvailabilityExceptionsMock).toHaveBeenCalledWith(
            professionalId,
        );
    });

    it("returns 403 when the user has no professional profile", async () => {
        findProfessionalProfileIdByUserIdMock.mockResolvedValue(null);

        const response = await request(app).get(
            "/professionals/availability/exceptions",
        );

        expect(response.status).toBe(403);
        expect(response.body.message).toBe("Professional profile required");
        expect(listAvailabilityExceptionsMock).not.toHaveBeenCalled();
    });
});

describe("POST /professionals/availability/exceptions", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        findProfessionalProfileIdByUserIdMock.mockResolvedValue(
            professionalId,
        );
    });

    it("creates a date-specific exception for the authenticated professional", async () => {
        const exception = {
            exception_id: "9ba7b810-9dad-41d1-80b4-00c04fd430c8",
            professional_id: professionalId,
            exception_date: "2026-12-25",
            is_available: false,
            start_time: null,
            end_time: null,
            reason: "Holiday",
        };

        createAvailabilityExceptionMock.mockResolvedValue(exception);

        const response = await request(app)
            .post("/professionals/availability/exceptions")
            .send({
                exceptionDate: "2026-12-25",
                isAvailable: false,
                startTime: null,
                endTime: null,
                reason: "Holiday",
            });

        expect(response.status).toBe(201);
        expect(response.body.status).toBe("success");
        expect(response.body.data).toEqual(exception);

        expect(findProfessionalProfileIdByUserIdMock).toHaveBeenCalledWith(
            userId,
        );

        expect(createAvailabilityExceptionMock).toHaveBeenCalledWith({
            professionalId,
            exceptionDate: "2026-12-25",
            isAvailable: false,
            startTime: null,
            endTime: null,
            reason: "Holiday",
        });
    });

    it("rejects invalid input without querying the database", async () => {
        const response = await request(app)
            .post("/professionals/availability/exceptions")
            .send({
                exceptionDate: "2026-02-30",
                isAvailable: false,
                startTime: null,
                endTime: null,
            });

        expect(response.status).toBe(400);
        expect(response.body.status).toBe("error");

        expect(createAvailabilityExceptionMock).not.toHaveBeenCalled();
        expect(findProfessionalProfileIdByUserIdMock).not.toHaveBeenCalled();
    });

    it("returns 403 when the user has no professional profile", async () => {
        findProfessionalProfileIdByUserIdMock.mockResolvedValue(null);

        const response = await request(app)
            .post("/professionals/availability/exceptions")
            .send({
                exceptionDate: "2026-12-25",
                isAvailable: false,
                startTime: null,
                endTime: null,
                reason: "Holiday",
            });

        expect(response.status).toBe(403);
        expect(response.body.message).toBe("Professional profile required");
        expect(createAvailabilityExceptionMock).not.toHaveBeenCalled();
    });

    it("returns 409 when an exception already exists for that date", async () => {
        createAvailabilityExceptionMock.mockRejectedValue({
            code: "23505",
        });

        const response = await request(app)
            .post("/professionals/availability/exceptions")
            .send({
                exceptionDate: "2026-12-25",
                isAvailable: false,
                startTime: null,
                endTime: null,
            });

        expect(response.status).toBe(409);
        expect(response.body.status).toBe("error");
        expect(response.body.message).toBe(
            "An availability exception already exists for this date",
        );
    });
});

describe("PATCH /professionals/availability/exceptions/:exceptionId", () => {
    const exceptionId = "9ba7b810-9dad-41d1-80b4-00c04fd430c8";

    beforeEach(() => {
        vi.clearAllMocks();

        findProfessionalProfileIdByUserIdMock.mockResolvedValue(
            professionalId,
        );
    });

    it("updates an exception belonging to the authenticated professional", async () => {
        const updatedException = {
            exception_id: exceptionId,
            professional_id: professionalId,
            exception_date: "2026-12-25",
            is_available: true,
            start_time: "10:00:00",
            end_time: "14:00:00",
            reason: "Shortened holiday hours",
        };

        updateAvailabilityExceptionMock.mockResolvedValue(updatedException);

        const response = await request(app)
            .patch(`/professionals/availability/exceptions/${exceptionId}`)
            .send({
                exceptionDate: "2026-12-25",
                isAvailable: true,
                startTime: "10:00",
                endTime: "14:00",
                reason: "Shortened holiday hours",
            });

        expect(response.status).toBe(200);
        expect(response.body.status).toBe("success");
        expect(response.body.data).toEqual(updatedException);

        expect(updateAvailabilityExceptionMock).toHaveBeenCalledWith({
            exceptionId,
            professionalId,
            exceptionDate: "2026-12-25",
            isAvailable: true,
            startTime: "10:00",
            endTime: "14:00",
            reason: "Shortened holiday hours",
        });
    });

    it("rejects invalid update input", async () => {
        const response = await request(app)
            .patch(`/professionals/availability/exceptions/${exceptionId}`)
            .send({
                exceptionDate: "2026-02-30",
                isAvailable: true,
                startTime: "10:00",
                endTime: "14:00",
            });

        expect(response.status).toBe(400);
        expect(response.body.status).toBe("error");
        expect(updateAvailabilityExceptionMock).not.toHaveBeenCalled();
        expect(findProfessionalProfileIdByUserIdMock).not.toHaveBeenCalled();
    });

    it("returns 404 when the exception does not exist or belongs to another professional", async () => {
        updateAvailabilityExceptionMock.mockResolvedValue(null);

        const response = await request(app)
            .patch(`/professionals/availability/exceptions/${exceptionId}`)
            .send({
                exceptionDate: "2026-12-25",
                isAvailable: true,
                startTime: "10:00",
                endTime: "14:00",
            });

        expect(response.status).toBe(404);
        expect(response.body.message).toBe(
            "Availability exception not found",
        );
    });

    it("returns 409 when an exception already exists for the updated date", async () => {
        updateAvailabilityExceptionMock.mockRejectedValue({
            code: "23505",
        });

        const response = await request(app)
            .patch(`/professionals/availability/exceptions/${exceptionId}`)
            .send({
                exceptionDate: "2026-12-25",
                isAvailable: true,
                startTime: "10:00",
                endTime: "14:00",
            });

        expect(response.status).toBe(409);
        expect(response.body.message).toBe(
            "An availability exception already exists for this date",
        );
    });
});

describe("DELETE /professionals/availability/exceptions/:exceptionId", () => {
    const exceptionId = "9ba7b810-9dad-41d1-80b4-00c04fd430c8";

    beforeEach(() => {
        vi.clearAllMocks();

        findProfessionalProfileIdByUserIdMock.mockResolvedValue(
            professionalId,
        );
    });

    it("deletes an exception belonging to the authenticated professional", async () => {
        deleteAvailabilityExceptionMock.mockResolvedValue(true);

        const response = await request(app).delete(
            `/professionals/availability/exceptions/${exceptionId}`,
        );

        expect(response.status).toBe(200);
        expect(response.body.status).toBe("success");
        expect(response.body.message).toBe(
            "Availability exception deleted",
        );

        expect(findProfessionalProfileIdByUserIdMock).toHaveBeenCalledWith(
            userId,
        );
        expect(deleteAvailabilityExceptionMock).toHaveBeenCalledWith(
            exceptionId,
            professionalId,
        );
    });

    it("returns 404 when the exception does not exist or belongs to another professional", async () => {
        deleteAvailabilityExceptionMock.mockResolvedValue(false);

        const response = await request(app).delete(
            `/professionals/availability/exceptions/${exceptionId}`,
        );

        expect(response.status).toBe(404);
        expect(response.body.message).toBe(
            "Availability exception not found",
        );
    });

    it("returns 403 when the user has no professional profile", async () => {
        findProfessionalProfileIdByUserIdMock.mockResolvedValue(null);

        const response = await request(app).delete(
            `/professionals/availability/exceptions/${exceptionId}`,
        );

        expect(response.status).toBe(403);
        expect(response.body.message).toBe("Professional profile required");
        expect(deleteAvailabilityExceptionMock).not.toHaveBeenCalled();
    });
});
