import Link from "next/link";
import { footerLinks } from "@/constants/navigation";


export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <Link href="/" className="font-semibold tracking-tight">
          Schedulyn
        </Link>

        <nav aria-label="Footer navigation" className="flex flex-wrap gap-6">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <p className="text-sm text-muted-foreground">
          © 2026 Schedulyn. All rights reserved.
        </p>
      </div>
    </footer>
  );
}