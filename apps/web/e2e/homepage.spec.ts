
import { expect, test } from "@playwright/test";

test("homepage displays its main heading", async ({ page }) => {
    await page.goto("/");

    await expect(
        page.getByRole("heading", { name: "Home Page" }),
    ).toBeVisible();
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
