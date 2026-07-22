import { useMemo, useCallback } from "react";
import { trpc } from "@/lib/api/trpc";
import { daysBetweenTimestamps, yearFromTimestamp } from "@/utils/dates";
import type { AppError } from "@/types/errors";
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
  error: AppError | null;
  gaps: Set<number>;
  selectedIndex: number;
  goToNext: () => Capture | null;
  goToPrevious: () => Capture | null;
  goToYear: (year: number) => Capture | null;
}

function detectGaps(captures: Capture[]): Set<number> {
  const gaps = new Set<number>();
  for (let i = 1; i < captures.length; i++) {
    const diff = daysBetweenTimestamps(captures[i - 1].timestamp, captures[i].timestamp);
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
    { enabled: domain.length > 0 }
  );

  const resolvedError: AppError | null = error
    ? { code: "ARCHIVE_UNAVAILABLE", retryable: true }
    : result && !result.success
      ? result.error
      : null;

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
    const minYear = yearFromTimestamp(captures[0].timestamp);
    const maxYear = yearFromTimestamp(captures[captures.length - 1].timestamp);

    for (let y = minYear; y <= maxYear; y++) {
      yearMap.set(y, []);
    }

    captures.forEach((capture) => {
      const year = yearFromTimestamp(capture.timestamp);
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
    error: resolvedError,
    gaps,
    selectedIndex,
    goToNext,
    goToPrevious,
    goToYear,
  };
}
