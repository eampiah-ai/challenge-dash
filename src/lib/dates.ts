import { toDate } from "date-fns-tz";

export function parseLocalDate(dateStr: string, timezone: string): Date {
  return toDate(dateStr, { timeZone: timezone });
}

export function getMondayOfWeek(dateStr: string, timezone: string): string {
  const date = parseLocalDate(dateStr, timezone);
  const day = date.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  const monday = new Date(date);
  monday.setDate(date.getDate() + diff);
  return formatLocalDate(monday, timezone);
}

export function formatLocalDate(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(date)
    .replace(/\//g, "-");
}

export function isSunday(dateStr: string, timezone: string): boolean {
  const date = parseLocalDate(dateStr, timezone);
  return date.getDay() === 0;
}

export function getMonthString(dateStr: string, timezone: string): string {
  const date = parseLocalDate(dateStr, timezone);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
  })
    .format(date)
    .replace(/\//g, "-");
}

export function isLastDayOfMonth(dateStr: string, timezone: string): boolean {
  const date = parseLocalDate(dateStr, timezone);
  const nextDay = new Date(date);
  nextDay.setDate(date.getDate() + 1);
  return nextDay.getMonth() !== date.getMonth();
}

export function getBiWeeklyPeriodStart(dateStr: string, timezone: string, challengeStartDate: Date): string {
  const date = parseLocalDate(dateStr, timezone);
  const challengeStart = new Date(challengeStartDate);
  // Normalize to midnight in the participant's timezone
  const start = parseLocalDate(formatLocalDate(challengeStart, timezone), timezone);
  const msPerDay = 24 * 60 * 60 * 1000;
  const daysSinceStart = Math.floor((date.getTime() - start.getTime()) / msPerDay);
  const periodIndex = Math.floor(daysSinceStart / 14);
  const periodStart = new Date(start);
  periodStart.setDate(start.getDate() + periodIndex * 14);
  return formatLocalDate(periodStart, timezone);
}
