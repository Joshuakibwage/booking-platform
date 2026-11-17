
"use client";

import { useQuery } from "@tanstack/react-query";

import {
    getPublicProfessionals,
    type PublicProfessionalFilters,
} from "@/lib/api/public-discovery.api";
import { queryKeys } from "@/lib/query-keys";

export function usePublicProfessionals(
    filters: PublicProfessionalFilters = {},
) {
    return useQuery({
        queryKey: queryKeys.public.professionals(filters),
        queryFn: () => getPublicProfessionals(filters),
    });
}
