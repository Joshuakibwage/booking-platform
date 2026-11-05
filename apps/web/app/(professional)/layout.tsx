
import type { ReactNode } from "react";

import { AppNavbar } from "@/components/navigation/app-navbar";

export default function ProfessionalLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <AppNavbar context="professional" />
      <main className="min-h-screen">{children}</main>
    </>
  );
}
