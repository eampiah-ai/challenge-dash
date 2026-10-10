"use client";

import { useEffect, useState } from "react";

interface ParticipantStats {
  id: string;
  displayName: string;
  timezone: string;
  overallCompletion: number;
  breakdown: {
    daily: number;
    weekly: number;
    biWeekly: number;
    monthly: number;
    sundayReset: number;
  };
  currentStreak: number;
  lastActivityDate: string | null;
}

export function DashboardClient() {
  const [participants, setParticipants] = useState<ParticipantStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setParticipants(data.participants);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load dashboard");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p className="text-gray-500">Loading dashboard...</p>;
  }

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {participants.map((p) => (
        <div
          key={p.id}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">{p.displayName}</h2>
            <span className="text-2xl font-bold text-blue-600">
              {p.overallCompletion}%
            </span>
          </div>

          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Overall completion</span>
              <span>{p.overallCompletion}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${p.overallCompletion}%` }}
              ></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <Stat label="Daily" value={p.breakdown.daily} />
            <Stat label="Weekly" value={p.breakdown.weekly} />
            <Stat label="Bi-weekly" value={p.breakdown.biWeekly} />
            <Stat label="Monthly" value={p.breakdown.monthly} />
            <Stat label="Sunday Reset" value={p.breakdown.sundayReset} />
          </div>

          <div className="flex items-center justify-between text-sm pt-4 border-t border-gray-100">
            <span className="text-gray-600">
              Current streak: <strong className="text-gray-900">{p.currentStreak} days</strong>
            </span>
            <span className="text-gray-500">
              Last active: {p.lastActivityDate || "Never"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-lg font-semibold text-gray-900">{value}%</p>
    </div>
  );
}
