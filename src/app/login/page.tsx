"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timezoneChoice, setTimezoneChoice] = useState<{
    stored: string;
    detected: string;
  } | null>(null);

  const detectedTimezone =
    typeof window !== "undefined"
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : "America/Chicago";

  const submitLogin = async (timezoneAction?: "keep" | "update") => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: displayName.trim(),
          password,
          timezone: detectedTimezone,
          timezoneAction,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      if (data.needsTimezoneChoice) {
        setTimezoneChoice({
          stored: data.storedTimezone,
          detected: data.detectedTimezone,
        });
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitLogin();
  };

  const handleTimezoneChoice = (choice: "keep" | "update") => {
    setTimezoneChoice(null);
    submitLogin(choice);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Challenge Dashboard</h1>
        <p className="text-gray-600 mb-6">Log in to track your progress.</p>

        {timezoneChoice ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-700">
              Your home timezone is <strong>{timezoneChoice.stored}</strong>, but we detected{" "}
              <strong>{timezoneChoice.detected}</strong>.
            </p>
            <p className="text-sm text-gray-600">Are you traveling, or has your timezone changed?</p>
            <div className="flex gap-3">
              <button
                onClick={() => handleTimezoneChoice("keep")}
                disabled={loading}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Temporary travel
              </button>
              <button
                onClick={() => handleTimezoneChoice("update")}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Update timezone
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className="block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Shared group password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Logging in..." : "Log in"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
