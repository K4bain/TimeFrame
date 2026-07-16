import type { Result, AppError } from './errors';

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

export interface EraData {
  name: string;
  slug: string;
  startYear: number;
  endYear: number | null;
  description: string;
}

export interface SiteContextResult {
  domain: string;
  firstArchived: string;
  totalSnapshots: number;
  coverageQuality: 'good' | 'moderate' | 'sparse';
  changeRecords: { timestamp: string; date: string; changeScore: number; changeType: string }[];
}

export interface SnapshotContextResult {
  era: { name: string; slug: string; description: string };
  snapshotOrdinal: number;
  totalSnapshots: number;
  isChangeMarker: boolean;
  changeContext: {
    score: number;
    type: string;
    prevTimestamp: string | null;
    nextTimestamp: string | null;
  } | null;
}
