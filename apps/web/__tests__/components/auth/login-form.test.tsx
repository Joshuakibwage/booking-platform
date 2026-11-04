import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { LoginForm } from "@/components/auth/login-form";

afterEach(() => {
    cleanup();
});

describe("LoginForm", () => {
    it("displays validation errors when submitted with empty fields", async () => {
        const onSubmit = vi.fn();

        render(<LoginForm onSubmit={onSubmit} />);

        fireEvent.click(
            screen.getByRole("button", { name: "Sign in" }),
        );

        expect(
            await screen.findByText("Please enter a valid email address."),
        ).toBeInTheDocument();

        expect(
            screen.getByText("Password is required."),
        ).toBeInTheDocument();

        expect(onSubmit).not.toHaveBeenCalled();
    });

    it("submits valid credentials", async () => {
        const onSubmit = vi.fn().mockResolvedValue(undefined);

        render(<LoginForm onSubmit={onSubmit} />);

        fireEvent.change(screen.getByLabelText("Email address"), {
            target: { value: "joshua@example.com" },
        });

        fireEvent.change(screen.getByLabelText("Password"), {
            target: { value: "ValidPassword123!" },
        });

        fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

        await waitFor(() => {
            expect(onSubmit).toHaveBeenCalledOnce();
        });

        expect(onSubmit.mock.calls[0]?.[0]).toEqual({
            email: "joshua@example.com",
            password: "ValidPassword123!",
        });
    });

    it("displays an API error message", () => {
        const onSubmit = vi.fn();

        render(
            <LoginForm
                onSubmit={onSubmit}
                errorMessage="Invalid email or password."
            />,
        );

        expect(screen.getByRole("alert")).toHaveTextContent(
            "Invalid email or password.",
        );
    });

    it("toggles password visibility", () => {
        const onSubmit = vi.fn();

        render(<LoginForm onSubmit={onSubmit} />);

        const passwordInput = screen.getByLabelText("Password");

        expect(passwordInput).toHaveAttribute("type", "password");

        fireEvent.click(screen.getByRole("button", { name: "Show password" }));

        expect(passwordInput).toHaveAttribute("type", "text");

        expect(
            screen.getByRole("button", { name: "Hide password" }),
        ).toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: "Hide password" }));

        expect(passwordInput).toHaveAttribute("type", "password");
    });

    it("disables the submit button while submitting", async () => {
        let resolveSubmission!: () => void;

        const onSubmit = vi.fn(
            () =>
                new Promise<void>((resolve) => {
                    resolveSubmission = resolve;
                }),
        );

        render(<LoginForm onSubmit={onSubmit} />);

        fireEvent.change(screen.getByLabelText("Email address"), {
            target: { value: "joshua@example.com" },
        });

        fireEvent.change(screen.getByLabelText("Password"), {
            target: { value: "ValidPassword123!" },
        });

        fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

        const submittingButton = await screen.findByRole("button", {
            name: "Signing in...",
        });

        expect(submittingButton).toBeDisabled();

        resolveSubmission();
    });
});