
import { describe, expect, it } from "vitest";
import { validateBookingsListInput } from "./bookings-list.validator.js";

const customerId = "550e8400-e29b-41d4-a716-446655440000";
const professionalId = "7ba7b810-9dad-41d1-80b4-00c04fd430c8";

describe("validateBookingsListInput", () => {
    it("applies default pagination when query parameters are omitted", () => {
        expect(
            validateBookingsListInput("customer", customerId, {}),
        ).toEqual({
            owner: { type: "customer", id: customerId },
            page: 1,
            limit: 20,
        });
    });

    it("accepts valid filters and pagination", () => {
        expect(
            validateBookingsListInput("professional", professionalId, {
                status: "confirmed",
                from: "2026-11-01",
                to: "2026-11-30",
                page: "2",
                limit: "10",
            }),
        ).toEqual({
            owner: { type: "professional", id: professionalId },
            status: "confirmed",
            from: "2026-11-01",
            to: "2026-11-30",
            page: 2,
            limit: 10,
        });
    });

    it.each([
        ["invalid owner ID", "not-a-uuid", {}],
        ["invalid status", customerId, { status: "pending" }],
        ["impossible from date", customerId, { from: "2026-02-30" }],
        ["invalid to date", customerId, { to: "not-a-date" }],
        ["from after to", customerId, {
            from: "2026-11-30",
            to: "2026-11-01",
        }],
        ["zero page", customerId, { page: "0" }],
        ["decimal page", customerId, { page: "1.5" }],
        ["zero limit", customerId, { limit: "0" }],
        ["limit above maximum", customerId, { limit: "101" }],
        ["empty page", customerId, { page: "" }],
    ])("rejects %s", (_description, id, query) => {
        expect(
            validateBookingsListInput(
                "customer",
                id,
                query,
            ),
        ).toBeNull();
    });
});
