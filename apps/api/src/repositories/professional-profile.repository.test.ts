
import { beforeEach, describe, expect, it, vi } from "vitest";

const { queryMock } = vi.hoisted(() => ({
    queryMock: vi.fn(),
}));

vi.mock("../db.js", () => ({
    default: {
        query: queryMock,
    },
}));

import {
    createProfessionalProfile,
    updateProfessionalProfile,
    findProfessionalProfileById,
    findProfessionalProfileByUserId,
} from "./professional-profile.repository.js";

const profile = {
    profile_id: "7ba7b810-9dad-41d1-80b4-00c04fd430c8",
    user_id: "550e8400-e29b-41d4-a716-446655440000",
    public_name: "Sam's Barbershop",
    bio: "Experienced barber",
    time_zone: "Africa/Nairobi",
    created_at: new Date("2026-10-27T07:00:00.000Z"),
};

describe("createProfessionalProfile", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("creates a profile and returns the saved record", async () => {
        queryMock.mockResolvedValue({
            rows: [profile],
        });

        const result = await createProfessionalProfile({
            userId: profile.user_id,
            publicName: profile.public_name,
            bio: profile.bio,
            timeZone: profile.time_zone,
        });

        expect(result).toEqual(profile);
        expect(queryMock).toHaveBeenCalledOnce();

        expect(queryMock).toHaveBeenCalledWith(
            expect.stringContaining("INSERT INTO professional_profiles"),
            [
                profile.user_id,
                profile.public_name,
                profile.bio,
                profile.time_zone,
            ],
        );
    });

    it("stores a null biography when bio is omitted", async () => {
        queryMock.mockResolvedValue({
            rows: [{ ...profile, bio: null }],
        });

        await createProfessionalProfile({
            userId: profile.user_id,
            publicName: profile.public_name,
            timeZone: profile.time_zone,
        });

        expect(queryMock).toHaveBeenCalledWith(
            expect.any(String),
            [
                profile.user_id,
                profile.public_name,
                null,
                profile.time_zone,
            ],
        );
    });

    it("propagates database errors", async () => {
        queryMock.mockRejectedValue(
            new Error("Database unavailable"),
        );

        await expect(
            createProfessionalProfile({
                userId: profile.user_id,
                publicName: profile.public_name,
                timeZone: profile.time_zone,
            }),
        ).rejects.toThrow("Database unavailable");
    });
});

describe("updateProfessionalProfile", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("updates the public name without changing other fields", async () => {
        const updatedProfile = {
            ...profile,
            public_name: "Sam's New Barbershop",
        };

        queryMock.mockResolvedValue({
            rows: [updatedProfile],
        });

        const result = await updateProfessionalProfile({
            userId: profile.user_id,
            publicName: "Sam's New Barbershop",
        });

        expect(result).toEqual(updatedProfile);

        expect(queryMock).toHaveBeenCalledWith(
            expect.stringContaining("UPDATE professional_profiles"),
            [
                profile.user_id,
                true,
                "Sam's New Barbershop",
                false,
                null,
                false,
                null,
            ],
        );
    });

    it("updates the biography without changing other fields", async () => {
        queryMock.mockResolvedValue({
            rows: [{ ...profile, bio: "Senior barber" }],
        });

        const result = await updateProfessionalProfile({
            userId: profile.user_id,
            bio: "Senior barber",
        });

        expect(result).toEqual({
            ...profile,
            bio: "Senior barber",
        });

        expect(queryMock).toHaveBeenCalledWith(
            expect.stringContaining("UPDATE professional_profiles"),
            [
                profile.user_id,
                false,
                null,
                true,
                "Senior barber",
                false,
                null,
            ],
        );
    });

    it("allows the biography to be cleared explicitly", async () => {
        queryMock.mockResolvedValue({
            rows: [{ ...profile, bio: null }],
        });

        const result = await updateProfessionalProfile({
            userId: profile.user_id,
            bio: null,
        });

        expect(result?.bio).toBeNull();

        expect(queryMock).toHaveBeenCalledWith(
            expect.any(String),
            [
                profile.user_id,
                false,
                null,
                true,
                null,
                false,
                null,
            ],
        );
    });

    it("returns null when the user has no profile", async () => {
        queryMock.mockResolvedValue({
            rows: [],
        });

        const result = await updateProfessionalProfile({
            userId: profile.user_id,
            bio: "New biography",
        });

        expect(result).toBeNull();
    });
});

describe("findProfessionalProfileById", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns the public profile with its public name", async () => {
        queryMock.mockResolvedValue({
            rows: [profile],
        });

        const result = await findProfessionalProfileById(
            profile.profile_id,
        );

        expect(result).toEqual(profile);

        expect(queryMock).toHaveBeenCalledWith(
            expect.stringContaining("FROM professional_profiles"),
            [profile.profile_id],
        );
    });

    it("returns null when the profile does not exist", async () => {
        queryMock.mockResolvedValue({
            rows: [],
        });

        const result = await findProfessionalProfileById(
            profile.profile_id,
        );

        expect(result).toBeNull();
    });
});


describe("findProfessionalProfileByUserId", () => {
    beforeEach(() => vi.clearAllMocks());

    it("returns the authenticated user's professional profile", async () => {
        const authenticatedProfile = {
            ...profile,
            image_url: "https://res.cloudinary.com/example/profile.jpg",
        };

        queryMock.mockResolvedValue({ rows: [authenticatedProfile] });

        const result = await findProfessionalProfileByUserId(profile.user_id);

        expect(result).toEqual(authenticatedProfile);
        expect(queryMock).toHaveBeenCalledWith(
            expect.stringContaining("WHERE user_id = $1"),
            [profile.user_id],
        );
    });

    it("returns null when the user has no professional profile", async () => {
        queryMock.mockResolvedValue({ rows: [] });

        const result = await findProfessionalProfileByUserId(profile.user_id);

        expect(result).toBeNull();
    });
});