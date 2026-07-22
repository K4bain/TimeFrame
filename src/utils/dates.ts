/**
 * Shared date/time parsing utilities.
 *
 * Consolidates duplicated logic previously spread across
 * use-timeline, context-service, archive-service, and the explore page.
 */

/**
 * Parse a Wayback Machine 14-digit timestamp (YYYYMMDDHHmmss) into a Date.
 * Only uses the year/month/day portion for consistency.
 */
export function parseTimestampToDate(timestamp: string): Date {
  const year = parseInt(timestamp.slice(0, 4), 10);
  const month = parseInt(timestamp.slice(4, 6), 10) - 1;
  const day = parseInt(timestamp.slice(6, 8), 10);
  return new Date(year, month, day);
}

/**
 * Compute the number of days between two Wayback timestamps.
 */
export function daysBetweenTimestamps(a: string, b: string): number {
  const dateA = parseTimestampToDate(a);
  const dateB = parseTimestampToDate(b);
  return Math.floor(Math.abs(dateB.getTime() - dateA.getTime()) / 86400000);
}

/**
 * Convert a Wayback timestamp to an ISO date string (YYYY-MM-DD).
 */
export function formatWaybackDate(timestamp: string): string {
  return `${timestamp.slice(0, 4)}-${timestamp.slice(4, 6)}-${timestamp.slice(6, 8)}`;
}

/**
 * Shift a Wayback timestamp by a number of months and return a new
 * 14-digit Wayback-compatible timestamp (time portion zeroed).
 */
export function shiftMonths(ts: string, months: number): string {
  const d = parseTimestampToDate(ts);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10).replace(/-/g, "") + "000000";
}

/**
 * Find the nearest capture to a target timestamp from a list of captures.
 */
export function findNearestCapture(
  captures: { timestamp: string }[],
  targetTs: string
): { timestamp: string } | undefined {
  if (captures.length === 0) return undefined;
  const target = parseTimestampToDate(targetTs);
  let best = captures[0];
  let bestDiff = Math.abs(parseTimestampToDate(best.timestamp).getTime() - target.getTime());
  for (let i = 1; i < captures.length; i++) {
    const diff = Math.abs(parseTimestampToDate(captures[i].timestamp).getTime() - target.getTime());
    if (diff < bestDiff) {
      bestDiff = diff;
      best = captures[i];
    }
  }
  return best;
}

/**
 * Extract the 4-digit year from a Wayback timestamp.
 */
export function yearFromTimestamp(timestamp: string): number {
  return parseInt(timestamp.slice(0, 4), 10);
}
