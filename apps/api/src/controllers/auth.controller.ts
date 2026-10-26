import type { NextFunction, Request, Response } from "express";
import { registerUser } from "../services/auth.service.js";
import { validateRegisterInput } from "../validators/register.validator.js";
import { loginUser } from "../services/auth.service.js";
import { validateLoginInput } from "../validators/login.validator.js";


export async function register(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    const input = validateRegisterInput(req.body);

    if (!input) {
        res.status(400).json({
            status: "error",
            message: "Invalid registration request",
        });
        return;
    }

    try {
        const user = await registerUser(
            input.email,
            input.password,
            input.displayName,
        );

        req.session.regenerate((error) => {
            if (error) {
                next(error);
                return;
            }

            req.session.user = {
                userId: user.userId,
            };

            req.session.save((saveError) => {
                if (saveError) {
                    next(saveError);
                    return;
                }

                res.status(201).json({
                    status: "success",
                    data: user,
                });
            });
        });

    } catch (error) {
        if (
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            error.code === "23505"
        ) {
            res.status(409).json({
                status: "error",
                message: "Email address is already registered",
            });
            return;
        }

        next(error);
    }

};


export async function login(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    const input = validateLoginInput(req.body);

    if (!input) {
        res.status(400).json({
            status: "error",
            message: "Invalid login request",
        });
        return;
    }

    try {
        const user = await loginUser(input.email, input.password);

        if (!user) {
            res.status(401).json({
                status: "error",
                message: "Invalid email or password",
            });
            return;
        }

        req.session.regenerate((error) => {
            if (error) {
                next(error);
                return;
            }

            req.session.user = {
                userId: user.userId,
            };

            req.session.save((saveError) => {
                if (saveError) {
                    next(saveError);
                    return;
                }

                res.status(200).json({
                    status: "success",
                    data: user,
                });
            });
        });
    } catch (error) {
        next(error);
    }
}

export function logout(
    req: Request,
    res: Response,
    next: NextFunction,
): void {
    req.session.destroy((error) => {
        if (error) {
            next(error);
            return;
        }

        res.clearCookie("connect.sid", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
        });

        res.status(200).json({
            status: "success",
            message: "Logged out successfully",
        });
    });
}