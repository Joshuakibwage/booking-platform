"use client";

import { useQuery } from "@tanstack/react-query";

import { getAvailabilityExceptions } from "@/lib/api/professional-availability.api";
import { queryKeys } from "@/lib/query-keys";

export function useAvailabilityExceptions() {
    return useQuery({
        queryKey: queryKeys.professional.availabilityExceptions,
        queryFn: getAvailabilityExceptions,
    });
}