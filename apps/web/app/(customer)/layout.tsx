import type { ReactNode } from "react";

export default function CustomerLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <main className="min-h-screen">{children}</main>;
}