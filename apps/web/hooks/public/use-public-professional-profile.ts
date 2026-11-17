
"use client";

import { useQuery } from "@tanstack/react-query";

import { getPublicProfessionalProfile } from "@/lib/api/public-discovery.api";
import { queryKeys } from "@/lib/query-keys";

export function usePublicProfessionalProfile(professionalId: string) {
    return useQuery({
        queryKey: queryKeys.public.professionalProfile(professionalId),
        queryFn: () => getPublicProfessionalProfile(professionalId),
        enabled: Boolean(professionalId),
    });
}
