
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
    findAvailabilityException,
    findWeeklyAvailability,
} from "./availability.repository.js";

describe("availability repository", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns an exception when one exists", async () => {
        const exception = {
            is_available: false,
            start_time: null,
            end_time: null,
        };

        queryMock.mockResolvedValue({
            rows: [exception],
        });

        const result = await findAvailabilityException(
            "550e8400-e29b-41d4-a716-446655440000",
            "2026-11-02",
        );

        expect(result).toEqual(exception);
        expect(queryMock).toHaveBeenCalledWith(
            expect.stringContaining("FROM availability_exceptions"),
            [
                "550e8400-e29b-41d4-a716-446655440000",
                "2026-11-02",
            ],
        );
    });

    it("returns null when no exception exists", async () => {
        queryMock.mockResolvedValue({
            rows: [],
        });

        const result = await findAvailabilityException(
            "550e8400-e29b-41d4-a716-446655440000",
            "2026-11-02",
        );

        expect(result).toBeNull();
    });

    it("returns all weekly windows for the requested weekday", async () => {
        const windows = [
            { start_time: "09:00:00", end_time: "12:00:00" },
            { start_time: "13:00:00", end_time: "17:00:00" },
        ];

        queryMock.mockResolvedValue({
            rows: windows,
        });

        const result = await findWeeklyAvailability(
            "550e8400-e29b-41d4-a716-446655440000",
            1,
        );

        expect(result).toEqual(windows);
        expect(queryMock).toHaveBeenCalledWith(
            expect.stringContaining("FROM weekly_availability"),
            ["550e8400-e29b-41d4-a716-446655440000", 1],
        );
    });
});
