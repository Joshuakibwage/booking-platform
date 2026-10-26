import type { SessionData } from "express-session";

export interface AuthenticatedUser {
    userId: string;
}

declare module "express-session" {
    interface SessionData {
        user?: AuthenticatedUser;
    }
}

export interface RegisteredUser {
    userId: string;
    email: string;
    displayName: string;
}