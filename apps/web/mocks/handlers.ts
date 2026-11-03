import { http, HttpResponse } from "msw";

export const handlers = [
    http.get("*/auth/me", () => {
        return HttpResponse.json({
            status: "success",
            data: {
                userId: "test-user-123",
                email: "joshua@example.com",
                displayName: "Test User",
            },
        });
    }),
];