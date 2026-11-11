"use client";

import { useQuery } from "@tanstack/react-query";

import {
    getPublicServices,
    type PublicServiceFilters,
} from "@/lib/api/public-discovery.api";
import { queryKeys } from "@/lib/query-keys";

export function usePublicServices(
    filters: PublicServiceFilters = {},
) {
    return useQuery({
        queryKey: queryKeys.public.services(filters),
        queryFn: () => getPublicServices(filters),
    });
}