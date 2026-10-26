import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response, NextFunction } from "express";
import { register, login, logout } from "./auth.controller.js";

const { registerUserMock, loginUserMock } = vi.hoisted(() => ({
    registerUserMock: vi.fn(),
    loginUserMock: vi.fn(),
}));

vi.mock("../services/auth.service.js", () => ({
    registerUser: registerUserMock,
    loginUser: loginUserMock,
}));

describe("Authentication controllers", () => {
    let req: Request;
    let res: Response;
    let next: NextFunction;
    let statusMock: ReturnType<typeof vi.fn>;
    let jsonMock: ReturnType<typeof vi.fn>;
    let regenerateMock: ReturnType<typeof vi.fn>;
    let saveMock: ReturnType<typeof vi.fn>;
    let destroyMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        vi.clearAllMocks();

        statusMock = vi.fn().mockReturnThis();
        jsonMock = vi.fn();
        regenerateMock = vi.fn((callback) => callback(null));
        saveMock = vi.fn((callback) => callback(null));
        destroyMock = vi.fn((callback) => callback(null));

        req = {
            body: {
                email: "joe@example.com",
                password: "secure-password-123",
                displayName: "Joe Kibwage",
            },
            session: {
                regenerate: regenerateMock,
                save: saveMock,
                destroy: destroyMock,
            },
        } as unknown as Request;

        res = {
            status: statusMock,
            json: jsonMock,
            clearCookie: vi.fn(),
        } as unknown as Response;

        next = vi.fn();
    });

    describe("register", () => {
        it("should register the user and establish a session", async () => {
            const user = {
                userId: "user-123",
                email: "joe@example.com",
                displayName: "Joe Kibwage",
            };

            registerUserMock.mockResolvedValueOnce(user);

            await register(req, res, next);

            expect(registerUserMock).toHaveBeenCalledWith(
                "joe@example.com",
                "secure-password-123",
                "Joe Kibwage",
            );

            expect(regenerateMock).toHaveBeenCalledOnce();
            expect(saveMock).toHaveBeenCalledOnce();

            expect(req.session.user).toEqual({
                userId: "user-123",
            });

            expect(statusMock).toHaveBeenCalledWith(201);
            expect(jsonMock).toHaveBeenCalledWith({
                status: "success",
                data: user,
            });

            expect(next).not.toHaveBeenCalled();
        });
    });

    describe("login", () => {
        it("should return 400 for invalid input", async () => {
            req.body = {
                email: "invalid-email",
                password: "some-password",
            };

            await login(req, res, next);

            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith({
                status: "error",
                message: "Invalid login request",
            });
            expect(loginUserMock).not.toHaveBeenCalled();
        });

        it("should return 401 for invalid credentials", async () => {
            req.body = {
                email: "joe@example.com",
                password: "wrong-password",
            };

            loginUserMock.mockResolvedValueOnce(null);

            await login(req, res, next);

            expect(loginUserMock).toHaveBeenCalledWith(
                "joe@example.com",
                "wrong-password",
            );

            expect(statusMock).toHaveBeenCalledWith(401);
            expect(jsonMock).toHaveBeenCalledWith({
                status: "error",
                message: "Invalid email or password",
            });

            expect(regenerateMock).not.toHaveBeenCalled();
        });

        it("should log in the user and establish a session", async () => {
            req.body = {
                email: "  JOE@EXAMPLE.COM ",
                password: "correct-password",
            };

            const user = {
                userId: "user-123",
                email: "joe@example.com",
                displayName: "Joe Kibwage",
            };

            loginUserMock.mockResolvedValueOnce(user);

            await login(req, res, next);

            expect(loginUserMock).toHaveBeenCalledWith(
                "joe@example.com",
                "correct-password",
            );

            expect(regenerateMock).toHaveBeenCalledOnce();
            expect(saveMock).toHaveBeenCalledOnce();

            expect(req.session.user).toEqual({
                userId: "user-123",
            });

            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith({
                status: "success",
                data: user,
            });

            expect(next).not.toHaveBeenCalled();
        });
    });

    describe("logout", () => {
        it("should destroy the session and return success", () => {
            logout(req, res, next);

            expect(destroyMock).toHaveBeenCalledOnce();
            expect(res.clearCookie).toHaveBeenCalledWith(
                "connect.sid",
                {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "lax",
                },
            );

            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith({
                status: "success",
                message: "Logged out successfully",
            });

            expect(next).not.toHaveBeenCalled();
        });

        it("should pass session destruction errors to the error handler", () => {
            const sessionError = new Error("Session destruction failed");

            destroyMock.mockImplementationOnce((callback) => {
                callback(sessionError);
            });

            logout(req, res, next);

            expect(next).toHaveBeenCalledWith(sessionError);
            expect(statusMock).not.toHaveBeenCalled();
            expect(jsonMock).not.toHaveBeenCalled();
        });
    });
});
