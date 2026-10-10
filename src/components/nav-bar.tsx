"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export function NavBar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const linkClass = (path: string) =>
    `px-4 py-2 rounded-lg font-medium transition-colors ${
      pathname === path
        ? "bg-blue-100 text-blue-700"
        : "text-gray-700 hover:bg-gray-100"
    }`;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="text-lg font-bold text-gray-900">
            Challenge Dash
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className={linkClass("/dashboard")}>
            Dashboard
          </Link>
          <Link href="/entry" className={linkClass("/entry")}>
            Log Progress
          </Link>
          <button
            onClick={handleLogout}
            className="ml-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Log out
          </button>
        </div>
      </div>
    </nav>
  );
}
