
"use client";

import { useQuery } from "@tanstack/react-query";

import { getAuthenticatedProfessionalProfile } from "@/lib/api/professional-profile.api";
import { queryKeys } from "@/lib/query-keys";

export function useProfessionalProfile() {
    return useQuery({
        queryKey: queryKeys.professional.profile,
        queryFn: getAuthenticatedProfessionalProfile,
    });
}
