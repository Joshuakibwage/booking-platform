"use client";

import { useQuery } from "@tanstack/react-query";

import { getPublicService } from "@/lib/api/public-discovery.api";
import { queryKeys } from "@/lib/query-keys";

export function usePublicService(serviceId: string) {
    return useQuery({
        queryKey: queryKeys.public.service(serviceId),
        queryFn: () => getPublicService(serviceId),
        enabled: Boolean(serviceId),
    });
}