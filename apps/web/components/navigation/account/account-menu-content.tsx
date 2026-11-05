import Link from "next/link";

import type { AuthUser } from "@/types/auth";
import type { NavbarContext } from "@/constants/navigation";

type AccountMenuContentProps = {
    user: AuthUser;
    context: NavbarContext;
    onLogout: () => void;
    isLoggingOut: boolean;
    onNavigate: () => void;
};

export function AccountMenuContent({
    user,
    context,
    onLogout,
    isLoggingOut,
    onNavigate
}: AccountMenuContentProps) {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">{user.displayName}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>

            <div className="flex flex-col gap-1 border-t pt-3">
                {user.hasProfessionalProfile && context === "professional" ? (
                    <Link
                        onClick={onNavigate}
                        href="/customer/bookings"
                        className="rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent"
                    >
                        Customer workspace
                    </Link>
                ) : user.hasProfessionalProfile ? (
                    <Link
                        onClick={onNavigate}
                        href="/professional/dashboard"
                        className="rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent"
                    >
                        Professional workspace
                    </Link>
                ) : (
                    <Link
                        onClick={onNavigate}
                        href="/become-a-professional"
                        className="rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent"
                    >
                        Become a Professional
                    </Link>
                )}
            </div>

            <div className="border-t pt-3">
                <button
                    type="button"
                    onClick={onLogout}
                    disabled={isLoggingOut}
                    className="w-full rounded-md px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isLoggingOut ? "Signing out..." : "Sign out"}
                </button>
            </div>
        </div>
    );
}