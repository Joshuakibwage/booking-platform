
import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import express from "express";
import type { Request, Response, NextFunction } from "express";

const {
    listWeeklyAvailabilityMock,
    createWeeklyAvailabilityMock,
    updateWeeklyAvailabilityMock,
    deleteWeeklyAvailabilityMock,
    findProfessionalProfileIdByUserIdMock,
} = vi.hoisted(() => ({
    listWeeklyAvailabilityMock: vi.fn(),
    createWeeklyAvailabilityMock: vi.fn(),
    updateWeeklyAvailabilityMock: vi.fn(),
    deleteWeeklyAvailabilityMock: vi.fn(),
    findProfessionalProfileIdByUserIdMock: vi.fn(),
}));

vi.mock("../repositories/availability.repository.js", () => ({
    listWeeklyAvailability: listWeeklyAvailabilityMock,
    createWeeklyAvailability: createWeeklyAvailabilityMock,
    updateWeeklyAvailability: updateWeeklyAvailabilityMock,
    deleteWeeklyAvailability: deleteWeeklyAvailabilityMock,
}));

vi.mock("../repositories/professional-profile.repository.js", () => ({
    findProfessionalProfileIdByUserId:
        findProfessionalProfileIdByUserIdMock,
}));

import {
    listWeeklyAvailabilityHandler,
    createWeeklyAvailabilityHandler,
    updateWeeklyAvailabilityHandler,
    deleteWeeklyAvailabilityHandler,
} from "./weekly-availability.controller.js";

const userId = "550e8400-e29b-41d4-a716-446655440000";
const professionalId = "7ba7b810-9dad-41d1-80b4-00c04fd430c8";
const availabilityId = "9ba7b810-9dad-41d1-80b4-00c04fd430c8";

const app = express();

app.use(express.json());

app.use((req: Request, _res: Response, next: NextFunction) => {
    req.session = { user: { userId } } as Request["session"];
    next();
});

app.get("/professionals/weekly-availability", listWeeklyAvailabilityHandler);
app.post("/professionals/weekly-availability", createWeeklyAvailabilityHandler);
app.patch(
    "/professionals/weekly-availability/:availabilityId",
    updateWeeklyAvailabilityHandler,
);
app.delete(
    "/professionals/weekly-availability/:availabilityId",
    deleteWeeklyAvailabilityHandler,
);

describe("GET /professionals/weekly-availability", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        findProfessionalProfileIdByUserIdMock.mockResolvedValue(
            professionalId,
        );
    });

    it("returns weekly availability for the authenticated professional", async () => {
        const periods = [
            {
                availability_id: availabilityId,
                professional_id: professionalId,
                day_of_week: 1,
                start_time: "09:00:00",
                end_time: "17:00:00",
            },
        ];

        listWeeklyAvailabilityMock.mockResolvedValue(periods);

        const response = await request(app).get(
            "/professionals/weekly-availability",
        );

        expect(response.status).toBe(200);
        expect(response.body.status).toBe("success");
        expect(response.body.data).toEqual(periods);

        expect(findProfessionalProfileIdByUserIdMock).toHaveBeenCalledWith(
            userId,
        );
        expect(listWeeklyAvailabilityMock).toHaveBeenCalledWith(
            professionalId,
        );
    });
});

describe("POST /professionals/weekly-availability", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        findProfessionalProfileIdByUserIdMock.mockResolvedValue(
            professionalId,
        );
    });

    it("creates a weekly period for the authenticated professional", async () => {
        const period = {
            availability_id: availabilityId,
            professional_id: professionalId,
            day_of_week: 1,
            start_time: "09:00:00",
            end_time: "17:00:00",
        };

        createWeeklyAvailabilityMock.mockResolvedValue(period);

        const response = await request(app)
            .post("/professionals/weekly-availability")
            .send({
                dayOfWeek: 1,
                startTime: "09:00",
                endTime: "17:00",
            });

        expect(response.status).toBe(201);
        expect(response.body.status).toBe("success");
        expect(response.body.data).toEqual(period);

        expect(findProfessionalProfileIdByUserIdMock).toHaveBeenCalledWith(
            userId,
        );
        expect(createWeeklyAvailabilityMock).toHaveBeenCalledWith({
            professionalId,
            dayOfWeek: 1,
            startTime: "09:00",
            endTime: "17:00",
        });
    });

    it("rejects invalid input without querying the database", async () => {
        const response = await request(app)
            .post("/professionals/weekly-availability")
            .send({
                dayOfWeek: 8,
                startTime: "09:00",
                endTime: "17:00",
            });

        expect(response.status).toBe(400);
        expect(response.body.status).toBe("error");
        expect(createWeeklyAvailabilityMock).not.toHaveBeenCalled();
        expect(findProfessionalProfileIdByUserIdMock).not.toHaveBeenCalled();
    });

    it("rejects creation when the user has no professional profile", async () => {
        findProfessionalProfileIdByUserIdMock.mockResolvedValue(null);

        const response = await request(app)
            .post("/professionals/weekly-availability")
            .send({
                dayOfWeek: 1,
                startTime: "09:00",
                endTime: "17:00",
            });

        expect(response.status).toBe(403);
        expect(response.body.message).toBe("Professional profile required");
        expect(createWeeklyAvailabilityMock).not.toHaveBeenCalled();
    });

    it("returns 409 when the new period overlaps an existing period", async () => {
        createWeeklyAvailabilityMock.mockRejectedValue({
            code: "23P01",
        });

        const response = await request(app)
            .post("/professionals/weekly-availability")
            .send({
                dayOfWeek: 1,
                startTime: "10:00",
                endTime: "18:00",
            });

        expect(response.status).toBe(409);
        expect(response.body.status).toBe("error");
        expect(response.body.message).toBe(
            "Weekly availability overlaps an existing period",
        );
    });
});

