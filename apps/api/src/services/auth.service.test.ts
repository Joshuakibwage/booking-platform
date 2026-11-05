
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

    it("returns public user details when credentials are valid", async () => {
        const authenticatedUser = {
            userId: "user-123",
            email: "joe@example.com",
            displayName: "Joe Kibwage",
            hasProfessionalProfile: false,
        };

        findUserByEmailMock.mockResolvedValue({
            userId: "user-123",
            email: "joe@example.com",
            displayName: "Joe Kibwage",
            passwordHash: "stored-argon2-hash",
        });

        verifyMock.mockResolvedValue(true);
        findUserByIdMock.mockResolvedValue(authenticatedUser);

        const result = await loginUser(
            "joe@example.com",
            "correct-password",
        );

        expect(findUserByEmailMock).toHaveBeenCalledWith("joe@example.com");
        expect(verifyMock).toHaveBeenCalledWith(
            "stored-argon2-hash",
            "correct-password",
        );
        expect(findUserByIdMock).toHaveBeenCalledWith("user-123");

        expect(result).toEqual(authenticatedUser);
        expect(result).not.toHaveProperty("passwordHash");
    });

    it("returns null when the email does not exist", async () => {
        findUserByEmailMock.mockResolvedValue(null);

        const result = await loginUser(
            "unknown@example.com",
            "some-password",
        );

        expect(result).toBeNull();
        expect(verifyMock).not.toHaveBeenCalled();
        expect(findUserByIdMock).not.toHaveBeenCalled();
    });

    it("returns null when the password is incorrect", async () => {
        findUserByEmailMock.mockResolvedValue({
            userId: "user-123",
            email: "joe@example.com",
            displayName: "Joe Kibwage",
            passwordHash: "stored-argon2-hash",
        });

        verifyMock.mockResolvedValue(false);

        const result = await loginUser(
            "joe@example.com",
            "wrong-password",
        );

        expect(result).toBeNull();
        expect(findUserByIdMock).not.toHaveBeenCalled();
    });
});

describe("getAuthenticatedUser", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns the authenticated user's public details", async () => {
        const user = {
            userId: "user-123",
            email: "joe@example.com",
            displayName: "Joe Kibwage",
            hasProfessionalProfile: false,
        };

        findUserByIdMock.mockResolvedValue(user);

        const result = await getAuthenticatedUser("user-123");

        expect(findUserByIdMock).toHaveBeenCalledWith("user-123");
        expect(result).toEqual(user);
        expect(result).not.toHaveProperty("passwordHash");
    });

    it("returns null when the user does not exist", async () => {
        findUserByIdMock.mockResolvedValue(null);

        const result = await getAuthenticatedUser("deleted-user");

        expect(findUserByIdMock).toHaveBeenCalledWith("deleted-user");
        expect(result).toBeNull();
    });
});
