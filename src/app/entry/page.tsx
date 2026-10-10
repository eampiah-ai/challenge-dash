import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { EntryForm } from "@/components/entry-form";
import { formatLocalDate } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function EntryPage() {
  const session = await getSession();
  if (!session.participantId || !session.isLoggedIn) {
    redirect("/login");
  }

  const participant = await prisma.participant.findUnique({
    where: { id: session.participantId },
    include: { challenge: true },
  });

  if (!participant || !participant.challenge) {
    redirect("/login");
  }

  const today = formatLocalDate(new Date(), participant.timezone);

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <EntryForm
          displayName={participant.displayName}
          timezone={participant.timezone}
          defaultDate={today}
        />
      </div>
    </main>
  );
}
