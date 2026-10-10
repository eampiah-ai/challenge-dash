"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  parseLocalDate,
  isSunday,
  isLastDayOfMonth,
} from "@/lib/dates";

interface EntryFormProps {
  displayName: string;
  timezone: string;
  defaultDate: string;
}

const dailyHabits = [
  { key: "steps7000", label: "7,000 steps" },
  { key: "workout45", label: "Workout / gym — 45+ min" },
  { key: "prayerMeditation10", label: "Prayer / meditation — 10+ min" },
  { key: "water80oz", label: "Drink 80+ oz water" },
  { key: "eatAtHome", label: "Eat at home (Mon–Thu)" },
  { key: "learnRead15", label: "Learn / read — 15+ min" },
  { key: "podcastEpisode", label: "Podcast — 1 episode (Mon–Thu)" },
];

export function EntryForm({
  displayName,
  timezone,
  defaultDate,
}: EntryFormProps) {
  const router = useRouter();
  const [date, setDate] = useState(defaultDate);
  const [daily, setDaily] = useState<Record<string, boolean>>({});
  const [weekly, setWeekly] = useState({ savings200: false, projectHobbyMinutes: 0 });
  const [biWeekly, setBiWeekly] = useState({ alcoholUsed: false, sweetsUsed: false });
  const [monthly, setMonthly] = useState({ fastCompleted: false });
  const [sundayReset, setSundayReset] = useState({
    planWorkouts: false,
    planMeals: false,
    planSavings: false,
    setTop3Goals: false,
    checkProgressReset: false,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const selectedIsSunday = isSunday(date, timezone);
  const selectedIsLastDayOfMonth = isLastDayOfMonth(date, timezone);
  const selectedDate = parseLocalDate(date, timezone);
  const dayOfWeek = selectedDate.getDay();
  const isMonThu = dayOfWeek >= 1 && dayOfWeek <= 4;

  useEffect(() => {
    let cancelled = false;

    async function loadExistingEntry() {
      try {
        const res = await fetch(`/api/progress?date=${date}`);
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (cancelled) return;
        if (data.daily) {
          setDaily({
            steps7000: data.daily.steps7000,
            workout45: data.daily.workout45,
            prayerMeditation10: data.daily.prayerMeditation10,
            water80oz: data.daily.water80oz,
            eatAtHome: data.daily.eatAtHome,
            learnRead15: data.daily.learnRead15,
            podcastEpisode: data.daily.podcastEpisode,
          });
        } else {
          setDaily({});
        }
        if (data.weekly) {
          setWeekly({
            savings200: data.weekly.savings200,
            projectHobbyMinutes: data.weekly.projectHobbyMinutes,
          });
        } else {
          setWeekly({ savings200: false, projectHobbyMinutes: 0 });
        }
        if (data.biWeekly) {
          setBiWeekly({
            alcoholUsed: data.biWeekly.alcoholUsed,
            sweetsUsed: data.biWeekly.sweetsUsed,
          });
        } else {
          setBiWeekly({ alcoholUsed: false, sweetsUsed: false });
        }
        if (data.monthly) {
          setMonthly({ fastCompleted: data.monthly.fastCompleted });
        } else {
          setMonthly({ fastCompleted: false });
        }
        if (data.sundayReset) {
          setSundayReset({
            planWorkouts: data.sundayReset.planWorkouts,
            planMeals: data.sundayReset.planMeals,
            planSavings: data.sundayReset.planSavings,
            setTop3Goals: data.sundayReset.setTop3Goals,
            checkProgressReset: data.sundayReset.checkProgressReset,
          });
        } else {
          setSundayReset({
            planWorkouts: false,
            planMeals: false,
            planSavings: false,
            setTop3Goals: false,
            checkProgressReset: false,
          });
        }
      } catch {
        // ignore load errors
      }
    }

    loadExistingEntry();

    return () => {
      cancelled = true;
    };
  }, [date]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const payload: Record<string, unknown> = { date };
      payload.daily = daily;
      payload.weekly = weekly;
      payload.biWeekly = biWeekly;
      if (selectedIsLastDayOfMonth) payload.monthly = monthly;
      if (selectedIsSunday) payload.sundayReset = sundayReset;

      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save progress");
      } else {
        setMessage("Progress saved!");
        router.refresh();
      }
    } catch {
      setError("Failed to save progress");
    } finally {
      setLoading(false);
    }
  };

  const toggleDaily = (key: string) => {
    setDaily((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleSundayReset = (key: keyof typeof sundayReset) => {
    setSundayReset((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Log Progress</h1>
        <span className="text-sm text-gray-500">Hello, {displayName}</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500"
          />
          <p className="mt-1 text-xs text-gray-500">Timezone: {timezone}</p>
        </div>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Daily Habits</h2>
          <div className="space-y-2">
            {dailyHabits.map((habit) => (
              <label
                key={habit.key}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer"
              >
                <span className="text-gray-700">{habit.label}</span>
                <input
                  type="checkbox"
                  checked={!!daily[habit.key]}
                  onChange={() => toggleDaily(habit.key)}
                  className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </label>
            ))}
          </div>
          {!isMonThu && (
            <p className="mt-2 text-xs text-amber-600">
              Eat at home and podcast are typically Mon–Thu habits.
            </p>
          )}
        </section>

        <section className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Weekly Habits</h2>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              due this week
            </span>
          </div>
          <label className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-white cursor-pointer mb-3">
            <span className="text-gray-700">Save $200</span>
            <input
              type="checkbox"
              checked={weekly.savings200}
              onChange={(e) =>
                setWeekly((prev) => ({ ...prev, savings200: e.target.checked }))
              }
              className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </label>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project / hobby minutes this week
            </label>
            <input
              type="number"
              min={0}
              value={weekly.projectHobbyMinutes}
              onChange={(e) =>
                setWeekly((prev) => ({
                  ...prev,
                  projectHobbyMinutes: Number(e.target.value) || 0,
                }))
              }
              className="block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </section>

        <section className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Bi-Weekly Allowances</h2>
            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
              1 per 2 weeks
            </span>
          </div>
          <label className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-white cursor-pointer mb-2">
            <span className="text-gray-700">Alcohol — 1 drink used</span>
            <input
              type="checkbox"
              checked={biWeekly.alcoholUsed}
              onChange={(e) =>
                setBiWeekly((prev) => ({ ...prev, alcoholUsed: e.target.checked }))
              }
              className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </label>
          <label className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-white cursor-pointer">
            <span className="text-gray-700">Sweets — 1 sweet used</span>
            <input
              type="checkbox"
              checked={biWeekly.sweetsUsed}
              onChange={(e) =>
                setBiWeekly((prev) => ({ ...prev, sweetsUsed: e.target.checked }))
              }
              className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </label>
        </section>

        <section
          className={`p-4 rounded-lg ${
            selectedIsLastDayOfMonth ? "bg-amber-50 border border-amber-200" : "bg-gray-100 opacity-60"
          }`}
        >
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Monthly Fast</h2>
            {selectedIsLastDayOfMonth && (
              <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                due today
              </span>
            )}
          </div>
          {selectedIsLastDayOfMonth ? (
            <label className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-white cursor-pointer">
              <span className="text-gray-700">Fasted on the last day of the month</span>
              <input
                type="checkbox"
                checked={monthly.fastCompleted}
                onChange={(e) =>
                  setMonthly({ fastCompleted: e.target.checked })
                }
                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </label>
          ) : (
            <p className="text-sm text-gray-600">
              Monthly fast can only be logged on the last day of the month.
            </p>
          )}
        </section>

        <section
          className={`p-4 rounded-lg ${
            selectedIsSunday ? "bg-emerald-50 border border-emerald-200" : "bg-gray-100 opacity-60"
          }`}
        >
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Sunday Reset</h2>
            {selectedIsSunday && (
              <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full">
                due today
              </span>
            )}
          </div>
          {selectedIsSunday ? (
            <div className="space-y-2">
              {[
                { key: "planWorkouts", label: "Plan workouts" },
                { key: "planMeals", label: "Plan meals" },
                { key: "planSavings", label: "Plan savings" },
                { key: "setTop3Goals", label: "Set top 3 goals for the week" },
                { key: "checkProgressReset", label: "Check progress + reset" },
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-white cursor-pointer"
                >
                  <span className="text-gray-700">{item.label}</span>
                  <input
                    type="checkbox"
                    checked={!!sundayReset[item.key as keyof typeof sundayReset]}
                    onChange={() => toggleSundayReset(item.key as keyof typeof sundayReset)}
                    className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </label>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600">
              Sunday reset can only be logged on a Sunday.
            </p>
          )}
        </section>

        {error && <p className="text-red-600 text-sm">{error}</p>}
        {message && <p className="text-green-600 text-sm">{message}</p>}

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white font-medium py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : "Save Progress"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Dashboard
          </button>
        </div>
      </form>
    </div>
  );
}
