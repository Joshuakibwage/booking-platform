import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MobileNavigation } from "@/components/layout/mobile-navigation";

describe("MobileNavigation", () => {
    afterEach(() => {
        cleanup();
    });

    it("opens the menu and displays navigation links", () => {
        render(
            <MobileNavigation
                onAuthOpen={() => {}}
                currentUser={null}
                isUserLoading={false}
                isLoggingOut={false}
                logoutError={null}
                onLogout={async () => true}
            />,
        );

        expect(
            screen.queryByRole("navigation", { name: "Mobile navigation" }),
        ).not.toBeInTheDocument();

        fireEvent.click(
            screen.getByRole("button", { name: "Open navigation menu" }),
        );

        expect(
            screen.getByRole("navigation", { name: "Mobile navigation" }),
        ).toBeInTheDocument();

        expect(screen.getByRole("link", { name: "Explore" })).toBeInTheDocument();

        expect(
            screen.getByRole("link", { name: "Professionals" }),
        ).toBeInTheDocument();

        expect(
            screen.getByRole("link", { name: "My Bookings" }),
        ).toBeInTheDocument();
    });

    it("closes the menu when a navigation link is clicked", async () => {
        render(
            <MobileNavigation
                onAuthOpen={() => {}}
                currentUser={null}
                isUserLoading={false}
                isLoggingOut={false}
                logoutError={null}
                onLogout={async () => true}
            />,
        );

        fireEvent.click(
            screen.getByRole("button", { name: "Open navigation menu" }),
        );

        const navigation = screen.getByRole("navigation", {
            name: "Mobile navigation",
        });

        const exploreLink = screen.getByRole("link", { name: "Explore" });

        exploreLink.addEventListener("click", (event) => {
            event.preventDefault();
        });

        fireEvent.click(exploreLink);

        await waitForElementToBeRemoved(navigation);
    });

    it("closes the menu and restores focus when Escape is pressed", async () => {
        render(
            <MobileNavigation
                onAuthOpen={() => {}}
                currentUser={null}
                isUserLoading={false}
                isLoggingOut={false}
                logoutError={null}
                onLogout={async () => true}
            />,
        );

        const trigger = screen.getByRole("button", {
            name: "Open navigation menu",
        });

        fireEvent.click(trigger);

        expect(
            screen.getByRole("navigation", { name: "Mobile navigation" }),
        ).toBeInTheDocument();

        fireEvent.keyDown(document, { key: "Escape" });

        await waitForElementToBeRemoved(() =>
            screen.queryByRole("navigation", { name: "Mobile navigation" }),
        );

        expect(trigger).toHaveFocus();
    });

    it("closes the menu when the user clicks outside it", async () => {
        render(
            <>
                <MobileNavigation
                    onAuthOpen={() => {}}
                    currentUser={null}
                    isUserLoading={false}
                    isLoggingOut={false}
                    logoutError={null}
                    onLogout={async () => true}
                />
                <button type="button">Outside button</button>
            </>,
        );

        fireEvent.click(
            screen.getByRole("button", { name: "Open navigation menu" }),
        );

        const navigation = screen.getByRole("navigation", {
            name: "Mobile navigation",
        });

        fireEvent.pointerDown(
            screen.getByRole("button", { name: "Outside button" }),
        );

        await waitForElementToBeRemoved(navigation);
    });

    it("closes the menu and opens login when Sign in is clicked", async () => {
        const onAuthOpen = vi.fn();

        render(
            <MobileNavigation
                onAuthOpen={onAuthOpen}
                currentUser={null}
                isUserLoading={false}
                isLoggingOut={false}
                logoutError={null}
                onLogout={async () => true}
            />,
        );

        fireEvent.click(
            screen.getByRole("button", { name: "Open navigation menu" }),
        );

        fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

        expect(onAuthOpen).toHaveBeenCalledWith("login");

        await waitForElementToBeRemoved(() =>
            screen.queryByRole("navigation", { name: "Mobile navigation" }),
        );
    });

    it("closes the menu and opens registration when Get started is clicked", async () => {
        const onAuthOpen = vi.fn();

        render(
            <MobileNavigation
                onAuthOpen={onAuthOpen}
                currentUser={null}
                isUserLoading={false}
                isLoggingOut={false}
                logoutError={null}
                onLogout={async () => true}
            />,
        );

        fireEvent.click(
            screen.getByRole("button", { name: "Open navigation menu" }),
        );

        fireEvent.click(screen.getByRole("button", { name: "Get started" }));

        expect(onAuthOpen).toHaveBeenCalledWith("register");

        await waitForElementToBeRemoved(() =>
            screen.queryByRole("navigation", { name: "Mobile navigation" }),
        );
    });

    it("shows loading placeholders while the user is being fetched", () => {
        const { container } = render(
            <MobileNavigation
                onAuthOpen={() => {}}
                currentUser={null}
                isUserLoading={true}
                isLoggingOut={false}
                logoutError={null}
                onLogout={async () => true}
            />,
        );

        fireEvent.click(
            screen.getByRole("button", { name: "Open navigation menu" }),
        );

        expect(
            screen.queryByRole("button", { name: "Sign in" }),
        ).not.toBeInTheDocument();

        expect(
            screen.queryByRole("button", { name: "Get started" }),
        ).not.toBeInTheDocument();

        expect(container.querySelectorAll(".animate-pulse")).toHaveLength(2);
    });

    it("displays account details when the user is authenticated", () => {
        render(
            <MobileNavigation
                onAuthOpen={() => {}}
                currentUser={{
                    userId: "user-123",
                    displayName: "Alex Morgan",
                    email: "alex@example.com",
                }}
                isUserLoading={false}
                isLoggingOut={false}
                logoutError={null}
                onLogout={async () => true}
            />,
        );

        fireEvent.click(
            screen.getByRole("button", { name: "Open navigation menu" }),
        );

        expect(screen.getByText("Alex Morgan")).toBeInTheDocument();
        expect(screen.getByText("alex@example.com")).toBeInTheDocument();

        expect(
            screen.getByRole("button", { name: "Sign out" }),
        ).toBeInTheDocument();

        expect(
            screen.queryByRole("button", { name: "Sign in" }),
        ).not.toBeInTheDocument();

        expect(
            screen.queryByRole("button", { name: "Get started" }),
        ).not.toBeInTheDocument();
    });

    it("closes the menu after a successful logout", async () => {
        const onLogout = vi.fn().mockResolvedValue(true);

        render(
            <MobileNavigation
                onAuthOpen={() => {}}
                currentUser={{
                    userId: "user-123",
                    displayName: "Alex Morgan",
                    email: "alex@example.com",
                }}
                isUserLoading={false}
                isLoggingOut={false}
                logoutError={null}
                onLogout={onLogout}
            />,
        );

        fireEvent.click(
            screen.getByRole("button", { name: "Open navigation menu" }),
        );

        fireEvent.click(screen.getByRole("button", { name: "Sign out" }));

        expect(onLogout).toHaveBeenCalledOnce();

        await waitForElementToBeRemoved(() =>
            screen.queryByRole("navigation", { name: "Mobile navigation" }),
        );
    });

    it("keeps the menu open when logout fails", async () => {
        const onLogout = vi.fn().mockResolvedValue(false);

        render(
            <MobileNavigation
                onAuthOpen={() => {}}
                currentUser={{
                    userId: "user-123",
                    displayName: "Alex Morgan",
                    email: "alex@example.com",
                }}
                isUserLoading={false}
                isLoggingOut={false}
                logoutError="Unable to sign out. Please try again."
                onLogout={onLogout}
            />,
        );

        fireEvent.click(
            screen.getByRole("button", { name: "Open navigation menu" }),
        );

        fireEvent.click(screen.getByRole("button", { name: "Sign out" }));

        expect(onLogout).toHaveBeenCalledOnce();

        expect(
            screen.getByRole("navigation", { name: "Mobile navigation" }),
        ).toBeInTheDocument();

        expect(screen.getByRole("alert")).toHaveTextContent(
            "Unable to sign out. Please try again.",
        );
    });

    it("disables the logout button while logout is pending", () => {
        render(
            <MobileNavigation
                onAuthOpen={() => {}}
                currentUser={{
                    userId: "user-123",
                    displayName: "Alex Morgan",
                    email: "alex@example.com",
                }}
                isUserLoading={false}
                isLoggingOut={true}
                logoutError={null}
                onLogout={async () => true}
            />,
        );

        fireEvent.click(
            screen.getByRole("button", { name: "Open navigation menu" }),
        );

        expect(
            screen.getByRole("button", { name: "Signing out..." }),
        ).toBeDisabled();
    });

    it("moves focus to the first navigation link when the menu opens", () => {
        render(
            <MobileNavigation
                onAuthOpen={() => {}}
                currentUser={null}
                isUserLoading={false}
                isLoggingOut={false}
                logoutError={null}
                onLogout={async () => true}
            />,
        );

        fireEvent.click(
            screen.getByRole("button", { name: "Open navigation menu" }),
        );

        expect(screen.getByRole("link", { name: "Explore" })).toHaveFocus();
    });
});