import { beforeEach, describe, expect, it, vi } from "vitest";

const {
    findUserByEmailMock,
    findUserByIdMock,
    hashMock,
    verifyMock,
    createUserMock,
} = vi.hoisted(() => ({
    findUserByEmailMock: vi.fn(),
    findUserByIdMock: vi.fn(),
    hashMock: vi.fn(),
    verifyMock: vi.fn(),
    createUserMock: vi.fn(),
}));

vi.mock("argon2", () => ({
    default: {
        hash: hashMock,
        verify: verifyMock,
    },
}));

vi.mock("../repositories/customer.repository.js", () => ({
    createUser: createUserMock,
    findUserByEmail: findUserByEmailMock,
    findUserById: findUserByIdMock,
}));

import { getAuthenticatedUser, loginUser } from "./auth.service.js";

describe("loginUser", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should return public user details when credentials are valid", async () => {
        findUserByEmailMock.mockResolvedValueOnce({
            userId: "user-123",
            email: "joe@example.com",
            displayName: "Joe Kibwage",
            passwordHash: "stored-argon2-hash",
        });

        verifyMock.mockResolvedValueOnce(true);

        const result = await loginUser(
            "joe@example.com",
            "correct-password",
        );

        expect(findUserByEmailMock).toHaveBeenCalledWith("joe@example.com");
        expect(verifyMock).toHaveBeenCalledWith(
            "stored-argon2-hash",
            "correct-password",
        );

        expect(result).toEqual({
            userId: "user-123",
            email: "joe@example.com",
            displayName: "Joe Kibwage",
        });

        expect(result).not.toHaveProperty("passwordHash");
    });

    it("should return null when the email does not exist", async () => {
        findUserByEmailMock.mockResolvedValueOnce(null);

        const result = await loginUser(
            "unknown@example.com",
            "some-password",
        );

        expect(result).toBeNull();
        expect(verifyMock).not.toHaveBeenCalled();
    });

    it("should return null when the password is incorrect", async () => {
        findUserByEmailMock.mockResolvedValueOnce({
            userId: "user-123",
            email: "joe@example.com",
            displayName: "Joe Kibwage",
            passwordHash: "stored-argon2-hash",
        });

        verifyMock.mockResolvedValueOnce(false);

        const result = await loginUser(
            "joe@example.com",
            "wrong-password",
        );

        expect(result).toBeNull();
    });
});


describe("getAuthenticatedUser", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should return the authenticated user's public details", async () => {
        const user = {
            userId: "user-123",
            email: "joe@example.com",
            displayName: "Joe Kibwage",
        };

        findUserByIdMock.mockResolvedValueOnce(user);

        const result = await getAuthenticatedUser("user-123");

        expect(findUserByIdMock).toHaveBeenCalledWith("user-123");
        expect(result).toEqual(user);
        expect(result).not.toHaveProperty("passwordHash");
    });

    it("should return null when the user does not exist", async () => {
        findUserByIdMock.mockResolvedValueOnce(null);

        const result = await getAuthenticatedUser("deleted-user");

        expect(findUserByIdMock).toHaveBeenCalledWith("deleted-user");
        expect(result).toBeNull();
    });
});