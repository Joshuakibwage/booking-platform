"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import {
    AnimatePresence,
    motion,
    useReducedMotion,
    type Variants,
} from "motion/react";

import { AuthFormField } from "@/components/auth/auth-form-field";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    professionalProfileSchema,
    type ProfessionalProfileFormValues,
} from "@/schemas/professional/professional-profile.schema";

const EASE = [0.22, 1, 0.36, 1] as const;

type ProfessionalProfileFormProps = {
    onSubmit: (values: ProfessionalProfileFormValues) => Promise<void>;
    errorMessage?: string | null;
};

function getInitials(name: string) {
    const letters = name
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0]?.toUpperCase() ?? "")
        .join("");

    return letters || "?";
}

/** Error text that eases in and out instead of popping. */
function FieldError({ id, message }: { id: string; message?: string }) {
    const reduce = useReducedMotion();

    return (
        <AnimatePresence initial={false}>
            {message && (
                <motion.p
                    key="error"
                    id={id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: reduce ? 0 : 0.25, ease: EASE }}
                    className="overflow-hidden text-sm text-destructive"
                >
                    {message}
                </motion.p>
            )}
        </AnimatePresence>
    );
}

export function ProfessionalProfileForm({
    onSubmit,
    errorMessage,
}: ProfessionalProfileFormProps) {
    const reduce = useReducedMotion();

    const {
        register,
        control,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<ProfessionalProfileFormValues>({
        resolver: zodResolver(professionalProfileSchema),
        defaultValues: {
            publicName: "",
            bio: "",
            timeZone: "",
        },
    });

    useEffect(() => {
        const browserTimeZone =
            Intl.DateTimeFormat().resolvedOptions().timeZone;

        if (browserTimeZone) {
            setValue("timeZone", browserTimeZone);
        }
    }, [setValue]);

    // Live values drive the preview. The form itself is unchanged.
    const [publicName, bio, timeZone] = useWatch({
        control,
        name: ["publicName", "bio", "timeZone"],
    });

    const initials = getInitials(publicName ?? "");

    // Fields rise in one after another when the form mounts.
    const container: Variants = {
        hidden: {},
        show: {
            transition: {
                staggerChildren: reduce ? 0 : 0.06,
                delayChildren: reduce ? 0 : 0.05,
            },
        },
    };

    const item: Variants = {
        hidden: { opacity: 0, y: reduce ? 0 : 10 },
        show: {
            opacity: 1,
            y: 0,
            transition: { duration: reduce ? 0 : 0.45, ease: EASE },
        },
    };

    return (
        <motion.form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
            variants={container}
            initial="hidden"
            animate="show"
        >
            {/* Preview: how customers will first see this profile */}
            <motion.div
                variants={item}
                aria-hidden="true"
                className="relative overflow-hidden rounded-2xl bg-secondary p-4"
            >
                {/* Quarter-circle accent, same shape language as the rest of the site */}
                <span className="pointer-events-none absolute right-0 top-0 size-16 rounded-bl-full bg-primary/10" />

                <div className="relative flex items-center gap-4">
                    <span className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                        <AnimatePresence mode="popLayout" initial={false}>
                            <motion.span
                                key={initials}
                                initial={{
                                    opacity: 0,
                                    scale: reduce ? 1 : 0.6,
                                }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{
                                    opacity: 0,
                                    scale: reduce ? 1 : 0.6,
                                }}
                                transition={{
                                    duration: reduce ? 0 : 0.2,
                                    ease: EASE,
                                }}
                            >
                                {initials}
                            </motion.span>
                        </AnimatePresence>
                    </span>

                    <div className="min-w-0 flex-1">
                        <p
                            className={cn(
                                "truncate font-medium",
                                !publicName && "text-muted-foreground"
                            )}
                        >
                            {publicName || "Your business name"}
                        </p>
                        <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
                            {bio || "A short introduction will appear here."}
                        </p>
                    </div>
                </div>

                <AnimatePresence initial={false}>
                    {timeZone && (
                        <motion.p
                            key="tz"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{
                                duration: reduce ? 0 : 0.3,
                                ease: EASE,
                            }}
                            className="relative overflow-hidden"
                        >
                            <span className="mt-3 inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs">
                                <span className="size-1.5 rounded-full bg-primary" />
                                {timeZone}
                            </span>
                        </motion.p>
                    )}
                </AnimatePresence>
            </motion.div>

            <motion.div variants={item}>
                <AuthFormField
                    id="publicName"
                    label="Professional or business name"
                    type="text"
                    placeholder="e.g. Joe's Barbershop"
                    registration={register("publicName")}
                    error={errors.publicName?.message}
                />
            </motion.div>

            <motion.div variants={item} className="space-y-2">
                <label htmlFor="bio" className="text-sm font-medium">
                    About your business or services
                </label>

                <textarea
                    id="bio"
                    rows={5}
                    placeholder="Tell potential customers what you do and what makes your services valuable."
                    {...register("bio")}
                    aria-invalid={Boolean(errors.bio)}
                    aria-describedby={errors.bio ? "bio-error" : undefined}
                    className="w-full resize-y rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-ring"
                />

                <FieldError id="bio-error" message={errors.bio?.message} />
            </motion.div>

            <motion.div variants={item}>
                <AuthFormField
                    id="timeZone"
                    label="Time zone"
                    type="text"
                    placeholder="e.g. Africa/Nairobi"
                    registration={register("timeZone")}
                    error={errors.timeZone?.message}
                />
            </motion.div>

            <AnimatePresence initial={false}>
                {errorMessage && (
                    <motion.p
                        key="form-error"
                        role="alert"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: reduce ? 0 : 0.25, ease: EASE }}
                        className="overflow-hidden rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
                    >
                        {errorMessage}
                    </motion.p>
                )}
            </AnimatePresence>

            <motion.div variants={item}>
                <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                >
                    {/* Label swaps with a short slide instead of snapping */}
                    <AnimatePresence mode="wait" initial={false}>
                        <motion.span
                            key={isSubmitting ? "saving" : "idle"}
                            initial={{ opacity: 0, y: reduce ? 0 : 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: reduce ? 0 : -6 }}
                            transition={{ duration: reduce ? 0 : 0.18 }}
                            className="block"
                        >
                            {isSubmitting
                                ? "Creating your profile..."
                                : "Continue"}
                        </motion.span>
                    </AnimatePresence>
                </Button>
            </motion.div>
        </motion.form>
    );
}