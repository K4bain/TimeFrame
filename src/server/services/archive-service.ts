import { ok, err, type Result } from '@/types/errors';
import { daysBetweenTimestamps, formatWaybackDate } from '@/utils/dates';
import { searchCDX, getWaybackAvailability } from './archive';

export interface SnapshotData {
  timestamp: string;
  date: string;
  url: string;
  statusCode: number;
  mimetype: string;
  size: number;
}

export interface TimelineResult {
  domain: string;
  snapshots: SnapshotData[];
  totalCount: number;
  firstSnapshot: string;
  lastSnapshot: string;
  coverageGaps: { from: string; to: string; durationDays: number }[];
}

export interface SnapshotResult {
  url: string;
  timestamp: string;
  date: string;
  isAvailable: boolean;
}

export interface NearestResult {
  snapshot: { timestamp: string; date: string; url: string; distanceDays: number };
}

export async function getTimeline(domain: string, fromYear?: number, toYear?: number): Promise<Result<TimelineResult>> {
  try {
    const results = await searchCDX(domain, { limit: 2000, from: fromYear, to: toYear });
    if (!results || results.length === 0) return err({ code: 'NO_COVERAGE', domain });
    const snapshots: SnapshotData[] = results.map(r => ({ timestamp: r.timestamp, date: formatWaybackDate(r.timestamp), url: r.original, statusCode: parseInt(r.statuscode, 10) || 0, mimetype: r.mimetype || '', size: parseInt(r.length, 10) || 0 }));
    const coverageGaps: { from: string; to: string; durationDays: number }[] = [];
    for (let i = 1; i < snapshots.length; i++) {
      const diff = daysBetweenTimestamps(snapshots[i-1].timestamp, snapshots[i].timestamp);
      if (diff > 90) coverageGaps.push({ from: snapshots[i-1].timestamp, to: snapshots[i].timestamp, durationDays: diff });
    }
    return ok({ domain, snapshots, totalCount: snapshots.length, firstSnapshot: snapshots[0].timestamp, lastSnapshot: snapshots[snapshots.length-1].timestamp, coverageGaps });
  } catch { return err({ code: 'ARCHIVE_UNAVAILABLE', retryable: true }); }
}

export async function getSnapshot(domain: string, timestamp: string): Promise<Result<SnapshotResult>> {
  try {
    const availability = await getWaybackAvailability(domain, timestamp);
    const snapshot = availability.archived_snapshots?.closest;
    if (!snapshot) return err({ code: 'SNAPSHOT_UNAVAILABLE', domain, timestamp });
    return ok({ url: snapshot.url, timestamp: snapshot.timestamp, date: formatWaybackDate(snapshot.timestamp), isAvailable: true });
  } catch { return err({ code: 'ARCHIVE_UNAVAILABLE', retryable: true }); }
}

export async function getNearestSnapshot(domain: string, targetDate: string, direction: 'before' | 'after' | 'nearest'): Promise<Result<NearestResult>> {
  try {
    const results = await searchCDX(domain, { limit: 500 });
    if (!results || results.length === 0) return err({ code: 'NO_COVERAGE', domain });
    const target = targetDate.replace(/-/g, '') + '000000';
    if (direction === 'before') {
      const c = results.filter(r => r.timestamp <= target);
      if (!c.length) return err({ code: 'NO_SNAPSHOTS_IN_DIRECTION', domain, direction: 'before' });
      const best = c[c.length-1];
      return ok({ snapshot: { timestamp: best.timestamp, date: formatWaybackDate(best.timestamp), url: best.original, distanceDays: daysBetweenTimestamps(best.timestamp, target) } });
    }
    if (direction === 'after') {
      const c = results.filter(r => r.timestamp >= target);
      if (!c.length) return err({ code: 'NO_SNAPSHOTS_IN_DIRECTION', domain, direction: 'after' });
      const best = c[0];
      return ok({ snapshot: { timestamp: best.timestamp, date: formatWaybackDate(best.timestamp), url: best.original, distanceDays: daysBetweenTimestamps(best.timestamp, target) } });
    }
    let best = results[0];
    let bestDist = daysBetweenTimestamps(best.timestamp, target);
    for (let i = 1; i < results.length; i++) {
      const d = daysBetweenTimestamps(results[i].timestamp, target);
      if (d < bestDist) { bestDist = d; best = results[i]; }
    }
    return ok({ snapshot: { timestamp: best.timestamp, date: formatWaybackDate(best.timestamp), url: best.original, distanceDays: bestDist } });
  } catch { return err({ code: 'ARCHIVE_UNAVAILABLE', retryable: true }); }
}
