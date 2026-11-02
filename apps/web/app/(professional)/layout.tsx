import type { ReactNode } from "react";

export default function ProfessionalLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <main className="min-h-screen">{children}</main>;
}