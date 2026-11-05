import Link from "next/link";

export function NavbarBrand() {
  return (
    <Link
      href="/"
      aria-label="Schedulyn home"
      className="flex items-center gap-2 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
    >
      <span className="font-heading text-lg font-semibold tracking-tight">
        Schedulyn
      </span>
    </Link>
  );
}