
import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from "vitest";
import request from "supertest";
import express from "express";
import type {
    Request,
    Response,
    NextFunction,
    RequestHandler,
    ErrorRequestHandler,
} from "express";

const {
    createProfessionalProfileMock,
    findProfessionalProfileIdByUserIdMock,
    findProfessionalProfileByIdMock,
    findProfessionalProfileByUserIdMock,
    updateProfessionalProfileMock,
    updateProfessionalProfileImageMock,
    uploadProfileImageMock,
    deleteProfileImageAssetMock,
    fileTypeFromBufferMock,
} = vi.hoisted(() => ({
    createProfessionalProfileMock: vi.fn(),
    findProfessionalProfileIdByUserIdMock: vi.fn(),
    findProfessionalProfileByIdMock: vi.fn(),
    findProfessionalProfileByUserIdMock: vi.fn(),
    updateProfessionalProfileMock: vi.fn(),
    updateProfessionalProfileImageMock: vi.fn(),
    uploadProfileImageMock: vi.fn(),
    deleteProfileImageAssetMock: vi.fn(),
    fileTypeFromBufferMock: vi.fn(),
}));

vi.mock("../repositories/professional-profile.repository.js", () => ({
    createProfessionalProfile: createProfessionalProfileMock,
    findProfessionalProfileIdByUserId:
        findProfessionalProfileIdByUserIdMock,
    findProfessionalProfileById: findProfessionalProfileByIdMock,
    findProfessionalProfileByUserId:
        findProfessionalProfileByUserIdMock,
    updateProfessionalProfile: updateProfessionalProfileMock,
    updateProfessionalProfileImage: updateProfessionalProfileImageMock,
}));

vi.mock("../services/cloudinary.service.js", () => ({
    uploadProfileImage: uploadProfileImageMock,
    deleteProfileImageAsset: deleteProfileImageAssetMock,
}));

vi.mock("file-type", () => ({
    fileTypeFromBuffer: fileTypeFromBufferMock,
}));

import {
    createProfessionalProfileHandler,
    getProfessionalProfileHandler,
    getAuthenticatedProfessionalProfileHandler,
    uploadProfessionalProfileImageHandler,
} from "../controllers/professional-profile.controller.js";

import { uploadProfileImage } from "../middleware/profile-image-upload.middleware.js";

const userId = "550e8400-e29b-41d4-a716-446655440000";
const profileId = "7ba7b810-9dad-41d1-80b4-00c04fd430c8";

const publicId = `${profileId}_test-image`;
const previousPublicId = `${profileId}_previous-image`;
const imageUrl = "https://res.cloudinary.com/test/image/upload/profile.jpg";

const imageBuffer = Buffer.from("test-image-content");

let isAuthenticated = true;

const app = express();

app.use(express.json());

app.use((req: Request, _res: Response, next: NextFunction) => {
    req.session = (
        isAuthenticated ? { user: { userId } } : {}
    ) as Request["session"];

    next();
});

const requireTestAuth: RequestHandler = (req, res, next) => {
    if (!req.session.user) {
        res.status(401).json({
            status: "error",
            message: "Authentication required",
        });
        return;
    }

    next();
};

app.post("/professionals/profile", createProfessionalProfileHandler);

app.get(
    "/professionals/profile",
    requireTestAuth,
    getAuthenticatedProfessionalProfileHandler,
);

app.get(
    "/professionals/:professionalId/profile",
    getProfessionalProfileHandler,
);

app.post(
    "/professionals/profile/image",
    requireTestAuth,
    uploadProfileImage,
    uploadProfessionalProfileImageHandler,
);

const testErrorHandler: ErrorRequestHandler = (
    error,
    _req,
    res,
    _next,
) => {
    console.error(error);

    res.status(500).json({
        status: "error",
        message: "Internal Server Error",
    });
};

app.use(testErrorHandler);

afterEach(() => {
    vi.restoreAllMocks();
});

describe("POST /professionals/profile", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        isAuthenticated = true;

        findProfessionalProfileIdByUserIdMock.mockResolvedValue(null);
    });

    it("creates a professional profile", async () => {
        const profile = {
            profile_id: profileId,
            user_id: userId,
            public_name: "Joe's Barbershop",
            bio: "Experienced barber",
            time_zone: "Africa/Nairobi",
            created_at: new Date("2026-10-27T07:00:00.000Z"),
        };

        createProfessionalProfileMock.mockResolvedValue(profile);

        const response = await request(app)
            .post("/professionals/profile")
            .send({
                publicName: "Joe's Barbershop",
                bio: "Experienced barber",
                timeZone: "Africa/Nairobi",
            });

        expect(response.status).toBe(201);
        expect(response.body.status).toBe("success");
        expect(response.body.data.profile_id).toBe(profileId);
        expect(response.body.data.public_name).toBe("Joe's Barbershop");

        expect(createProfessionalProfileMock).toHaveBeenCalledWith({
            userId,
            publicName: "Joe's Barbershop",
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
                publicName: "Joe's Barbershop",
                timeZone: "Africa/Nairobi",
            });

        expect(response.status).toBe(409);
        expect(createProfessionalProfileMock).not.toHaveBeenCalled();
    });
});

