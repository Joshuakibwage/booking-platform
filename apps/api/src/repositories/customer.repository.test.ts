
import { beforeEach, describe, expect, it, vi } from "vitest";

const { queryMock } = vi.hoisted(() => ({
    queryMock: vi.fn(),
}));

vi.mock("../db.js", () => ({
    default: {
        query: queryMock,
    },
}));

import { customerExists } from "./customer.repository.js";

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
