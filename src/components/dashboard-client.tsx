"use client";

import { useEffect, useState } from "react";

interface DailyLog {
  date: string;
  steps7000: boolean;
  workout45: boolean;
  prayerMeditation10: boolean;
  water80oz: boolean;
  eatAtHome: boolean;
  learnRead15: boolean;
  podcastEpisode: boolean;
}

interface WeeklyLog {
  weekStart: string;
  savings200: boolean;
  projectHobbyMinutes: number;
}

interface BiWeeklyLog {
  periodStart: string;
  alcoholUsed: boolean;
  sweetsUsed: boolean;
}

interface MonthlyLog {
  month: string;
  fastCompleted: boolean;
}

interface SundayResetLog {
  sundayDate: string;
  planWorkouts: boolean;
  planMeals: boolean;
  planSavings: boolean;
  setTop3Goals: boolean;
  checkProgressReset: boolean;
}

interface ParticipantData {
  id: string;
  displayName: string;
  timezone: string;
  overallCompletion: number;
  breakdown: {
    daily: number;
    weekly: number;
    monthly: number;
    sundayReset: number;
  };
  currentStreak: number;
  lastActivityDate: string | null;
  todayDailyCompleted: number;
  todayDailyTotal: number;
  last7Days: { date: string; log: DailyLog | null }[];
  currentWeekly: WeeklyLog | null;
  currentBiWeekly: BiWeeklyLog | null;
  currentMonthly: MonthlyLog | null;
  lastSundayReset: SundayResetLog | null;
}

const dailyHabits: { key: keyof DailyLog; label: string }[] = [
  { key: "steps7000", label: "Steps" },
  { key: "workout45", label: "Workout" },
  { key: "prayerMeditation10", label: "Prayer" },
  { key: "water80oz", label: "Water" },
  { key: "eatAtHome", label: "Eat home" },
  { key: "learnRead15", label: "Learn" },
  { key: "podcastEpisode", label: "Podcast" },
];

export function DashboardClient() {
  const [participants, setParticipants] = useState<ParticipantData[]>([]);
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
    <div className="space-y-8">
      {participants.map((p) => (
        <ParticipantCard key={p.id} participant={p} />
      ))}
    </div>
  );
}

function ParticipantCard({ participant: p }: { participant: ParticipantData }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{p.displayName}</h2>
            <p className="text-sm text-gray-500">
              Streak: <span className="font-medium text-gray-900">{p.currentStreak} days</span>
              {p.lastActivityDate && (
                <span className="ml-3">Last active: {p.lastActivityDate}</span>
              )}
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-blue-600">{p.overallCompletion}%</p>
            <p className="text-xs text-gray-500 uppercase tracking-wide">overall</p>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-700 font-medium">
              Today: {p.todayDailyCompleted}/{p.todayDailyTotal} daily habits
            </span>
            <span className="text-gray-500">
              {Math.round((p.todayDailyCompleted / p.todayDailyTotal) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all"
              style={{ width: `${(p.todayDailyCompleted / p.todayDailyTotal) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MiniStat label="Daily" value={p.breakdown.daily} />
          <MiniStat label="Weekly" value={p.breakdown.weekly} />
          <MiniStat label="Monthly" value={p.breakdown.monthly} />
          <MiniStat label="Sunday Reset" value={p.breakdown.sundayReset} />
        </div>
      </div>

      <div className="p-6 space-y-6">
        <section>
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
            Last 7 Days
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 pr-4 font-medium text-gray-500">Habit</th>
                  {p.last7Days.map((d) => (
                    <th key={d.date} className="text-center py-2 px-1 font-medium text-gray-500 min-w-[2.5rem]">
                      {formatDay(d.date)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dailyHabits.map((habit) => (
                  <tr key={habit.key} className="border-b border-gray-100 last:border-0">
                    <td className="py-2 pr-4 text-gray-700">{habit.label}</td>
                    {p.last7Days.map((d) => {
                      const done = !!d.log?.[habit.key];
                      return (
                        <td key={d.date} className="text-center py-2 px-1">
                          <span
                            className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                              done
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-400"
                            }`}
                          >
                            {done ? "✓" : "—"}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="grid md:grid-cols-2 gap-4">
          <StatusCard title="This Week" done={p.currentWeekly?.savings200 && p.currentWeekly?.projectHobbyMinutes >= 120}>
            <p className="text-sm text-gray-600">
              Save $200: {p.currentWeekly?.savings200 ? "Done" : "Not done"}
            </p>
            <p className="text-sm text-gray-600">
              Project/hobby: {p.currentWeekly?.projectHobbyMinutes || 0} min
              {p.currentWeekly && p.currentWeekly.projectHobbyMinutes >= 120 && (
                <span className="text-green-600 ml-1">✓</span>
              )}
            </p>
          </StatusCard>

          <StatusCard title="This 2-Week Period" done={!!p.currentBiWeekly}>
            <p className="text-sm text-gray-600">
              Alcohol used: {p.currentBiWeekly?.alcoholUsed ? "Yes" : "No"}
            </p>
            <p className="text-sm text-gray-600">
              Sweets used: {p.currentBiWeekly?.sweetsUsed ? "Yes" : "No"}
            </p>
          </StatusCard>

          <StatusCard title="This Month" done={p.currentMonthly?.fastCompleted}>
            <p className="text-sm text-gray-600">
              Fast completed: {p.currentMonthly?.fastCompleted ? "Yes" : "Not logged"}
            </p>
          </StatusCard>

          <StatusCard title="Last Sunday Reset" done={p.lastSundayReset?.planWorkouts && p.lastSundayReset?.planMeals && p.lastSundayReset?.planSavings && p.lastSundayReset?.setTop3Goals && p.lastSundayReset?.checkProgressReset}>
            {p.lastSundayReset ? (
              <ul className="text-sm text-gray-600 space-y-1">
                <li>Plan workouts: {p.lastSundayReset.planWorkouts ? "✓" : "—"}</li>
                <li>Plan meals: {p.lastSundayReset.planMeals ? "✓" : "—"}</li>
                <li>Plan savings: {p.lastSundayReset.planSavings ? "✓" : "—"}</li>
                <li>Top 3 goals: {p.lastSundayReset.setTop3Goals ? "✓" : "—"}</li>
                <li>Check progress: {p.lastSundayReset.checkProgressReset ? "✓" : "—"}</li>
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No Sunday reset logged</p>
            )}
          </StatusCard>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-lg font-semibold text-gray-900">{value}%</p>
    </div>
  );
}

function StatusCard({ title, done, children }: { title: string; done: boolean | undefined; children: React.ReactNode }) {
  return (
    <div className={`rounded-lg p-4 border ${done ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"}`}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-gray-900">{title}</h4>
        {done ? (
          <span className="text-green-600 font-bold">✓</span>
        ) : (
          <span className="text-gray-400 font-bold">—</span>
        )}
      </div>
      {children}
    </div>
  );
}

function formatDay(dateStr: string) {
  const date = new Date(`${dateStr}T00:00:00`);
  return new Intl.DateTimeFormat("en-US", { weekday: "narrow" }).format(date);
}
