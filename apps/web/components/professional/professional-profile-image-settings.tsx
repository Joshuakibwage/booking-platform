"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { Button } from "@/components/ui/button";
import { EASE, SubmitLabel } from "@/components/ui/form-motion";
import { useUploadProfessionalProfileImage } from "@/hooks/professional/use-upload-professional-profile-image";
import { getApiErrorMessage } from "@/lib/api-error";
import { cn } from "@/lib/utils";

type ProfessionalProfileImageSettingsProps = {
    imageUrl: string | null;
    publicName: string;
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/avif",
];

function getInitials(name: string) {
    return name
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0]?.toUpperCase() ?? "")
        .join("") || "?";
}

/** A line of text that eases open and closed instead of popping. */
function Notice({
    show,
    role,
    className,
    children,
}: {
    show: boolean;
    role?: "alert" | "status";
    className?: string;
    children: ReactNode;
}) {
    const reduce = useReducedMotion();

    return (
        <AnimatePresence initial={false}>
            {show && (
                <motion.p
                    key="notice"
                    role={role}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: reduce ? 0 : 0.25, ease: EASE }}
                    className={cn("overflow-hidden text-sm", className)}
                >
                    {children}
                </motion.p>
            )}
        </AnimatePresence>
    );
}

export function ProfessionalProfileImageSettings({
    imageUrl,
    publicName,
}: ProfessionalProfileImageSettingsProps) {
    const reduce = useReducedMotion();

    const fileInputRef = useRef<HTMLInputElement>(null);
    const previewUrlRef = useRef<string | null>(null);

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [validationError, setValidationError] = useState<string | null>(null);

    const uploadImage = useUploadProfessionalProfileImage();

    // Free the preview's object URL when the component unmounts.
    useEffect(() => {
        return () => {
            if (previewUrlRef.current) {
                URL.revokeObjectURL(previewUrlRef.current);
            }
        };
    }, []);

    // Sets the selected file and its preview together, releasing the old preview.
    function selectFile(file: File | null) {
        if (previewUrlRef.current) {
            URL.revokeObjectURL(previewUrlRef.current);
        }

        const nextPreviewUrl = file ? URL.createObjectURL(file) : null;

        previewUrlRef.current = nextPreviewUrl;
        setSelectedFile(file);
        setPreviewUrl(nextPreviewUrl);
    }

    function handleFileChange(
        event: React.ChangeEvent<HTMLInputElement>,
    ) {
        const file = event.target.files?.[0];

        if (!file) return;

        setValidationError(null);
        uploadImage.reset();

        if (!ALLOWED_TYPES.includes(file.type)) {
            selectFile(null);
            setValidationError("Choose a JPEG, PNG, WebP, or AVIF image.");
            event.target.value = "";
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            selectFile(null);
            setValidationError("The image must be 5 MB or smaller.");
            event.target.value = "";
            return;
        }

        selectFile(file);
    }

    async function handleUpload() {
        if (!selectedFile) return;

        try {
            await uploadImage.mutateAsync(selectedFile);
            selectFile(null);

            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        } catch {
            // The mutation error is displayed below.
        }
    }

    function handleCancel() {
        selectFile(null);
        setValidationError(null);
        uploadImage.reset();

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }

    const displayedImage = previewUrl ?? imageUrl;

    const swap = {
        initial: { opacity: 0, scale: reduce ? 1 : 1.05 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0 },
        transition: { duration: reduce ? 0 : 0.3, ease: EASE },
    };

    const slideIn = {
        initial: { opacity: 0, x: reduce ? 0 : -6 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: reduce ? 0 : -6 },
        transition: { duration: reduce ? 0 : 0.25, ease: EASE },
    };

    return (
        <section className="space-y-5">
            <div className="space-y-1">
                <h2 className="text-xl font-semibold">Profile photo</h2>
                <p className="text-sm text-muted-foreground">
                    Add a photo to help customers recognise your business.
                </p>
            </div>

            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                {/* Photo and initials cross-fade when the image changes */}
                <div className="relative grid size-24 shrink-0 place-items-center overflow-hidden rounded-full bg-secondary text-xl font-semibold">
                    <AnimatePresence mode="popLayout" initial={false}>
                        {displayedImage ? (
                            <motion.div
                                key={displayedImage}
                                className="absolute inset-0"
                                {...swap}
                            >
                                <Image
                                    src={displayedImage}
                                    alt={`${publicName} profile`}
                                    fill
                                    sizes="96px"
                                    // Local previews are blob: URLs, which the image optimizer can't fetch
                                    unoptimized={Boolean(previewUrl)}
                                    className="object-cover"
                                />
                            </motion.div>
                        ) : (
                            <motion.span key="initials" {...swap}>
                                {getInitials(publicName)}
                            </motion.span>
                        )}
                    </AnimatePresence>
                </div>

                <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadImage.isPending}
                        >
                            Choose image
                        </Button>

                        <AnimatePresence initial={false}>
                            {selectedFile && (
                                <motion.div key="upload" {...slideIn}>
                                    <Button
                                        type="button"
                                        onClick={handleUpload}
                                        disabled={uploadImage.isPending}
                                    >
                                        <SubmitLabel
                                            isPending={uploadImage.isPending}
                                            label="Upload photo"
                                            pendingLabel="Uploading..."
                                        />
                                    </Button>
                                </motion.div>
                            )}

                            {selectedFile && (
                                <motion.div key="cancel" {...slideIn}>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={handleCancel}
                                        disabled={uploadImage.isPending}
                                    >
                                        Cancel
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/avif"
                        onChange={handleFileChange}
                        className="sr-only"
                        aria-label="Choose profile image"
                    />

                    <p className="text-xs text-muted-foreground">
                        JPEG, PNG, WebP, or AVIF. Maximum size: 5 MB.
                    </p>

                    <Notice show={Boolean(selectedFile)} className="text-muted-foreground">
                        Selected: {selectedFile?.name}
                    </Notice>

                    <Notice
                        show={Boolean(validationError)}
                        role="alert"
                        className="text-destructive"
                    >
                        {validationError}
                    </Notice>

                    <Notice
                        show={uploadImage.isError}
                        role="alert"
                        className="text-destructive"
                    >
                        {getApiErrorMessage(
                            uploadImage.error,
                            "We couldn't upload your photo. Please try again.",
                        )}
                    </Notice>

                    <Notice
                        show={uploadImage.isSuccess}
                        role="status"
                        className="text-green-600"
                    >
                        Profile photo updated successfully.
                    </Notice>
                </div>
            </div>
        </section>
    );
}