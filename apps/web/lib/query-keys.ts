
export const queryKeys = {
    auth: {
        currentUser: ["auth", "current-user"],
    },
    professional: {
        profile: ["professional", "profile"],
        services: ["professional", "services"],
        weeklyAvailability: ["professional", "weekly-availability"],
        availabilityExceptions: ["professional", "availability-exceptions"],
    },
    public: {
        services: (filters: {
            search?: string;
            category?: string;
            professionalId?: string;
        }) => ["public", "services", filters] as const,

        serviceCategories: ["public", "service-categories"] as const,

        professionals: (filters: {
            search?: string;
            category?: string;
        }) => ["public", "professionals", filters] as const,

        professionalProfile: (professionalId: string) =>
            ["public", "professional-profile", professionalId] as const,

        service: (serviceId: string) =>
            ["public", "service", serviceId] as const,
    },
} as const;
