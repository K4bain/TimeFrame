import { useState, useCallback } from "react";
import { trpc } from "@/lib/api/trpc";
import { errorMessage } from "@/types/errors";
import { normalizeUrl } from "@/utils";
import type { Capture } from "@/types";

interface SearchResult {
  site: string;
  captures: Capture[];
  firstCapture: string;
  lastCapture: string;
  totalCaptures: number;
}

interface UseSearchReturn {
  result: SearchResult | null;
  isLoading: boolean;
  error: string | null;
  search: (query: string) => Promise<void>;
}

export function useSearch(): UseSearchReturn {
  const [result, setResult] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const utils = trpc.useUtils();

  const search = useCallback(async (query: string) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const site = normalizeUrl(query);
      if (!site) {
        setError("Please enter a valid domain");
        return;
      }

      const coverage = await utils.search.checkCoverage.fetch({ domain: site });
      if (!coverage.success) {
        setError(errorMessage(coverage.error));
        return;
      }

      const timeline = await utils.archive.getTimeline.fetch({ domain: site });
      if (!timeline.success) {
        setError(errorMessage(timeline.error));
        return;
      }

      const captures: Capture[] = timeline.data.snapshots.map((s) => ({
        timestamp: s.timestamp,
        url: s.url,
        status: s.statusCode,
        mimetype: s.mimetype,
      }));

      setResult({
        site,
        captures,
        firstCapture: timeline.data.firstSnapshot,
        lastCapture: timeline.data.lastSnapshot,
        totalCaptures: timeline.data.totalCount,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to search archive"
      );
    } finally {
      setIsLoading(false);
    }
  }, [utils]);

  return { result, isLoading, error, search };
}
