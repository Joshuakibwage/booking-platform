
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useCurrentUser } from "@/hooks/auth/use-current-user";
import { http, HttpResponse } from "msw";
import { server } from "@/mocks/server";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return function Wrapper({
    children,
  }: {
    children: ReactNode;
  }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
};


describe("useCurrentUser", () => {
  it("returns the authenticated user", async () => {
    const { result } = renderHook(() => useCurrentUser(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual({
      userId: "test-user-123",
      email: "joshua@example.com",
      displayName: "Test User",
    });
  });

  it("returns null when the user is unauthenticated", async () => {
    server.use(
      http.get("*/auth/me", () => {
        return HttpResponse.json(
          {
            status: "error",
            message: "Unauthorized",
          },
          { status: 401 },
        );
      }),
    );

    const { result } = renderHook(() => useCurrentUser(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeNull();
  });

  it("preserves errors when the API fails", async () => {
    server.use(
      http.get("*/auth/me", () => {
        return HttpResponse.json(
          {
            status: "error",
            message: "Internal server error",
          },
          { status: 500 },
        );
      }),
    );

    const { result } = renderHook(() => useCurrentUser(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeDefined();
  });
});