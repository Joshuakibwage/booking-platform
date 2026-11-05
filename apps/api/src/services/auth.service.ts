import argon2 from "argon2";

import {
    createUser,
    findUserByEmail,
    findUserById,
} from "../repositories/customer.repository.js";

import type { CurrentUser } from "../types/auth.types.js";

export async function registerUser(
    email: string,
    password: string,
    displayName: string,
): Promise<CurrentUser> {
    const passwordHash = await argon2.hash(password);

    const user = await createUser(email, passwordHash, displayName);
    const currentUser = await findUserById(user.userId);

    if (!currentUser) {
        throw new Error("Failed to retrieve newly created user");
    }

    return currentUser;
}

export async function loginUser(
    email: string,
    password: string,
): Promise<CurrentUser | null> {
    const user = await findUserByEmail(email);

    if (!user) {
        return null;
    }

    const passwordMatches = await argon2.verify(
        user.passwordHash,
        password,
    );

    if (!passwordMatches) {
        return null;
    }

    return findUserById(user.userId);
}

export async function getAuthenticatedUser(
    userId: string,
): Promise<CurrentUser | null> {
    return findUserById(userId);
}