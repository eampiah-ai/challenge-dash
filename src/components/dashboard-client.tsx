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
  savingsAmount: number;
  projectHobbyMinutes: number;
}

interface BiWeeklyLog {
  periodStart: string;
  alcoholCount: number;
  sweetsCount: number;
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

interface ChallengeGoals {
  savingsGoal: number;
  alcoholAllowance: number;
  sweetsAllowance: number;
}

interface ParticipantData {
  id: string;
  displayName: string;
  timezone: string;
  currentStreak: number;
  lastActivityDate: string | null;
  todayDailyCompleted: number;
  todayDailyTotal: number;
  last7Days: { date: string; log: DailyLog | null }[];
  currentWeekly: WeeklyLog | null;
  currentBiWeekly: BiWeeklyLog | null;
  currentMonthly: MonthlyLog | null;
  lastSundayReset: SundayResetLog | null;
  challenge: ChallengeGoals;
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

export function ParticipantCard({ participant: p }: { participant: ParticipantData }) {
  const weeklyProjectDone = Math.min(p.currentWeekly?.projectHobbyMinutes || 0, 120);
  const sundayResetDone = p.lastSundayReset
    ? [
        p.lastSundayReset.planWorkouts,
        p.lastSundayReset.planMeals,
        p.lastSundayReset.planSavings,
        p.lastSundayReset.setTop3Goals,
        p.lastSundayReset.checkProgressReset,
      ].filter(Boolean).length
    : 0;

  const savingsGoal = p.challenge.savingsGoal;
  const alcoholAllowance = p.challenge.alcoholAllowance;
  const sweetsAllowance = p.challenge.sweetsAllowance;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{p.displayName}</h2>
            <p className="text-sm text-gray-500">
              Streak: <span className="font-medium text-gray-900">{p.currentStreak} days</span>
              {p.lastActivityDate && (
                <span className="ml-3">Last active: {p.lastActivityDate}</span>
              )}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <RingStat
            label="Daily habits"
            completed={p.todayDailyCompleted}
            total={p.todayDailyTotal}
            pass={p.todayDailyCompleted >= p.todayDailyTotal}
          />
          <RingStat
            label="Savings"
            completed={p.currentWeekly?.savingsAmount || 0}
            total={savingsGoal}
            unit="$"
            pass={(p.currentWeekly?.savingsAmount || 0) >= savingsGoal}
          />
          <RingStat
            label="Project time"
            completed={weeklyProjectDone}
            total={120}
            unit="min"
            pass={weeklyProjectDone >= 120}
          />
          <RingStat
            label="Alcohol"
            completed={p.currentBiWeekly?.alcoholCount || 0}
            total={alcoholAllowance}
            pass={(p.currentBiWeekly?.alcoholCount || 0) <= alcoholAllowance}
            failOver
          />
          <RingStat
            label="Sweets"
            completed={p.currentBiWeekly?.sweetsCount || 0}
            total={sweetsAllowance}
            pass={(p.currentBiWeekly?.sweetsCount || 0) <= sweetsAllowance}
            failOver
          />
          <RingStat
            label="Monthly fast"
            completed={p.currentMonthly?.fastCompleted ? 1 : 0}
            total={1}
            pass={p.currentMonthly?.fastCompleted || false}
          />
          <RingStat
            label="Sunday reset"
            completed={sundayResetDone}
            total={5}
            pass={sundayResetDone >= 5}
          />
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
          <StatusCard title="This Week" done={(p.currentWeekly?.savingsAmount || 0) >= savingsGoal && (p.currentWeekly?.projectHobbyMinutes || 0) >= 120}>
            <p className="text-sm text-gray-600">
              Savings: ${p.currentWeekly?.savingsAmount || 0} / ${savingsGoal}
            </p>
            <p className="text-sm text-gray-600">
              Project/hobby: {p.currentWeekly?.projectHobbyMinutes || 0} / 120 min
            </p>
          </StatusCard>

          <StatusCard title="This 2-Week Period" done={(p.currentBiWeekly?.alcoholCount || 0) <= alcoholAllowance && (p.currentBiWeekly?.sweetsCount || 0) <= sweetsAllowance}>
            <p className="text-sm text-gray-600">
              Alcohol: {p.currentBiWeekly?.alcoholCount || 0} / {alcoholAllowance} allowed
            </p>
            <p className="text-sm text-gray-600">
              Sweets: {p.currentBiWeekly?.sweetsCount || 0} / {sweetsAllowance} allowed
            </p>
          </StatusCard>

          <StatusCard title="This Month" done={p.currentMonthly?.fastCompleted}>
            <p className="text-sm text-gray-600">
              Fast completed: {p.currentMonthly?.fastCompleted ? "Yes" : "Not logged"}
            </p>
          </StatusCard>

          <StatusCard title="Last Sunday Reset" done={sundayResetDone >= 5}>
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

function RingStat({
  label,
  completed,
  total,
  unit = "",
  pass,
  failOver,
}: {
  label: string;
  completed: number;
  total: number;
  unit?: string;
  pass: boolean;
  failOver?: boolean;
}) {
  const safeTotal = Math.max(total, 1);
  const displayCompleted = failOver ? completed : Math.min(completed, total);
  const percentage = Math.min(100, Math.round((displayCompleted / safeTotal) * 100));
  const isFail = failOver && completed > total;
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const ringColor = isFail ? "text-red-500" : pass ? "text-green-500" : "text-blue-500";

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative w-16 h-16 mb-2">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 60 60">
          <circle
            cx="30"
            cy="30"
            r={radius}
            stroke="currentColor"
            strokeWidth="5"
            fill="transparent"
            className="text-gray-200"
          />
          <circle
            cx="30"
            cy="30"
            r={radius}
            stroke="currentColor"
            strokeWidth="5"
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={`${ringColor} transition-all duration-500`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-xs font-bold ${isFail ? "text-red-600" : "text-gray-900"}`}>
            {unit === "$" && "$"}
            {displayCompleted}
            {unit && unit !== "$" && <span className="text-[10px] font-normal">{unit}</span>}
            <span className="text-[10px] font-normal text-gray-500">/{total}{unit === "$" ? "$" : unit}</span>
          </span>
        </div>
      </div>
      <p className="text-[10px] font-medium text-gray-700 uppercase tracking-wide text-center leading-tight">{label}</p>
      {isFail && <p className="text-[10px] text-red-600 mt-1">Over limit</p>}
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
