import Link from "next/link";

export function Header() {
  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-blue-600">
          Property Search
        </Link>
        <nav className="flex gap-4 items-center">
          <Link
            href="/"
            className="text-gray-700 hover:text-blue-600 transition-colors"
          >
            Search
          </Link>
          <Link
            href="/saved-search"
            className="text-gray-700 hover:text-blue-600 transition-colors"
          >
            Saved Searches
          </Link>
          <span className="text-sm text-gray-500">Signed in as Guest</span>
        </nav>
      </div>
    </header>
  );
}

