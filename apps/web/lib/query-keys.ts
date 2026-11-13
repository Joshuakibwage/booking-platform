
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
        services: (filters: { search?: string; category?: string }) =>
            ["public", "services", filters] as const,
        serviceCategories: ["public", "service-categories"] as const,
    },
} as const;
