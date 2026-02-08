/**
 * Formats an ISO date string into a human-readable relative time.
 * Shows "Xh" for posts less than 24 hours old, otherwise "Mon DD".
 */
export function formatPostTime(isoDate: string): string {
  const date = new Date(isoDate);
  const diffMs = Date.now() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 24) {
    const hours = Math.max(diffHours, 1);
    return `${hours}h`;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
