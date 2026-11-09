"use client";

import { useQuery } from "@tanstack/react-query";

import { getWeeklyAvailability } from "@/lib/api/professional-availability.api";
import { queryKeys } from "@/lib/query-keys";

export function useWeeklyAvailability() {
    return useQuery({
        queryKey: queryKeys.professional.weeklyAvailability,
        queryFn: getWeeklyAvailability,
    });
}