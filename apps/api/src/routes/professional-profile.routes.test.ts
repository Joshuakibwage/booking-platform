
import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import express from "express";
import type { Request, Response, NextFunction } from "express";

const {
    createProfessionalProfileMock,
    findProfessionalProfileIdByUserIdMock,
    findProfessionalProfileByIdMock,
    updateProfessionalProfileMock,
} = vi.hoisted(() => ({
    createProfessionalProfileMock: vi.fn(),
    findProfessionalProfileIdByUserIdMock: vi.fn(),
    findProfessionalProfileByIdMock: vi.fn(),
    updateProfessionalProfileMock: vi.fn(),
}));

vi.mock("../repositories/professional-profile.repository.js", () => ({
    createProfessionalProfile: createProfessionalProfileMock,
    findProfessionalProfileIdByUserId:
        findProfessionalProfileIdByUserIdMock,
    findProfessionalProfileById: findProfessionalProfileByIdMock,
    updateProfessionalProfile: updateProfessionalProfileMock,
}));

import {
    createProfessionalProfileHandler,
    getProfessionalProfileHandler,
} from "../controllers/professional-profile.controller.js";

const userId = "550e8400-e29b-41d4-a716-446655440000";
const profileId = "7ba7b810-9dad-41d1-80b4-00c04fd430c8";

const app = express();

app.use(express.json());

app.use((req: Request, _res: Response, next: NextFunction) => {
    req.session = {
        user: { userId },
    } as Request["session"];

    next();
});

app.post("/professionals/profile", createProfessionalProfileHandler);

app.get(
    "/professionals/:professionalId/profile",
    getProfessionalProfileHandler,
);

describe("POST /professionals/profile", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        findProfessionalProfileIdByUserIdMock.mockResolvedValue(null);
    });

    it("creates a professional profile", async () => {
        const profile = {
            profile_id: profileId,
            user_id: userId,
            bio: "Experienced barber",
            time_zone: "Africa/Nairobi",
            created_at: new Date("2026-10-27T07:00:00.000Z"),
        };

        createProfessionalProfileMock.mockResolvedValue(profile);

        const response = await request(app)
            .post("/professionals/profile")
            .send({
                bio: "Experienced barber",
                timeZone: "Africa/Nairobi",
            });

        expect(response.status).toBe(201);
        expect(response.body.status).toBe("success");
        expect(response.body.data.profile_id).toBe(profileId);

        expect(createProfessionalProfileMock).toHaveBeenCalledWith({
            userId,
            bio: "Experienced barber",
            timeZone: "Africa/Nairobi",
        });
    });

    it("rejects invalid profile input", async () => {
        const response = await request(app)
            .post("/professionals/profile")
            .send({
                bio: "Experienced barber",
            });

        expect(response.status).toBe(400);
        expect(createProfessionalProfileMock).not.toHaveBeenCalled();
    });

    it("rejects creation when a profile already exists", async () => {
        findProfessionalProfileIdByUserIdMock.mockResolvedValue(profileId);

        const response = await request(app)
            .post("/professionals/profile")
            .send({
                timeZone: "Africa/Nairobi",
            });

        expect(response.status).toBe(409);
        expect(createProfessionalProfileMock).not.toHaveBeenCalled();
    });
});

describe("GET /professionals/:professionalId/profile", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns a public professional profile", async () => {
        const profile = {
            profile_id: profileId,
            user_id: userId,
            display_name: "Jane Doe",
            bio: "Experienced barber",
            time_zone: "Africa/Nairobi",
            created_at: new Date("2026-10-27T07:00:00.000Z"),
        };

        findProfessionalProfileByIdMock.mockResolvedValue(profile);

        const response = await request(app).get(
            `/professionals/${profileId}/profile`,
        );

        expect(response.status).toBe(200);
        expect(response.body.status).toBe("success");
        expect(response.body.data.profile_id).toBe(profileId);
        expect(response.body.data.display_name).toBe("Jane Doe");

        expect(findProfessionalProfileByIdMock).toHaveBeenCalledWith(
            profileId,
        );
    });

    it("returns 404 when the profile doesn't exist", async () => {
        findProfessionalProfileByIdMock.mockResolvedValue(null);

        const response = await request(app).get(
            `/professionals/${profileId}/profile`,
        );

        expect(response.status).toBe(404);
        expect(response.body.status).toBe("error");
        expect(response.body.message).toBe(
            "Professional profile not found",
        );
    });
});
