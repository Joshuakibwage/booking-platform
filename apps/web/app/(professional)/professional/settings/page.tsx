
"use client";

import { ProfessionalProfileImageSettings } from "@/components/professional/professional-profile-image-settings";
import { ProfessionalProfileSettings } from "@/components/professional/professional-profile-settings";
import { Button } from "@/components/ui/button";
import { useProfessionalProfile } from "@/hooks/professional/use-professional-profile";
import { useUpdateProfessionalProfile } from "@/hooks/professional/use-update-professional-profile";
import { getApiErrorMessage } from "@/lib/api-error";
import type { ProfessionalProfileFormValues } from "@/schemas/professional/professional-profile.schema";

export default function ProfessionalSettingsPage() {
    const profileQuery = useProfessionalProfile();
    const updateProfile = useUpdateProfessionalProfile();

    async function handleSubmit(values: ProfessionalProfileFormValues) {
        try {
            await updateProfile.mutateAsync(values);
        } catch {
            // The mutation error is displayed in the form.
        }
    }

    if (profileQuery.isPending) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <p className="text-sm text-muted-foreground">
                    Loading your profile settings...
                </p>
            </div>
        );
    }

    if (profileQuery.isError || !profileQuery.data) {
        return (
            <div className="mx-auto max-w-7xl space-y-4 px-4 py-12 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-semibold tracking-tight">
                    Profile settings
                </h1>

                <p role="alert" className="text-sm text-destructive">
                    {getApiErrorMessage(
                        profileQuery.error,
                        "We couldn't load your profile. Please try again.",
                    )}
                </p>

                <Button
                    type="button"
                    variant="outline"
                    onClick={() => profileQuery.refetch()}
                    disabled={profileQuery.isFetching}
                >
                    {profileQuery.isFetching ? "Retrying..." : "Try again"}
                </Button>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-7xl space-y-10 px-4 py-12 sm:px-6 lg:px-8">
            <div className="space-y-3">
                <h1 className="text-3xl font-semibold tracking-tight">
                    Profile settings
                </h1>

                <p className="max-w-2xl text-muted-foreground">
                    Manage the information customers see when they discover
                    your professional profile.
                </p>
            </div>

            <section className="max-w-3xl">
                <ProfessionalProfileImageSettings
                    imageUrl={profileQuery.data.image_url}
                    publicName={profileQuery.data.public_name}
                />
            </section>

            <section className="max-w-3xl space-y-5">
                <div className="space-y-1">
                    <h2 className="text-xl font-semibold">
                        Profile information
                    </h2>

                    <p className="text-sm text-muted-foreground">
                        Update your professional name, introduction, and time
                        zone.
                    </p>
                </div>

                <ProfessionalProfileSettings
                    profile={profileQuery.data}
                    onSubmit={handleSubmit}
                    isSaving={updateProfile.isPending}
                    errorMessage={
                        updateProfile.isError
                            ? getApiErrorMessage(
                                  updateProfile.error,
                                  "We couldn't save your changes. Please try again.",
                              )
                            : null
                    }
                />
            </section>
        </div>
    );
}
