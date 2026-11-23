"use client";

import { useQuery } from "@tanstack/react-query";

import { getPublicAvailability } from "@/lib/api/professional-availability.api";
import { queryKeys } from "@/lib/query-keys";

export function usePublicAvailability(
    professionalId: string,
    serviceId: string,
    date: string,
) {
    return useQuery({
        queryKey: queryKeys.public.availability(
            professionalId,
            serviceId,
            date,
        ),
        queryFn: () =>
            getPublicAvailability(professionalId, serviceId, date),
        enabled: Boolean(professionalId && serviceId && date),
    });
}