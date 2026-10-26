
import { describe, it, expect, vi } from "vitest";
import type { Request, Response, NextFunction } from "express";
import { requireAuth } from "./auth.middleware.js";

describe("requireAuth", () => {
    it("returns 401 when the user is not authenticated", () => {
        const req = {
            session: {},
        } as Request;

        const statusMock = vi.fn().mockReturnThis();
        const jsonMock = vi.fn();

        const res = {
            status: statusMock,
            json: jsonMock,
        } as unknown as Response;

        const nextMock = vi.fn() as NextFunction;

        requireAuth(req, res, nextMock);

        expect(statusMock).toHaveBeenCalledWith(401);
        expect(jsonMock).toHaveBeenCalledWith({
            status: "error",
            message: "Authentication required",
        });
        expect(nextMock).not.toHaveBeenCalled();
    });


    it("calls next when the user is authenticated", () => {
        const req = {
            session: {
                user: {
                    userId: "user-123",
                },
            },
        } as Request;

        const res = {} as Response;
        const nextMock = vi.fn() as NextFunction;

        requireAuth(req, res, nextMock);

        expect(nextMock).toHaveBeenCalledOnce();
    });

});