describe("PATCH /professionals/weekly-availability/:availabilityId", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        findProfessionalProfileIdByUserIdMock.mockResolvedValue(
            professionalId,
        );
    });

    it("updates a period belonging to the authenticated professional", async () => {
        const updatedPeriod = {
            availability_id: availabilityId,
            professional_id: professionalId,
            day_of_week: 2,
            start_time: "10:00:00",
            end_time: "18:00:00",
        };

        updateWeeklyAvailabilityMock.mockResolvedValue(updatedPeriod);

        const response = await request(app)
            .patch(`/professionals/weekly-availability/${availabilityId}`)
            .send({
                dayOfWeek: 2,
                startTime: "10:00",
                endTime: "18:00",
            });

        expect(response.status).toBe(200);
        expect(response.body.status).toBe("success");
        expect(response.body.data).toEqual(updatedPeriod);
        expect(updateWeeklyAvailabilityMock).toHaveBeenCalledWith({
            availabilityId,
            professionalId,
            dayOfWeek: 2,
            startTime: "10:00",
            endTime: "18:00",
        });
    });

    it("rejects invalid update input", async () => {
        const response = await request(app)
            .patch(`/professionals/weekly-availability/${availabilityId}`)
            .send({
                dayOfWeek: 8,
                startTime: "10:00",
                endTime: "18:00",
            });

        expect(response.status).toBe(400);
        expect(updateWeeklyAvailabilityMock).not.toHaveBeenCalled();
        expect(findProfessionalProfileIdByUserIdMock).not.toHaveBeenCalled();
    });

    it("returns 404 when the period does not exist or belongs to another professional", async () => {
        updateWeeklyAvailabilityMock.mockResolvedValue(null);

        const response = await request(app)
            .patch(`/professionals/weekly-availability/${availabilityId}`)
            .send({
                dayOfWeek: 2,
                startTime: "10:00",
                endTime: "18:00",
            });

        expect(response.status).toBe(404);
        expect(response.body.message).toBe(
            "Weekly availability period not found",
        );
    });

    it("returns 409 when the updated period overlaps another period", async () => {
        updateWeeklyAvailabilityMock.mockRejectedValue({
            code: "23P01",
        });

        const response = await request(app)
            .patch(`/professionals/weekly-availability/${availabilityId}`)
            .send({
                dayOfWeek: 2,
                startTime: "10:00",
                endTime: "18:00",
            });

        expect(response.status).toBe(409);
        expect(response.body.message).toBe(
            "Weekly availability overlaps an existing period",
        );
    });
});

describe("DELETE /professionals/weekly-availability/:availabilityId", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        findProfessionalProfileIdByUserIdMock.mockResolvedValue(
            professionalId,
        );
    });

    it("deletes a period belonging to the authenticated professional", async () => {
        deleteWeeklyAvailabilityMock.mockResolvedValue(true);

        const response = await request(app).delete(
            `/professionals/weekly-availability/${availabilityId}`,
        );

        expect(response.status).toBe(200);
        expect(response.body.status).toBe("success");
        expect(response.body.message).toBe(
            "Weekly availability period deleted",
        );

        expect(findProfessionalProfileIdByUserIdMock).toHaveBeenCalledWith(
            userId,
        );
        expect(deleteWeeklyAvailabilityMock).toHaveBeenCalledWith(
            availabilityId,
            professionalId,
        );
    });

    it("returns 404 when the period does not exist or belongs to another professional", async () => {
        deleteWeeklyAvailabilityMock.mockResolvedValue(false);

        const response = await request(app).delete(
            `/professionals/weekly-availability/${availabilityId}`,
        );

        expect(response.status).toBe(404);
        expect(response.body.status).toBe("error");
        expect(response.body.message).toBe(
            "Weekly availability period not found",
        );

        expect(deleteWeeklyAvailabilityMock).toHaveBeenCalledWith(
            availabilityId,
            professionalId,
        );
    });

    it("returns 403 when the user has no professional profile", async () => {
        findProfessionalProfileIdByUserIdMock.mockResolvedValue(null);

        const response = await request(app).delete(
            `/professionals/weekly-availability/${availabilityId}`,
        );

        expect(response.status).toBe(403);
        expect(deleteWeeklyAvailabilityMock).not.toHaveBeenCalled();
    });
});
