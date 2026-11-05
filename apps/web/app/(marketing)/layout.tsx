
import type { ReactNode } from "react";

import { AppNavbar } from "@/components/navigation/app-navbar";
import { SiteFooter } from "@/components/layout/site-footer";

export default function MarketingLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <AppNavbar context="marketing" />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}
