import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { DashboardClient } from "@/components/dashboard-client";
import { LogoutButton } from "@/components/logout-button";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session.participantId || !session.isLoggedIn) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Challenge Dashboard</h1>
          <div className="flex items-center gap-4">
            <Link
              href="/entry"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Log Progress
            </Link>
            <LogoutButton />
          </div>
        </div>
        <DashboardClient />
      </div>
    </main>
  );
}
