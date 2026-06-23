/** Date/time formatting helpers for the dashboard. Keep display-only. */

/** "Monday, July 28" */
export function formatHeaderDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

/** Time-of-day greeting based on the local hour. */
export function greeting(date: Date): string {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

/**
 * Friendly date/time for an upcoming visit, e.g. "Today, 2:30 PM",
 * "Tomorrow, 9:00 AM", or "Mon, Jul 28, 2:30 PM".
 */
export function formatVisitWhen(iso: string, now = new Date()): string {
  const start = new Date(iso);
  const time = start.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

  const startDay = new Date(
    start.getFullYear(),
    start.getMonth(),
    start.getDate(),
  ).getTime();
  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  const dayMs = 24 * 60 * 60 * 1000;
  const diffDays = Math.round((startDay - today) / dayMs);

  if (diffDays === 0) return `Today, ${time}`;
  if (diffDays === 1) return `Tomorrow, ${time}`;

  const day = start.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  return `${day}, ${time}`;
}
