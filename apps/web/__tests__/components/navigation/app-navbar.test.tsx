
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AppNavbar } from "@/components/navigation/app-navbar";

const {
  useLoginMock,
  useRegisterMock,
  useCurrentUserMock,
  useLogoutMock,
  loginMutateAsyncMock,
  registerMutateAsyncMock,
  logoutMutateAsyncMock,
} = vi.hoisted(() => ({
  useLoginMock: vi.fn(),
  useRegisterMock: vi.fn(),
  useCurrentUserMock: vi.fn(),
  useLogoutMock: vi.fn(),
  loginMutateAsyncMock: vi.fn(),
  registerMutateAsyncMock: vi.fn(),
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

vi.mock("motion/react", () => ({
  MotionConfig: ({ children }: { children: React.ReactNode }) => children,
  useScroll: () => ({ scrollY: {} }),
  useMotionValueEvent: vi.fn(),
}));

const authenticatedUser = {
  userId: "user-123",
  displayName: "Alex Morgan",
  email: "alex@example.com",
  hasProfessionalProfile: true,
};

const customerUser = {
  ...authenticatedUser,
  hasProfessionalProfile: false,
};

beforeEach(() => {
  vi.clearAllMocks();

  loginMutateAsyncMock.mockResolvedValue(undefined);
  registerMutateAsyncMock.mockResolvedValue(undefined);
  logoutMutateAsyncMock.mockResolvedValue(undefined);

  useLoginMock.mockReturnValue({
    mutateAsync: loginMutateAsyncMock,
    isPending: false,
  });

  useRegisterMock.mockReturnValue({
    mutateAsync: registerMutateAsyncMock,
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

describe("AppNavbar", () => {
  describe("marketing context", () => {
    it("renders marketing navigation links when signed out", () => {
      render(<AppNavbar context="marketing" />);

      expect(
        screen.getByRole("navigation", { name: "Main navigation" }),
      ).toBeInTheDocument();

      expect(screen.getByRole("link", { name: "Explore" })).toBeInTheDocument();

      expect(
        screen.getByRole("link", { name: "Professionals" }),
      ).toBeInTheDocument();

      expect(screen.getByRole("link", { name: "About" })).toBeInTheDocument();
    });

    it("shows customer navigation when a user is authenticated", () => {
      useCurrentUserMock.mockReturnValue({
        data: customerUser,
        isPending: false,
      });

      render(<AppNavbar context="marketing" />);

      expect(screen.getByRole("link", { name: "Explore" })).toBeInTheDocument();

      expect(
        screen.getByRole("link", { name: "My Bookings" }),
      ).toHaveAttribute("href", "/customer/bookings");

      expect(
        screen.queryByRole("link", { name: "Professionals" }),
      ).not.toBeInTheDocument();
    });
  });

  describe("professional context", () => {
    it("renders professional navigation links", () => {
      useCurrentUserMock.mockReturnValue({
        data: authenticatedUser,
        isPending: false,
      });

      render(<AppNavbar context="professional" />);

      expect(
        screen.getByRole("link", { name: "Dashboard" }),
      ).toBeInTheDocument();

      expect(
        screen.getByRole("link", { name: "Services" }),
      ).toBeInTheDocument();

      expect(
        screen.getByRole("link", { name: "Availability" }),
      ).toBeInTheDocument();

      expect(
        screen.getByRole("link", { name: "Bookings" }),
      ).toBeInTheDocument();
    });
  });

  describe("authentication", () => {
    it("shows authentication actions when the user is signed out", () => {
      render(<AppNavbar context="marketing" />);

      expect(
        screen.getByRole("button", { name: "Sign in" }),
      ).toBeInTheDocument();

      expect(
        screen.getByRole("button", { name: "Get started" }),
      ).toBeInTheDocument();
    });

    it("opens the login dialog when Sign in is clicked", () => {
      render(<AppNavbar context="marketing" />);

      fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

      expect(screen.getByRole("dialog")).toBeInTheDocument();

      expect(
        screen.getByRole("heading", { name: "Welcome back" }),
      ).toBeInTheDocument();
    });

    it("opens the registration dialog when Get started is clicked", () => {
      render(<AppNavbar context="marketing" />);

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

      render(<AppNavbar context="marketing" />);

      expect(
        screen.queryByRole("button", { name: "Sign in" }),
      ).not.toBeInTheDocument();

      expect(
        screen.queryByRole("button", { name: "Get started" }),
      ).not.toBeInTheDocument();
    });

    it("shows the account menu when the user is authenticated", () => {
      useCurrentUserMock.mockReturnValue({
        data: authenticatedUser,
        isPending: false,
      });

      render(<AppNavbar context="marketing" />);

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

      expect(
        screen.getByRole("menuitem", { name: /Professional workspace/ }),
      ).toBeInTheDocument();

      const signOutItem = screen.getByRole("menuitem", {
        name: /Sign out/,
      });

      expect(signOutItem).toBeInTheDocument();

      fireEvent.click(signOutItem);

      expect(logoutMutateAsyncMock).toHaveBeenCalledOnce();
    });

    it("shows Become a Professional for users without a professional profile", () => {
      useCurrentUserMock.mockReturnValue({
        data: customerUser,
        isPending: false,
      });

      render(<AppNavbar context="marketing" />);

      fireEvent.click(
        screen.getByRole("button", { name: /Alex Morgan/ }),
      );

      expect(
        screen.getByRole("menuitem", { name: /Become a Professional/ }),
      ).toBeInTheDocument();
    });

    it("displays an error when logout fails", async () => {
      useCurrentUserMock.mockReturnValue({
        data: authenticatedUser,
        isPending: false,
      });

      logoutMutateAsyncMock.mockRejectedValueOnce(
        new Error("Unable to sign out. Please try again."),
      );

      render(<AppNavbar context="marketing" />);

      fireEvent.click(
        screen.getByRole("button", { name: /Alex Morgan/ }),
      );

      fireEvent.click(
        screen.getByRole("menuitem", { name: /Sign out/ }),
      );

      expect(await screen.findByRole("alert")).toHaveTextContent(
        "Unable to sign out. Please try again.",
      );
    });

    it("disables the Sign out action while logout is pending", () => {
      useCurrentUserMock.mockReturnValue({
        data: authenticatedUser,
        isPending: false,
      });

      useLogoutMock.mockReturnValue({
        mutateAsync: logoutMutateAsyncMock,
        isPending: true,
      });

      render(<AppNavbar context="marketing" />);

      fireEvent.click(
        screen.getByRole("button", { name: /Alex Morgan/ }),
      );

      expect(
        screen.getByRole("menuitem", { name: /Signing out/ }),
      ).toHaveAttribute("aria-disabled", "true");
    });
  });
});
