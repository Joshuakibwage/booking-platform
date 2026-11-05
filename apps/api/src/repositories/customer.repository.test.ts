
import { beforeEach, describe, expect, it, vi } from "vitest";

const { queryMock } = vi.hoisted(() => ({
    queryMock: vi.fn(),
}));

vi.mock("../db.js", () => ({
    default: {
        query: queryMock,
    },
}));

import {
    customerExists,
    findUserById,
} from "./customer.repository.js";

describe("customerExists", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns true when the customer exists", async () => {
        queryMock.mockResolvedValue({
            rowCount: 1,
        });

        const result = await customerExists(
            "550e8400-e29b-41d4-a716-446655440000",
        );

        expect(result).toBe(true);
        expect(queryMock).toHaveBeenCalledWith(
            expect.stringContaining("FROM users"),
            ["550e8400-e29b-41d4-a716-446655440000"],
        );
    });

    it("returns false when the customer does not exist", async () => {
        queryMock.mockResolvedValue({
            rowCount: 0,
        });

        const result = await customerExists(
            "550e8400-e29b-41d4-a716-446655440000",
        );

        expect(result).toBe(false);
    });
});

describe("findUserById", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns the user with professional profile status when the ID exists", async () => {
        queryMock.mockResolvedValueOnce({
            rows: [
                {
                    user_id: "user-123",
                    email: "joe@example.com",
                    display_name: "Joe Kibwage",
                    has_professional_profile: false,
                },
            ],
        });

        const result = await findUserById("user-123");

        expect(result).toEqual({
            userId: "user-123",
            email: "joe@example.com",
            displayName: "Joe Kibwage",
            hasProfessionalProfile: false,
        });

        expect(queryMock).toHaveBeenCalledWith(
            expect.stringContaining("WHERE u.user_id = $1"),
            ["user-123"],
        );
    });

    it("returns null when the user does not exist", async () => {
        queryMock.mockResolvedValueOnce({
            rows: [],
        });

        const result = await findUserById("deleted-user");

        expect(result).toBeNull();
    });
});
