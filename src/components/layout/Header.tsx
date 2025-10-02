import Link from "next/link";

export function Header() {
  return (
    <header className="border-b bg-background sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl sm:text-2xl">
          Prométrage
        </Link>
        <nav className="flex gap-4 sm:gap-6">
          <Link
            href="/"
            className="text-sm sm:text-base font-medium hover:underline"
          >
            Projets
          </Link>
        </nav>
      </div>
    </header>
  );
}
