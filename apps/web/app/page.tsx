import { ThemeToggle } from "@/components/shared/theme-toggle";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6">
      <h1 className="text-2xl font-semibold">
        Theme animation preview
      </h1>

      <p className="text-muted-foreground">
        Click the button to switch themes.
      </p>

      <ThemeToggle />
    </main>
  );
}