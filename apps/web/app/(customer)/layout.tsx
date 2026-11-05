
import type { ReactNode } from "react";

import { AppNavbar } from "@/components/navigation/app-navbar";

export default function CustomerLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <AppNavbar context="customer" />
      <main className="min-h-screen">{children}</main>
    </>
  );
}
