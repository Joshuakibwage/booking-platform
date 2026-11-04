
"use client";

import { useState, type InputHTMLAttributes } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";

type AuthFormFieldProps = {
    id: string;
    label: string;
    registration: UseFormRegisterReturn;
    error?: string;
} & Pick<
    InputHTMLAttributes<HTMLInputElement>,
    "type" | "autoComplete" | "placeholder"
>;

export function AuthFormField({
    id,
    label,
    registration,
    error,
    type = "text",
    autoComplete,
    placeholder,
}: AuthFormFieldProps) {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const isPasswordField = type === "password";
    const inputType =
        isPasswordField && isPasswordVisible ? "text" : type;

    const errorId = `${id}-error`;

    return (
        <div className="space-y-2">
            <label htmlFor={id} className="text-sm font-medium">
                {label}
            </label>

            <div className="relative">
                <input
                    id={id}
                    type={inputType}
                    autoComplete={autoComplete}
                    placeholder={placeholder}
                    {...registration}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? errorId : undefined}
                    className={`w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                        isPasswordField ? "pr-11" : ""
                    }`}
                />

                {isPasswordField && (
                    <button
                        type="button"
                        onClick={() =>
                            setIsPasswordVisible((previous) => !previous)
                        }
                        aria-label={
                            isPasswordVisible
                                ? "Hide password"
                                : "Show password"
                        }
                        aria-pressed={isPasswordVisible}
                        className="absolute inset-y-0 right-0 flex items-center justify-center px-3 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-ring"
                    >
                        {isPasswordVisible ? (
                            <EyeOff size={18} aria-hidden="true" />
                        ) : (
                            <Eye size={18} aria-hidden="true" />
                        )}
                    </button>
                )}
            </div>

            {error && (
                <p id={errorId} className="text-sm text-destructive">
                    {error}
                </p>
            )}
        </div>
    );
}
