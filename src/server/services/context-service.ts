import { ok, err, type Result } from '@/types/errors';
import { searchCDX, getWaybackAvailability } from './archive';
import { getEra } from '../lib/utils';

export interface EraData {
  name: string; slug: string; startYear: number; endYear: number | null; description: string;
}

export interface SiteContextResult {
  domain: string; firstArchived: string; totalSnapshots: number;
  coverageQuality: 'good' | 'moderate' | 'sparse';
  changeRecords: { timestamp: string; date: string; changeScore: number; changeType: string }[];
}

export interface SnapshotContextResult {
  era: { name: string; slug: string; description: string };
  snapshotOrdinal: number; totalSnapshots: number; isChangeMarker: boolean;
  changeContext: { score: number; type: string; prevTimestamp: string | null; nextTimestamp: string | null } | null;
}

export const ERAS: EraData[] = [
  { name: 'The Early Web', slug: 'early-web', startYear: 1991, endYear: 1996, description: 'Text-dominant. No CSS. Academic and hobbyist origins.' },
  { name: 'The Browser Wars', slug: 'browser-wars', startYear: 1996, endYear: 2001, description: 'Table layouts. Animated GIFs. Competing standards.' },
  { name: 'The Dot-Com Era', slug: 'dot-com', startYear: 1999, endYear: 2002, description: 'Aggressive investment. Flash. Rich media experimentation.' },
  { name: 'Post-Crash Web', slug: 'post-crash', startYear: 2002, endYear: 2004, description: 'Consolidation. Simpler. More functional.' },
  { name: 'Web 2.0', slug: 'web-20', startYear: 2004, endYear: 2009, description: 'Ajax. User-generated content. Social networks emerge.' },
  { name: 'The Mobile Transition', slug: 'mobile-transition', startYear: 2007, endYear: 2013, description: 'Responsive design. App ecosystem. Touch interfaces.' },
  { name: 'The Flat Design Era', slug: 'flat-design', startYear: 2013, endYear: 2017, description: 'iOS 7 influence. Minimalism. Card layouts.' },
  { name: 'The Platform Web', slug: 'platform-web', startYear: 2017, endYear: 2022, description: 'Consolidation around a few platforms. Dark mode.' },
  { name: 'The AI Transition', slug: 'ai-transition', startYear: 2022, endYear: null, description: 'AI-generated content. Interface experimentation.' },
];

export function getCoverageQuality(snapshotCount: number): 'good' | 'moderate' | 'sparse' {
  if (snapshotCount > 500) return 'good';
  if (snapshotCount > 100) return 'moderate';
  return 'sparse';
}

export async function getSiteContext(domain: string): Promise<Result<SiteContextResult>> {
  try {
    const results = await searchCDX(domain, { limit: 1000 });
    if (!results || results.length === 0) return err({ code: 'SITE_NOT_FOUND', domain });
    const availability = await getWaybackAvailability(domain);
    const firstSnapshot = availability.archived_snapshots?.closest?.timestamp || results[0].timestamp;
    const changeRecords: { timestamp: string; date: string; changeScore: number; changeType: string }[] = [];
    for (let i = 1; i < results.length; i++) {
      if (Math.abs(parseInt(results[i].timestamp.slice(0, 8), 10) - parseInt(results[i-1].timestamp.slice(0, 8), 10)) > 90) {
        changeRecords.push({ timestamp: results[i].timestamp, date: results[i].timestamp, changeScore: 0.6, changeType: 'size' });
      }
    }
    return ok({ domain, firstArchived: firstSnapshot, totalSnapshots: results.length, coverageQuality: getCoverageQuality(results.length), changeRecords });
  } catch { return err({ code: 'ARCHIVE_UNAVAILABLE', retryable: true }); }
}

export async function getSnapshotContext(domain: string, timestamp: string): Promise<Result<SnapshotContextResult>> {
  try {
    const results = await searchCDX(domain, { limit: 5000 });
    if (!results || results.length === 0) return err({ code: 'SITE_NOT_FOUND', domain });
    const idx = results.findIndex(r => r.timestamp === timestamp);
    if (idx === -1) return err({ code: 'SNAPSHOT_NOT_IN_TIMELINE', domain, timestamp });
    const eraSlug = getEra(timestamp);
    const era = ERAS.find(e => e.slug === eraSlug);
    const prev = idx > 0 ? results[idx-1] : null;
    const next = idx < results.length-1 ? results[idx+1] : null;
    let changeScore = 0; let changeType: string | null = null;
    if (prev && Math.abs(parseInt(timestamp.slice(0, 8), 10) - parseInt(prev.timestamp.slice(0, 8), 10)) > 90) {
      changeScore = 0.6; changeType = 'size';
    }
    return ok({
      era: { name: era?.name || eraSlug, slug: era?.slug || eraSlug, description: era?.description || '' },
      snapshotOrdinal: idx + 1, totalSnapshots: results.length,
      isChangeMarker: changeScore > 0.2,
      changeContext: changeScore > 0.2 ? { score: changeScore, type: changeType || 'size', prevTimestamp: prev?.timestamp || null, nextTimestamp: next?.timestamp || null } : null,
    });
  } catch { return err({ code: 'ARCHIVE_UNAVAILABLE', retryable: true }); }
}
