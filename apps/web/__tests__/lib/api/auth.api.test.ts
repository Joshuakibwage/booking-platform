import { describe, expect, it } from "vitest";
import { getCurrentUser } from "@/lib/api/auth.api";
import { http, HttpResponse } from "msw";
import { server } from "@/mocks/server";


describe("getCurrentUser", () => {
    it("returns the authenticated user", async () => {
        const user = await getCurrentUser();

        expect(user).toEqual({
            userId: "test-user-123",
            email: "joshua@example.com",
            displayName: "Test User",
        });
    });

    it("throws an error when the user is unauthenticated", async () => {
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

        await expect(getCurrentUser()).rejects.toMatchObject({
            response: {
            status: 401,
            },
        });
    });
});