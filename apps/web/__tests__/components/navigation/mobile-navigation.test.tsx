
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { MobileNavigation } from "@/components/navigation/mobile-navigation";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/"),
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

const defaultProps = {
  context: "marketing" as const,
  onAuthOpen: vi.fn(),
  currentUser: null,
  isUserLoading: false,
  isLoggingOut: false,
  logoutError: null,
  onLogout: vi.fn().mockResolvedValue(true),
};

describe("MobileNavigation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("opens the menu and displays marketing navigation links", () => {
    render(<MobileNavigation {...defaultProps} />);

    fireEvent.click(
      screen.getByRole("button", { name: "Open navigation menu" }),
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: "Mobile navigation" }),
    ).toBeInTheDocument();

    expect(screen.getByRole("link", { name: "Explore" })).toHaveAttribute(
      "href",
      "/explore",
    );
    expect(
      screen.getByRole("link", { name: "Professionals" }),
    ).toHaveAttribute("href", "/professionals");
    expect(screen.getByRole("link", { name: "About" })).toHaveAttribute(
      "href",
      "/about",
    );
  });

  it("displays customer navigation links in the customer workspace", () => {
    render(<MobileNavigation {...defaultProps} context="customer" />);

    fireEvent.click(
      screen.getByRole("button", { name: "Open navigation menu" }),
    );

    expect(screen.getByRole("link", { name: "Explore" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "My Bookings" }),
    ).toHaveAttribute("href", "/customer/bookings");
  });

  it("displays professional navigation links in the professional workspace", () => {
    render(
      <MobileNavigation
        {...defaultProps}
        context="professional"
        currentUser={authenticatedUser}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Open navigation menu" }),
    );

    expect(
      screen.getByRole("link", { name: "Dashboard" }),
    ).toHaveAttribute("href", "/professional/dashboard");
    expect(
      screen.getByRole("link", { name: "Services" }),
    ).toHaveAttribute("href", "/professional/services");
    expect(
      screen.getByRole("link", { name: "Availability" }),
    ).toHaveAttribute("href", "/professional/availability");
    expect(
      screen.getByRole("link", { name: "Bookings" }),
    ).toHaveAttribute("href", "/professional/bookings");
  });

  it("closes the menu when a navigation link is clicked", () => {
    render(<MobileNavigation {...defaultProps} />);

    fireEvent.click(
      screen.getByRole("button", { name: "Open navigation menu" }),
    );

    fireEvent.click(screen.getByRole("link", { name: "Explore" }));

    expect(
      screen.queryByRole("navigation", { name: "Mobile navigation" }),
    ).not.toBeInTheDocument();
  });

  it("closes the menu and restores focus when Escape is pressed", async () => {
    render(<MobileNavigation {...defaultProps} />);

    const trigger = screen.getByRole("button", {
      name: "Open navigation menu",
    });

    fireEvent.click(trigger);

    expect(screen.getByRole("dialog")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });

    expect(
      screen.queryByRole("navigation", { name: "Mobile navigation" }),
    ).not.toBeInTheDocument();

    await waitFor(() => {
      expect(trigger).toHaveFocus();
    });
  });

  it("closes the menu and opens login when Sign in is clicked", () => {
    render(<MobileNavigation {...defaultProps} />);

    fireEvent.click(
      screen.getByRole("button", { name: "Open navigation menu" }),
    );

    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    expect(defaultProps.onAuthOpen).toHaveBeenCalledWith("login");
    expect(
      screen.queryByRole("navigation", { name: "Mobile navigation" }),
    ).not.toBeInTheDocument();
  });

  it("closes the menu and opens registration when Get started is clicked", () => {
    render(<MobileNavigation {...defaultProps} />);

    fireEvent.click(
      screen.getByRole("button", { name: "Open navigation menu" }),
    );

    fireEvent.click(screen.getByRole("button", { name: "Get started" }));

    expect(defaultProps.onAuthOpen).toHaveBeenCalledWith("register");
    expect(
      screen.queryByRole("navigation", { name: "Mobile navigation" }),
    ).not.toBeInTheDocument();
  });

  it("shows loading placeholders while the user is being fetched", () => {
    render(
      <MobileNavigation
        {...defaultProps}
        isUserLoading={true}
        currentUser={undefined}
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

    expect(document.querySelectorAll(".animate-pulse")).toHaveLength(2);
  });

  it("displays account details when the user is authenticated", () => {
    render(
      <MobileNavigation
        {...defaultProps}
        currentUser={authenticatedUser}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Open navigation menu" }),
    );

    expect(screen.getByText("Alex Morgan")).toBeInTheDocument();
    expect(screen.getByText("alex@example.com")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign out" })).toBeInTheDocument();
  });

  it("shows Become a Professional when the user has no professional profile", () => {
    render(
      <MobileNavigation {...defaultProps} currentUser={customerUser} />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Open navigation menu" }),
    );

    expect(
      screen.getByRole("link", { name: "Become a Professional" }),
    ).toHaveAttribute("href", "/become-a-professional");
  });

  it("closes the menu when Become a Professional is clicked", () => {
    render(
      <MobileNavigation {...defaultProps} currentUser={customerUser} />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Open navigation menu" }),
    );

    fireEvent.click(
      screen.getByRole("link", { name: "Become a Professional" }),
    );

    expect(
      screen.queryByRole("navigation", { name: "Mobile navigation" }),
    ).not.toBeInTheDocument();
  });

  it("shows Professional workspace when the user has a professional profile", () => {
    render(
      <MobileNavigation
        {...defaultProps}
        currentUser={authenticatedUser}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Open navigation menu" }),
    );

    expect(
      screen.getByRole("link", { name: "Professional workspace" }),
    ).toHaveAttribute("href", "/professional/dashboard");
  });

  it("shows Customer workspace in the professional workspace", () => {
    render(
      <MobileNavigation
        {...defaultProps}
        context="professional"
        currentUser={authenticatedUser}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Open navigation menu" }),
    );

    expect(
      screen.getByRole("link", { name: "Customer workspace" }),
    ).toHaveAttribute("href", "/customer/bookings");
  });

  it("closes the menu when switching workspaces", () => {
    render(
      <MobileNavigation
        {...defaultProps}
        currentUser={authenticatedUser}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Open navigation menu" }),
    );

    fireEvent.click(
      screen.getByRole("link", { name: "Professional workspace" }),
    );

    expect(
      screen.queryByRole("navigation", { name: "Mobile navigation" }),
    ).not.toBeInTheDocument();
  });

  it("closes the menu after a successful logout", async () => {
    const onLogout = vi.fn().mockResolvedValue(true);

    render(
      <MobileNavigation
        {...defaultProps}
        currentUser={authenticatedUser}
        onLogout={onLogout}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Open navigation menu" }),
    );

    fireEvent.click(screen.getByRole("button", { name: "Sign out" }));

    await waitFor(() => {
      expect(onLogout).toHaveBeenCalledOnce();
      expect(
        screen.queryByRole("navigation", { name: "Mobile navigation" }),
      ).not.toBeInTheDocument();
    });
  });

  it("keeps the menu open when logout fails", async () => {
    const onLogout = vi.fn().mockResolvedValue(false);

    render(
      <MobileNavigation
        {...defaultProps}
        currentUser={authenticatedUser}
        onLogout={onLogout}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Open navigation menu" }),
    );

    fireEvent.click(screen.getByRole("button", { name: "Sign out" }));

    await waitFor(() => {
      expect(onLogout).toHaveBeenCalledOnce();
      expect(
        screen.getByRole("navigation", { name: "Mobile navigation" }),
      ).toBeInTheDocument();
    });
  });

  it("disables the logout button while logout is pending", () => {
    render(
      <MobileNavigation
        {...defaultProps}
        currentUser={authenticatedUser}
        isLoggingOut={true}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Open navigation menu" }),
    );

    expect(
      screen.getByRole("button", { name: "Signing out..." }),
    ).toBeDisabled();
  });

  it("opens the dialog when the menu trigger is clicked", () => {
    render(<MobileNavigation {...defaultProps} />);

    fireEvent.click(
      screen.getByRole("button", { name: "Open navigation menu" }),
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: "Mobile navigation" }),
    ).toBeInTheDocument();
  });
});
