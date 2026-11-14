import { addMonths, addWeeks, addYears } from "date-fns";

const DAY_MS = 86_400_000;

export const RECURRENCE_OPTIONS = [
  { value: "ONCE", label: "One-time" },
  { value: "WEEKLY", label: "Weekly" },
  { value: "MONTHLY", label: "Monthly" },
  { value: "YEARLY", label: "Yearly" },
] as const;

export type Recurrence = (typeof RECURRENCE_OPTIONS)[number]["value"];

export function parseDueDate(value: string): Date {
  return new Date(`${value.slice(0, 10)}T12:00:00.000Z`);
}

export function toDateInput(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function utcMidnight(date: Date | string): number {
  const d = new Date(date);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

export function daysUntil(date: Date | string): number {
  return Math.round((utcMidnight(date) - utcMidnight(new Date())) / DAY_MS);
}

export function sameUtcDay(a: Date | string, b: Date | string): boolean {
  return utcMidnight(a) === utcMidnight(b);
}

export function monthKey(date: Date | string): string {
  const d = new Date(date);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const d = new Date(date);
  const sameYear = d.getUTCFullYear() === new Date().getUTCFullYear();
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    year: sameYear ? undefined : "numeric",
    ...options,
  }).format(d);
}

export function formatLongDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    weekday: "short",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function relativeDueLabel(date: Date | string): string {
  const days = daysUntil(date);
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  if (days === -1) return "1 day overdue";
  if (days < 0) return `${Math.abs(days)} days overdue`;
  return `Due in ${days} days`;
}

export function nextOccurrence(due: Date, recurrence: string): Date {
  const current = new Date(due);
  let next = new Date(current);
  const now = new Date();
  let guard = 0;

  do {
    if (recurrence === "WEEKLY") next = addWeeks(next, 1);
    else if (recurrence === "YEARLY") next = addYears(next, 1);
    else if (recurrence === "MONTHLY") next = addMonths(next, 1);
    else break;
    guard += 1;
  } while (utcMidnight(next) <= utcMidnight(now) && guard < 600);

  return next;
}

export function lastMonths(count: number): { key: string; label: string; date: Date }[] {
  const now = new Date();
  const months: { key: string; label: string; date: Date }[] = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1, 12));
    months.push({
      key: monthKey(date),
      label: new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "short" }).format(date),
      date,
    });
  }
  return months;
}

export function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}
