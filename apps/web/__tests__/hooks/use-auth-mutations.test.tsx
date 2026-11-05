
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";

import { useLogin } from "@/hooks/auth/use-login";
import { queryKeys } from "@/lib/query-keys";
import { server } from "@/mocks/server";
import type { AuthUser } from "@/types/auth";

import { useRegister } from "@/hooks/auth/use-register";
import { useLogout } from "@/hooks/auth/use-logout";

const authenticatedUser: AuthUser = {
    userId: "test-user-123",
    email: "joshua@example.com",
    displayName: "Test User",
    hasProfessionalProfile: false,
};

function createWrapper(queryClient: QueryClient) {
    return function Wrapper({ children }: { children: ReactNode }) {
        return (
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        );
    };
}

describe("useLogin", () => {
    it("updates the current-user cache after successful login", async () => {
        server.use(
            http.post("*/auth/login", () => {
                return HttpResponse.json({
                    status: "success",
                    data: authenticatedUser,
                });
            }),
        );

        const queryClient = new QueryClient();
        const { result } = renderHook(() => useLogin(), {
            wrapper: createWrapper(queryClient),
        });

        await act(async () => {
            await result.current.mutateAsync({
                email: "joshua@example.com",
                password: "ValidPassword123!",
            });
        });

        expect(
            queryClient.getQueryData(queryKeys.auth.currentUser),
        ).toEqual(authenticatedUser);
    });

    it("preserves the current-user cache when login fails", async () => {
        server.use(
            http.post("*/auth/login", () => {
                return HttpResponse.json(
                    {
                        status: "error",
                        message: "Invalid credentials",
                    },
                    { status: 401 },
                );
            }),
        );

        const queryClient = new QueryClient();

        queryClient.setQueryData(
            queryKeys.auth.currentUser,
            authenticatedUser,
        );

        const { result } = renderHook(() => useLogin(), {
            wrapper: createWrapper(queryClient),
        });

        await act(async () => {
            await expect(
                result.current.mutateAsync({
                    email: "joshua@example.com",
                    password: "WrongPassword123!",
                }),
            ).rejects.toThrow();
        });

        expect(
            queryClient.getQueryData(queryKeys.auth.currentUser),
        ).toEqual(authenticatedUser);
    });
});



describe("useRegister", () => {
    it("updates the current-user cache after successful registration", async () => {
        server.use(
            http.post("*/auth/register", () => {
                return HttpResponse.json(
                    {
                        status: "success",
                        data: authenticatedUser,
                    },
                    { status: 201 },
                );
            }),
        );

        const queryClient = new QueryClient();
        const { result } = renderHook(() => useRegister(), {
            wrapper: createWrapper(queryClient),
        });

        await act(async () => {
            await result.current.mutateAsync({
                displayName: "Test User",
                email: "joshua@example.com",
                password: "ValidPassword123!",
            });
        });

        expect(
            queryClient.getQueryData(queryKeys.auth.currentUser),
        ).toEqual(authenticatedUser);
    });

    it("preserves the current-user cache when registration fails", async () => {
        server.use(
            http.post("*/auth/register", () => {
                return HttpResponse.json(
                    {
                        status: "error",
                        message: "Email already exists",
                    },
                    { status: 409 },
                );
            }),
        );

        const queryClient = new QueryClient();

        queryClient.setQueryData(
            queryKeys.auth.currentUser,
            authenticatedUser,
        );

        const { result } = renderHook(() => useRegister(), {
            wrapper: createWrapper(queryClient),
        });

        await act(async () => {
            await expect(
                result.current.mutateAsync({
                    displayName: "Test User",
                    email: "joshua@example.com",
                    password: "ValidPassword123!",
                }),
            ).rejects.toThrow();
        });

        expect(
            queryClient.getQueryData(queryKeys.auth.currentUser),
        ).toEqual(authenticatedUser);
    });
});



describe("useLogout", () => {
    it("sets the current-user cache to null after successful logout", async () => {
        server.use(
            http.post("*/auth/logout", () => {
                return HttpResponse.json({
                    status: "success",
                    message: "Logged out successfully",
                });
            }),
        );

        const queryClient = new QueryClient();

        queryClient.setQueryData(
            queryKeys.auth.currentUser,
            authenticatedUser,
        );

        const { result } = renderHook(() => useLogout(), {
            wrapper: createWrapper(queryClient),
        });

        await act(async () => {
            await result.current.mutateAsync();
        });

        expect(
            queryClient.getQueryData(queryKeys.auth.currentUser),
        ).toBeNull();
    });

    it("preserves the current-user cache when logout fails", async () => {
        server.use(
            http.post("*/auth/logout", () => {
                return HttpResponse.json(
                    {
                        status: "error",
                        message: "Unable to log out",
                    },
                    { status: 500 },
                );
            }),
        );

        const queryClient = new QueryClient();

        queryClient.setQueryData(
            queryKeys.auth.currentUser,
            authenticatedUser,
        );

        const { result } = renderHook(() => useLogout(), {
            wrapper: createWrapper(queryClient),
        });

        await act(async () => {
            await expect(
                result.current.mutateAsync(),
            ).rejects.toThrow();
        });

        expect(
            queryClient.getQueryData(queryKeys.auth.currentUser),
        ).toEqual(authenticatedUser);
    });
});
