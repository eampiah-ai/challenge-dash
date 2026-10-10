import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { ProfileClient } from "@/components/profile-client";
import { NavBar } from "@/components/nav-bar";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session.participantId || !session.isLoggedIn) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <main className="py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>
          <ProfileClient />
        </div>
      </main>
    </div>
  );
}
