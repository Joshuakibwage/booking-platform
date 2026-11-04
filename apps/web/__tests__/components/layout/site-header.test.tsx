import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SiteHeader } from "@/components/layout/site-header";

const {
  useLoginMock,
  useRegisterMock,
  useCurrentUserMock,
  useLogoutMock,
  logoutMutateAsyncMock,
} = vi.hoisted(() => ({
  useLoginMock: vi.fn(),
  useRegisterMock: vi.fn(),
  useCurrentUserMock: vi.fn(),
  useLogoutMock: vi.fn(),
  logoutMutateAsyncMock: vi.fn(),
}));

vi.mock("@/hooks/auth/use-login", () => ({
  useLogin: useLoginMock,
}));

vi.mock("@/hooks/auth/use-register", () => ({
  useRegister: useRegisterMock,
}));

vi.mock("@/hooks/auth/use-current-user", () => ({
  useCurrentUser: useCurrentUserMock,
}));

vi.mock("@/hooks/auth/use-logout", () => ({
  useLogout: useLogoutMock,
}));

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/"),
}));

beforeEach(() => {
  logoutMutateAsyncMock.mockReset();

  useLoginMock.mockReturnValue({
    mutateAsync: vi.fn(),
    isPending: false,
  });

  useRegisterMock.mockReturnValue({
    mutateAsync: vi.fn(),
    isPending: false,
  });

  useCurrentUserMock.mockReturnValue({
    data: null,
    isPending: false,
  });

  useLogoutMock.mockReturnValue({
    mutateAsync: logoutMutateAsyncMock,
    isPending: false,
  });
});

afterEach(() => {
  cleanup();
});

describe("SiteHeader", () => {
    it("renders the desktop navigation links", () => {
        render(<SiteHeader />);

        expect(
            screen.getByRole("navigation", { name: "Main navigation" }),
        ).toBeInTheDocument();

        expect(screen.getByRole("link", { name: "Explore" })).toBeInTheDocument();

        expect(
            screen.getByRole("link", { name: "Professionals" }),
        ).toBeInTheDocument();

        expect(
            screen.getByRole("link", { name: "My Bookings" }),
        ).toBeInTheDocument();
    });

    it("shows authentication actions when the user is not logged in", () => {
        render(<SiteHeader />);

        expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument();

        expect(
            screen.getByRole("button", { name: "Get started" }),
        ).toBeInTheDocument();
    });

    it("opens the login dialog when Sign in is clicked", () => {
        render(<SiteHeader />);

        fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

        expect(screen.getByRole("dialog")).toBeInTheDocument();

        expect(
            screen.getByRole("heading", { name: "Welcome back" }),
        ).toBeInTheDocument();
    });

    it("opens the registration dialog when Get started is clicked", () => {
        render(<SiteHeader />);

        fireEvent.click(screen.getByRole("button", { name: "Get started" }));

        expect(screen.getByRole("dialog")).toBeInTheDocument();

        expect(
            screen.getByRole("heading", { name: "Create your account" }),
        ).toBeInTheDocument();
    });

    it("does not show authentication actions while the user is loading", () => {
        useCurrentUserMock.mockReturnValue({
            data: null,
            isPending: true,
        });

        render(<SiteHeader />);

        expect(
            screen.queryByRole("button", { name: "Sign in" }),
        ).not.toBeInTheDocument();

        expect(
            screen.queryByRole("button", { name: "Get started" }),
        ).not.toBeInTheDocument();
    });

    it("shows the account menu when the user is authenticated", () => {
        useCurrentUserMock.mockReturnValue({
            data: {
                displayName: "Alex Morgan",
                email: "alex@example.com",
            },
            isPending: false,
        });

        render(<SiteHeader />);

        const accountButton = screen.getByRole("button", {
            name: /Alex Morgan/,
        });

        expect(accountButton).toBeInTheDocument();

        expect(
            screen.queryByRole("button", { name: "Sign in" }),
        ).not.toBeInTheDocument();

        expect(
            screen.queryByRole("button", { name: "Get started" }),
        ).not.toBeInTheDocument();

        fireEvent.click(accountButton);

        expect(screen.getByText("alex@example.com")).toBeInTheDocument();

        const signOutItem = screen.getByRole("menuitem", {
            name: /Sign out/,
        });

        expect(signOutItem).toBeInTheDocument();

        fireEvent.click(signOutItem);

        expect(logoutMutateAsyncMock).toHaveBeenCalled();
    });

    it("displays an error when logout fails", async () => {
        useCurrentUserMock.mockReturnValue({
            data: {
                displayName: "Alex Morgan",
                email: "alex@example.com",
            },
            isPending: false,
        });

        logoutMutateAsyncMock.mockRejectedValueOnce(
            new Error("Unable to sign out. Please try again."),
        );

        render(<SiteHeader />);

        fireEvent.click(screen.getByRole("button", { name: /Alex Morgan/ }));

        fireEvent.click(screen.getByRole("menuitem", { name: /Sign out/ }));

        expect(await screen.findByRole("alert")).toHaveTextContent(
            "Unable to sign out. Please try again.",
        );
    });

    it("disables the Sign out action while logout is pending", () => {
        useCurrentUserMock.mockReturnValue({
            data: {
                displayName: "Alex Morgan",
                email: "alex@example.com",
            },
            isPending: false,
        });

        useLogoutMock.mockReturnValue({
            mutateAsync: logoutMutateAsyncMock,
            isPending: true,
        });

        render(<SiteHeader />);

        fireEvent.click(
            screen.getByRole("button", { name: /Alex Morgan/ }),
        );

        expect(
            screen.getByRole("menuitem", { name: /Signing out/ }),
        ).toHaveAttribute("aria-disabled", "true");
    });
});
