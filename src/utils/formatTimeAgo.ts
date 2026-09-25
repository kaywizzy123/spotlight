const UNITS: [label: string, seconds: number][] = [
  ["year", 60 * 60 * 24 * 365],
  ["month", 60 * 60 * 24 * 30],
  ["week", 60 * 60 * 24 * 7],
  ["day", 60 * 60 * 24],
  ["hour", 60 * 60],
  ["minute", 60],
];

// Formats a timestamp as "just now", "5 minutes ago", "2 days ago", etc.
export function formatTimeAgo(timestamp: number) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  for (const [label, unitSeconds] of UNITS) {
    const value = Math.floor(seconds / unitSeconds);
    if (value >= 1) return `${value} ${label}${value > 1 ? "s" : ""} ago`;
  }

  return "just now";
}
