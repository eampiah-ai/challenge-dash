"use client";

import { useEffect, useState } from "react";
import { ParticipantCard } from "./dashboard-client";

type ParticipantData = React.ComponentProps<typeof ParticipantCard>["participant"];

export function ProfileClient() {
  const [participant, setParticipant] = useState<ParticipantData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setParticipant(data.participant);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load profile");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p className="text-gray-500">Loading profile...</p>;
  }

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  if (!participant) {
    return <p className="text-gray-500">No profile found.</p>;
  }

  return <ParticipantCard participant={participant} />;
}
