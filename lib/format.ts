export const money = (n: number) =>
  "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });

export const moneyK = (n: number) => "$" + (n / 1000).toFixed(1) + "k";

export const initials = (name: string) =>
  name
    .replace(/[^a-zA-Z ]/g, "")
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

/**
 * Next sequential reference like "INV-2093" or "EST-1046", given the ones that
 * already exist. Demo-grade (computed client-side); a production system would
 * use a Postgres sequence to avoid collisions under concurrency.
 */
export function nextRef(existing: string[], prefix: string, start = 1): string {
  const nums = existing
    .map((r) => Number(r.replace(prefix + "-", "")))
    .filter((n) => Number.isFinite(n));
  const max = nums.length ? Math.max(...nums) : start - 1;
  return `${prefix}-${Math.max(max + 1, start)}`;
}

const AVATAR_COLORS = [
  "var(--slate)",
  "var(--clay)",
  "var(--good)",
  "#6B4E8C",
  "var(--warn)",
];
export const avatarColor = (i: number) =>
  AVATAR_COLORS[i % AVATAR_COLORS.length];
