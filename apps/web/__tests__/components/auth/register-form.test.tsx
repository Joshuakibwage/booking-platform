import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { RegisterForm } from "@/components/auth/register-form";

afterEach(() => {
    cleanup();
});

describe("RegisterForm", () => {
    it("displays validation errors when submitted with empty fields", async () => {
        const onSubmit = vi.fn();

        render(<RegisterForm onSubmit={onSubmit} />);

        fireEvent.click(
            screen.getByRole("button", { name: "Create account" }),
        );

        expect(
            await screen.findByText("Name must be at least 2 characters."),
        ).toBeInTheDocument();

        expect(
            screen.getByText("Please enter a valid email address."),
        ).toBeInTheDocument();

        expect(
            screen.getByText("Password must be at least 12 characters."),
        ).toBeInTheDocument();

        expect(onSubmit).not.toHaveBeenCalled();
    });

    it("submits valid registration data with normalized values", async () => {
        const onSubmit = vi.fn();

        render(<RegisterForm onSubmit={onSubmit} />);

        fireEvent.change(screen.getByLabelText(/name/i), {
            target: { value: "  Joshua Kibwage  " },
        });

        fireEvent.change(screen.getByLabelText(/email/i), {
            target: { value: " JOSHUA@EXAMPLE.COM " },
        });

        fireEvent.change(screen.getByLabelText("Password"), {
            target: { value: "ValidPassword123!" },
        });

        fireEvent.click(
            screen.getByRole("button", { name: "Create account" }),
        );

        await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());

        expect(onSubmit.mock.calls[0]?.[0]).toEqual({
            displayName: "Joshua Kibwage",
            email: "joshua@example.com",
            password: "ValidPassword123!",
        });
    });

    it("displays the API error message", () => {
        render(
            <RegisterForm
                onSubmit={vi.fn()}
                errorMessage="An account with this email already exists."
            />,
        );

        expect(
            screen.getByRole("alert"),
        ).toHaveTextContent("An account with this email already exists.");
    });

    it("toggles password visibility", () => {
        render(<RegisterForm onSubmit={vi.fn()} />);

        const passwordInput = screen.getByLabelText("Password");

        expect(passwordInput).toHaveAttribute("type", "password");

        fireEvent.click(screen.getByRole("button", { name: "Show password" }));

        expect(passwordInput).toHaveAttribute("type", "text");

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

        render(<RegisterForm onSubmit={onSubmit} />);

        fireEvent.change(screen.getByLabelText("Full name"), {
            target: { value: "Joshua Kibwage" },
        });

        fireEvent.change(screen.getByLabelText("Email address"), {
            target: { value: "joshua@example.com" },
        });

        fireEvent.change(screen.getByLabelText("Password"), {
            target: { value: "ValidPassword123!" },
        });

        const submitButton = screen.getByRole("button", {
            name: "Create account",
        });

        fireEvent.click(submitButton);

        const loadingButton = await screen.findByRole("button", {
            name: "Creating account...",
        });

        expect(loadingButton).toBeDisabled();

        resolveSubmission();
    });
});