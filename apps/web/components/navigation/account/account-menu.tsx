"use client";

import Link from "next/link";
import { ChevronDown, LogOut } from "lucide-react";
import type { NavbarContext } from "@/constants/navigation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { AuthUser } from "@/types/auth";

type AccountMenuProps = {
  user: AuthUser;
  context: NavbarContext;
  onLogout: () => void;
  isLoggingOut: boolean;
};

export function AccountMenu({
  user,
  context,
  onLogout,
  isLoggingOut,
}: AccountMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
        <span className="max-w-36 truncate">{user.displayName}</span>
        <ChevronDown className="size-4" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex flex-col gap-1">
            <span className="truncate font-medium">{user.displayName}</span>
            <span className="truncate text-xs font-normal text-muted-foreground">
              {user.email}
            </span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {user.hasProfessionalProfile && context === "professional" ? (
            <DropdownMenuItem render={<Link href="/customer/bookings" />}>
                Customer workspace
            </DropdownMenuItem>
            ) : user.hasProfessionalProfile ? (
            <DropdownMenuItem render={<Link href="/professional/dashboard" />}>
                Professional workspace
            </DropdownMenuItem>
            ) : (
            <DropdownMenuItem render={<Link href="/become-a-professional" />}>
                Become a Professional
            </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          disabled={isLoggingOut}
          onClick={onLogout}
          variant="destructive"
        >
          <LogOut className="size-4" />
          {isLoggingOut ? "Signing out..." : "Sign out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}