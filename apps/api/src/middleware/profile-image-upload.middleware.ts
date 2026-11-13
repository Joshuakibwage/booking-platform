
import type { RequestHandler } from "express";
import multer from "multer";
import { fileTypeFromBuffer } from "file-type";

const MAX_PROFILE_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/avif",
]);

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: MAX_PROFILE_IMAGE_SIZE,
        files: 1,
    },
});

export const uploadProfileImage: RequestHandler = (
    req,
    res,
    next,
) => {
    upload.single("image")(req, res, (error: unknown) => {
        if (error instanceof multer.MulterError) {
            if (error.code === "LIMIT_FILE_SIZE") {
                res.status(413).json({
                    status: "error",
                    message: "Profile images must not exceed 5 MB",
                });
                return;
            }

            res.status(400).json({
                status: "error",
                message: "Invalid profile image upload",
            });
            return;
        }

        if (error) {
            next(error);
            return;
        }

        void validateImage(req, res, next);
    });
};

async function validateImage(
    req: Parameters<RequestHandler>[0],
    res: Parameters<RequestHandler>[1],
    next: Parameters<RequestHandler>[2],
): Promise<void> {
    if (!req.file) {
        res.status(400).json({
            status: "error",
            message: "Profile image is required",
        });
        return;
    }

    const detectedType = await fileTypeFromBuffer(req.file.buffer);

    if (
        !detectedType ||
        !ALLOWED_IMAGE_TYPES.has(detectedType.mime)
    ) {
        res.status(400).json({
            status: "error",
            message: "Only JPEG, PNG, WebP and AVIF images are supported",
        });
        return;
    }

    req.file.mimetype = detectedType.mime;

    next();
}
