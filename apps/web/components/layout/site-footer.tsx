import Link from "next/link";
import { footerLinks } from "@/constants/navigation";

export function SiteFooter() {
  return (
    <footer className="overflow-hidden border-t border-border">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 pt-8 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
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

      {/* Wordmark */}
      <Link
        href="/"
        aria-label="Schedulyn home"
        className="mx-auto mt-6 block max-w-7xl px-4 sm:px-6 lg:px-8"
      >
        <svg
          viewBox="0 0 1000 240"
          className="block h-auto w-full select-none"
          aria-hidden="true"
        >
          <text
            x="0"
            y="180"
            fontSize="220"
            fontWeight="700"
            letterSpacing="-6"
            textLength="1000"
            lengthAdjust="spacingAndGlyphs"
            className="fill-foreground opacity-10"
          >
            Schedulyn
          </text>
        </svg>
      </Link>
    </footer>
  );
}
