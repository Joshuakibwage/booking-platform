import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AuthDialog } from "@/components/auth/auth-dialog";

afterEach(() => {
    cleanup();
});

describe("AuthDialog", () => {
    it("displays the login form when mode is login", () => {
        render(
            <AuthDialog
                open={true}
                onOpenChange={vi.fn()}
                mode="login"
                onModeChange={vi.fn()}
                onLoginSubmit={vi.fn().mockResolvedValue(undefined)}
                onRegisterSubmit={vi.fn().mockResolvedValue(undefined)}
            />,
        );

        expect(
            screen.getByRole("heading", { name: "Welcome back" }),
        ).toBeInTheDocument();

        expect(
            screen.getByRole("button", { name: "Sign in" }),
        ).toBeInTheDocument();

        expect(screen.getByLabelText("Email address")).toBeInTheDocument();
        expect(screen.getByLabelText("Password")).toBeInTheDocument();
    });

    it("displays the registration form when mode is register", () => {
        render(
            <AuthDialog
                open={true}
                onOpenChange={vi.fn()}
                mode="register"
                onModeChange={vi.fn()}
                onLoginSubmit={vi.fn().mockResolvedValue(undefined)}
                onRegisterSubmit={vi.fn().mockResolvedValue(undefined)}
            />,
        );

        expect(
            screen.getByRole("heading", { name: "Create your account" }),
        ).toBeInTheDocument();

        expect(
            screen.getByRole("button", { name: "Sign in" }),
        ).toBeInTheDocument();

        expect(screen.getByLabelText("Full name")).toBeInTheDocument();
        expect(screen.getByLabelText("Email address")).toBeInTheDocument();
        expect(screen.getByLabelText("Password")).toBeInTheDocument();
    });

    it("requests registration mode when Create one is clicked", () => {
        const onModeChange = vi.fn();

        render(
            <AuthDialog
                open={true}
                onOpenChange={vi.fn()}
                mode="login"
                onModeChange={onModeChange}
                onLoginSubmit={vi.fn().mockResolvedValue(undefined)}
                onRegisterSubmit={vi.fn().mockResolvedValue(undefined)}
            />,
        );

        fireEvent.click(screen.getByRole("button", { name: "Create one" }));

        expect(onModeChange).toHaveBeenCalledWith("register");
    });

    it("requests login mode when Sign in is clicked", () => {
        const onModeChange = vi.fn();

        render(
            <AuthDialog
                open={true}
                onOpenChange={vi.fn()}
                mode="register"
                onModeChange={onModeChange}
                onLoginSubmit={vi.fn().mockResolvedValue(undefined)}
                onRegisterSubmit={vi.fn().mockResolvedValue(undefined)}
            />,
        );

        fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

        expect(onModeChange).toHaveBeenCalledWith("login");
    });
});