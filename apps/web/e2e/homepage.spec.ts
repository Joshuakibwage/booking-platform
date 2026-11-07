
import { expect, test } from "@playwright/test";

test("homepage displays its main heading", async ({ page }) => {
    await page.goto("/");

    await expect(
        page.getByRole("heading", {
            level: 1,
            name: "Independent professionals, booked in minutes.",
        }),
    ).toBeVisible();
});

test("homepage displays all service categories", async ({ page }) => {
    await page.goto("/");

    const categories = [
        "Beauty & personal care",
        "Health & wellness",
        "Learning & coaching",
        "Home services",
        "Business & consulting",
        "Events & creativity",
    ];

    for (const category of categories) {
        const categoryLink = page.getByRole("link", {
            name: new RegExp(category, "i"),
        });

        await expect(categoryLink).toBeVisible();
        await expect(categoryLink).toHaveAttribute("href", "/explore");
    }
});

test("desktop navigation displays the correct links", async ({ page }) => {
    await page.goto("/");

    const navigation = page.getByRole("navigation", {
        name: "Main navigation",
    });

    await expect(navigation).toBeVisible();

    await expect(
        navigation.getByRole("link", { name: "Explore" }),
    ).toHaveAttribute("href", "/explore");

    await expect(
        navigation.getByRole("link", { name: "Professionals" }),
    ).toHaveAttribute("href", "/professionals");

    await expect(
        navigation.getByRole("link", { name: "About" }),
    ).toHaveAttribute("href", "/about");
});

test("mobile navigation opens and closes after selecting a link", async ({
    page,
}) => {
    await page.setViewportSize({ width: 390, height: 844 });
    
    await page.goto("/");

    const menuButton = page.getByRole("button", {
        name: "Open navigation menu",
    });

    await expect(menuButton).toBeVisible();
    await menuButton.click();

    await expect(page.getByRole("dialog")).toBeVisible();

    const navigation = page.getByRole("navigation", {
        name: "Mobile navigation",
    });

    await expect(navigation).toBeVisible();

    await navigation.getByRole("link", { name: "About" }).click();

    await expect(page).toHaveURL(/\/about$/);
    await expect(navigation).not.toBeVisible();
});


test("FAQ allows visitors to switch between questions", async ({ page }) => {
    await page.goto("/");

    const firstQuestion = page.getByRole("button", {
        name: /What is Schedulyn/,
    });

    const secondQuestion = page.getByRole("button", {
        name: /What kinds of services can I find/,
    });

    // The first question is open by default.
    await expect(firstQuestion).toHaveAttribute("aria-expanded", "true");

    // Open the second question.
    await secondQuestion.click();

    // Only the second question should remain open.
    await expect(secondQuestion).toHaveAttribute("aria-expanded", "true");
    await expect(firstQuestion).toHaveAttribute("aria-expanded", "false");
});

test("hero displays CTAs with the correct destinations", async ({ page }) => {
    await page.goto("/");

    const hero = page.locator('section[aria-labelledby="hero-heading"]');

    const exploreLink = hero.locator('a[href="/explore"]').filter({
        hasText: "Explore services",
    });

    const professionalLink = hero.getByRole("link", {
        name: "Become a professional",
    });

    await expect(exploreLink).toBeVisible();
    await expect(professionalLink).toBeVisible();

    await expect(exploreLink).toHaveAttribute("href", "/explore");
    await expect(professionalLink).toHaveAttribute(
        "href",
        "/become-a-professional",
    );
});


test("final CTA displays the correct destinations", async ({ page }) => {
    await page.goto("/");

    const finalCta = page.locator(
        'section[aria-labelledby="final-cta-heading"]',
    );

    await expect(finalCta).toBeVisible();

    await expect(
        finalCta.locator('a[href="/explore"]'),
    ).toBeVisible();

    await expect(
        finalCta.locator('a[href="/become-a-professional"]'),
    ).toBeVisible();
});