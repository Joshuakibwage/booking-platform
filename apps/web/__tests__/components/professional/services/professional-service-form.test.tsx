
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ProfessionalServiceForm } from "@/components/professional/services/professional-service-form";
import { usePublicServiceCategories } from "@/hooks/public/use-public-service-categories";

vi.mock("@/hooks/public/use-public-service-categories", () => ({
    usePublicServiceCategories: vi.fn(),
}));

afterEach(() => {
    cleanup();
});

describe("ProfessionalServiceForm", () => {
    it("keeps an inactive current category visible and selected when editing", () => {
        const inactiveCategoryId = "11111111-1111-4111-8111-111111111111";
        const activeCategoryId = "22222222-2222-4222-8222-222222222222";

        vi.mocked(usePublicServiceCategories).mockReturnValue({
            data: [
                {
                    category_id: activeCategoryId,
                    name: "Hair",
                    slug: "hair",
                    description: "Hair services",
                    image_url: "",
                    is_active: true,
                    display_order: 1,
                    created_at: "2026-01-01",
                },
            ],
            isLoading: false,
            isError: false,
        } as ReturnType<typeof usePublicServiceCategories>);

        render(
            <ProfessionalServiceForm
                initialValues={{
                    categoryId: inactiveCategoryId,
                    name: "Classic haircut",
                    description: "A classic haircut",
                    durationMinutes: 30,
                    price: 1500,
                }}
                currentCategory={{
                    id: inactiveCategoryId,
                    name: "Barbering",
                }}
                onSubmit={vi.fn().mockResolvedValue(undefined)}
            />,
        );

        const categorySelect = screen.getByRole("combobox", {
            name: "Service category",
        });

        expect(
            screen.getByRole("option", {
                name: "Barbering (inactive)",
            }),
        ).toBeInTheDocument();

        expect(categorySelect).toHaveValue(inactiveCategoryId);
        expect(categorySelect).toBeEnabled();
    });
});