describe("GET /professionals/profile", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        isAuthenticated = true;
    });

    it("returns the authenticated user's professional profile", async () => {
        const profile = {
            profile_id: profileId,
            user_id: userId,
            public_name: "Joe's Barbershop",
            bio: "Experienced barber",
            time_zone: "Africa/Nairobi",
            image_url: imageUrl,
            created_at: new Date("2026-10-27T07:00:00.000Z"),
        };

        findProfessionalProfileByUserIdMock.mockResolvedValue(profile);

        const response = await request(app).get(
            "/professionals/profile",
        );

        expect(response.status).toBe(200);
        expect(response.body.status).toBe("success");
        expect(response.body.data.profile_id).toBe(profileId);
        expect(response.body.data.user_id).toBe(userId);
        expect(response.body.data.public_name).toBe("Joe's Barbershop");
        expect(response.body.data.image_url).toBe(imageUrl);

        expect(response.body.data).not.toHaveProperty(
            "image_public_id",
        );

        expect(findProfessionalProfileByUserIdMock).toHaveBeenCalledWith(
            userId,
        );
    });

    it("rejects unauthenticated requests", async () => {
        isAuthenticated = false;

        const response = await request(app).get(
            "/professionals/profile",
        );

        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Authentication required");

        expect(findProfessionalProfileByUserIdMock).not.toHaveBeenCalled();
    });

    it("returns 404 when the authenticated user has no professional profile", async () => {
        findProfessionalProfileByUserIdMock.mockResolvedValue(null);

        const response = await request(app).get(
            "/professionals/profile",
        );

        expect(response.status).toBe(404);
        expect(response.body.status).toBe("error");
        expect(response.body.message).toBe(
            "Professional profile not found",
        );
    });
});

