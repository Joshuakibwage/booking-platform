"use client";

import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { makeQueryClient } from "@/lib/query-client";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";


export function QueryProvider({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    
    const [queryClient] = useState(() => makeQueryClient());

    
    return (
        <QueryClientProvider client={queryClient}>
            {children}

            {process.env.NODE_ENV === "development" && (
                <ReactQueryDevtools initialIsOpen={false} />
            )}
        </QueryClientProvider>
    );

};