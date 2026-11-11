"use client";

import { useQuery } from "@tanstack/react-query";

import { getPublicServiceCategories } from "@/lib/api/public-discovery.api";
import { queryKeys } from "@/lib/query-keys";

export function usePublicServiceCategories() {
    return useQuery({
        queryKey: queryKeys.public.serviceCategories,
        queryFn: getPublicServiceCategories,
    });
}