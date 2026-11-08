"use client";

import { useQuery } from "@tanstack/react-query";

import { getProfessionalServices } from "@/lib/api/professional-services.api";
import { queryKeys } from "@/lib/query-keys";

export function useProfessionalServices() {
    return useQuery({
        queryKey: queryKeys.professional.services,
        queryFn: getProfessionalServices,
    });
}