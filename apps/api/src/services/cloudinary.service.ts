
import { randomUUID } from "node:crypto";
import { v2 as cloudinary } from "cloudinary";
import "../config/env.js";

function getCloudinaryConfig() {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
        throw new Error(
            "Cloudinary environment variables are not configured",
        );
    }

    return { cloudName, apiKey, apiSecret };
}

export function getCloudinaryClient() {
    const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();

    cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true,
    });

    return cloudinary;
}

export type UploadedProfileImage = {
    publicId: string;
    secureUrl: string;
};

export function uploadProfileImage(
    profileId: string,
    buffer: Buffer,
): Promise<UploadedProfileImage> {
    const folder = `schedulyn/professional-profiles/${profileId}`;
    const publicId = `${profileId}_${randomUUID()}`;

    return new Promise((resolve, reject) => {
        const uploadStream = getCloudinaryClient().uploader.upload_stream(
            {
                folder,
                public_id: publicId,
                resource_type: "image",
                overwrite: false,
            },
            (error, result) => {
                if (error) {
                    reject(error);
                    return;
                }

                if (!result?.public_id || !result.secure_url) {
                    reject(
                        new Error("Cloudinary returned an invalid upload result"),
                    );
                    return;
                }

                resolve({
                    publicId: result.public_id,
                    secureUrl: result.secure_url,
                });
            },
        );

        uploadStream.end(buffer);
    });
}

export async function deleteProfileImageAsset(
    publicId: string,
): Promise<void> {
    await getCloudinaryClient().uploader.destroy(publicId, {
        resource_type: "image",
        invalidate: true,
    });
}
