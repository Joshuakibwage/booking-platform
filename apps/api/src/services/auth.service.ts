import argon2 from "argon2";
import { createUser, findUserByEmail } from "../repositories/customer.repository.js";
import type { RegisteredUser } from "../types/auth.types.js";



export async function registerUser(
    email: string,
    password: string,
    displayName: string,
): Promise<RegisteredUser> {
    const passwordHash = await argon2.hash(password);

    return createUser(email, passwordHash, displayName);
};


export async function loginUser(
    email: string,
    password: string,
): Promise<RegisteredUser | null> {
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

    return {
        userId: user.userId,
        email: user.email,
        displayName: user.displayName,
    };
}
