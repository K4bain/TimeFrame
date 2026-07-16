import { useMemo, useCallback } from "react";
import { trpc } from "@/lib/api/trpc";
import { errorMessage } from "@/types/errors";
import type { Capture } from "@/types";

interface YearData {
  year: number;
  captures: Capture[];
  density: number;
}

interface UseTimelineReturn {
  captures: Capture[];
  years: YearData[];
  selectedCapture: Capture | null;
  isLoading: boolean;
  error: string | null;
  gaps: Set<number>;
  selectedIndex: number;
  goToNext: () => Capture | null;
  goToPrevious: () => Capture | null;
  goToYear: (year: number) => Capture | null;
}

function parseTimestampToDate(timestamp: string): Date {
  const year = parseInt(timestamp.slice(0, 4), 10);
  const month = parseInt(timestamp.slice(4, 6), 10) - 1;
  const day = parseInt(timestamp.slice(6, 8), 10);
  return new Date(year, month, day);
}

function daysBetween(a: string, b: string): number {
  const dateA = parseTimestampToDate(a);
  const dateB = parseTimestampToDate(b);
  const diffMs = Math.abs(dateB.getTime() - dateA.getTime());
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

function detectGaps(captures: Capture[]): Set<number> {
  const gaps = new Set<number>();
  for (let i = 1; i < captures.length; i++) {
    const diff = daysBetween(captures[i - 1].timestamp, captures[i].timestamp);
    if (diff > 90) {
      gaps.add(i);
    }
  }
  return gaps;
}

export function useTimeline(
  domain: string,
  selectedTimestamp?: string
): UseTimelineReturn {
  const { data: result, isLoading, error } = trpc.archive.getTimeline.useQuery(
    { domain },
    { enabled: typeof window !== 'undefined' && domain.length > 0 }
  );

  const captures: Capture[] = useMemo(() => {
    if (result?.success) {
      const data = result.data as { snapshots: { timestamp: string; url: string; statusCode: number; mimetype: string }[] };
      return data.snapshots.map((s) => ({
        timestamp: s.timestamp,
        url: s.url,
        status: s.statusCode,
        mimetype: s.mimetype,
      }));
    }
    return [];
  }, [result]);

  const gaps = useMemo(() => detectGaps(captures), [captures]);

  const years = useMemo<YearData[]>(() => {
    if (captures.length === 0) return [];

    const yearMap = new Map<number, Capture[]>();
    const minYear = parseInt(captures[0].timestamp.slice(0, 4), 10);
    const maxYear = parseInt(captures[captures.length - 1].timestamp.slice(0, 4), 10);

    for (let y = minYear; y <= maxYear; y++) {
      yearMap.set(y, []);
    }

    captures.forEach((capture) => {
      const year = parseInt(capture.timestamp.slice(0, 4), 10);
      yearMap.get(year)?.push(capture);
    });

    const maxCount = Math.max(...Array.from(yearMap.values()).map((c) => c.length), 1);

    return Array.from(yearMap.entries()).map(([year, caps]) => ({
      year,
      captures: caps,
      density: caps.length / maxCount,
    }));
  }, [captures]);

  const selectedCapture = useMemo(() => {
    if (!selectedTimestamp || captures.length === 0) return null;
    return captures.find((c) => c.timestamp === selectedTimestamp) || null;
  }, [selectedTimestamp, captures]);

  const selectedIndex = selectedCapture
    ? captures.findIndex((c) => c.timestamp === selectedCapture.timestamp)
    : -1;

  const goToNext = useCallback((): Capture | null => {
    if (selectedIndex < captures.length - 1) {
      return captures[selectedIndex + 1];
    }
    return null;
  }, [selectedIndex, captures]);

  const goToPrevious = useCallback((): Capture | null => {
    if (selectedIndex > 0) {
      return captures[selectedIndex - 1];
    }
    return null;
  }, [selectedIndex, captures]);

  const goToYear = useCallback((year: number): Capture | null => {
    const yearData = years.find((y) => y.year === year);
    if (yearData && yearData.captures.length > 0) {
      return yearData.captures[0];
    }
    return null;
  }, [years]);

  return {
    captures,
    years,
    selectedCapture,
    isLoading,
    error: error ? error.message : (result && !result.success ? errorMessage(result.error) : null),
    gaps,
    selectedIndex,
    goToNext,
    goToPrevious,
    goToYear,
  };
}