describe("GET /professionals/:professionalId/profile", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        isAuthenticated = true;
    });

    it("returns a public professional profile without exposing the user ID", async () => {
        const profile = {
            profile_id: profileId,
            public_name: "Joe's Barbershop",
            bio: "Experienced barber",
            time_zone: "Africa/Nairobi",
            image_url: imageUrl,
            created_at: new Date("2026-10-27T07:00:00.000Z"),
        };

        findProfessionalProfileByIdMock.mockResolvedValue(profile);

        const response = await request(app).get(
            `/professionals/${profileId}/profile`,
        );

        expect(response.status).toBe(200);
        expect(response.body.status).toBe("success");
        expect(response.body.data.profile_id).toBe(profileId);
        expect(response.body.data.public_name).toBe("Joe's Barbershop");
        expect(response.body.data.image_url).toBe(imageUrl);
        expect(response.body.data).not.toHaveProperty("user_id");

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

describe("POST /professionals/profile/image", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        isAuthenticated = true;

        findProfessionalProfileIdByUserIdMock.mockResolvedValue(profileId);

        fileTypeFromBufferMock.mockResolvedValue({
            ext: "jpg",
            mime: "image/jpeg",
        });

        uploadProfileImageMock.mockResolvedValue({
            publicId,
            secureUrl: imageUrl,
        });

        updateProfessionalProfileImageMock.mockResolvedValue({
            image_url: imageUrl,
            image_public_id: publicId,
            previous_image_public_id: null,
        });

        deleteProfileImageAssetMock.mockResolvedValue(undefined);
    });

    it("uploads and saves a valid profile image", async () => {
        const response = await request(app)
            .post("/professionals/profile/image")
            .attach("image", imageBuffer, {
                filename: "profile.jpg",
                contentType: "image/jpeg",
            });

        expect(response.status).toBe(200);
        expect(response.body.status).toBe("success");
        expect(response.body.data.imageUrl).toBe(imageUrl);

        expect(fileTypeFromBufferMock).toHaveBeenCalled();

        expect(findProfessionalProfileIdByUserIdMock).toHaveBeenCalledWith(
            userId,
        );

        expect(uploadProfileImageMock).toHaveBeenCalledWith(
            profileId,
            expect.any(Buffer),
        );

        expect(updateProfessionalProfileImageMock).toHaveBeenCalledWith(
            userId,
            imageUrl,
            publicId,
        );

        expect(deleteProfileImageAssetMock).not.toHaveBeenCalled();

        expect(response.body.data).not.toHaveProperty("publicId");
        expect(response.body.data).not.toHaveProperty("image_public_id");
    });

    it("rejects unauthenticated requests", async () => {
        isAuthenticated = false;

        const response = await request(app)
            .post("/professionals/profile/image")
            .attach("image", imageBuffer, {
                filename: "profile.jpg",
                contentType: "image/jpeg",
            });

        expect(response.status).toBe(401);
        expect(uploadProfileImageMock).not.toHaveBeenCalled();
        expect(updateProfessionalProfileImageMock).not.toHaveBeenCalled();
    });

    it("rejects requests without an image", async () => {
        const response = await request(app).post(
            "/professionals/profile/image",
        );

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Profile image is required");

        expect(uploadProfileImageMock).not.toHaveBeenCalled();
        expect(updateProfessionalProfileImageMock).not.toHaveBeenCalled();
    });

    it("rejects unsupported image content", async () => {
        fileTypeFromBufferMock.mockResolvedValue({
            ext: "svg",
            mime: "image/svg+xml",
        });

        const response = await request(app)
            .post("/professionals/profile/image")
            .attach("image", imageBuffer, {
                filename: "profile.svg",
                contentType: "image/svg+xml",
            });

        expect(response.status).toBe(400);

        expect(uploadProfileImageMock).not.toHaveBeenCalled();
        expect(updateProfessionalProfileImageMock).not.toHaveBeenCalled();
    });

    it("rejects files whose content cannot be identified", async () => {
        fileTypeFromBufferMock.mockResolvedValue(undefined);

        const response = await request(app)
            .post("/professionals/profile/image")
            .attach("image", imageBuffer, {
                filename: "profile.jpg",
                contentType: "image/jpeg",
            });

        expect(response.status).toBe(400);

        expect(uploadProfileImageMock).not.toHaveBeenCalled();
    });

    it("returns 404 when the user has no professional profile", async () => {
        findProfessionalProfileIdByUserIdMock.mockResolvedValue(null);

        const response = await request(app)
            .post("/professionals/profile/image")
            .attach("image", imageBuffer, {
                filename: "profile.jpg",
                contentType: "image/jpeg",
            });

        expect(response.status).toBe(404);

        expect(uploadProfileImageMock).not.toHaveBeenCalled();
        expect(updateProfessionalProfileImageMock).not.toHaveBeenCalled();
    });

    it("deletes the previous image after successfully saving its replacement", async () => {
        updateProfessionalProfileImageMock.mockResolvedValue({
            image_url: imageUrl,
            image_public_id: publicId,
            previous_image_public_id: previousPublicId,
        });

        const response = await request(app)
            .post("/professionals/profile/image")
            .attach("image", imageBuffer, {
                filename: "profile.jpg",
                contentType: "image/jpeg",
            });

        expect(response.status).toBe(200);
        expect(response.body.data.imageUrl).toBe(imageUrl);

        expect(updateProfessionalProfileImageMock).toHaveBeenCalledBefore(
            deleteProfileImageAssetMock,
        );

        expect(deleteProfileImageAssetMock).toHaveBeenCalledWith(
            previousPublicId,
        );
    });

    it("keeps the successful update when deleting the previous image fails", async () => {
        updateProfessionalProfileImageMock.mockResolvedValue({
            image_url: imageUrl,
            image_public_id: publicId,
            previous_image_public_id: previousPublicId,
        });

        deleteProfileImageAssetMock.mockRejectedValue(
            new Error("Cloudinary deletion failed"),
        );

        const consoleErrorSpy = vi
            .spyOn(console, "error")
            .mockImplementation(() => {});

        const response = await request(app)
            .post("/professionals/profile/image")
            .attach("image", imageBuffer, {
                filename: "profile.jpg",
                contentType: "image/jpeg",
            });

        expect(response.status).toBe(200);
        expect(response.body.status).toBe("success");
        expect(response.body.data.imageUrl).toBe(imageUrl);

        expect(deleteProfileImageAssetMock).toHaveBeenCalledWith(
            previousPublicId,
        );

        expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it("deletes the newly uploaded image when saving it to the database fails", async () => {
        updateProfessionalProfileImageMock.mockRejectedValue(
            new Error("Database update failed"),
        );

        const consoleErrorSpy = vi
            .spyOn(console, "error")
            .mockImplementation(() => {});

        const response = await request(app)
            .post("/professionals/profile/image")
            .attach("image", imageBuffer, {
                filename: "profile.jpg",
                contentType: "image/jpeg",
            });

        expect(response.status).toBe(500);

        expect(uploadProfileImageMock).toHaveBeenCalled();

        expect(deleteProfileImageAssetMock).toHaveBeenCalledWith(
            publicId,
        );

        expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it("deletes the newly uploaded image when the profile no longer exists", async () => {
        updateProfessionalProfileImageMock.mockResolvedValue(null);

        const response = await request(app)
            .post("/professionals/profile/image")
            .attach("image", imageBuffer, {
                filename: "profile.jpg",
                contentType: "image/jpeg",
            });

        expect(response.status).toBe(404);

        expect(deleteProfileImageAssetMock).toHaveBeenCalledWith(
            publicId,
        );
    });
});
