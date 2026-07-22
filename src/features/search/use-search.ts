import { useState, useCallback, useRef } from "react";
import { trpc } from "@/lib/api/trpc";
import type { AppError } from "@/types/errors";
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
  error: AppError | null;
  search: (query: string) => Promise<void>;
}

export function useSearch(): UseSearchReturn {
  const [result, setResult] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);
  const utils = trpc.useUtils();
  const mountedRef = useRef(true);
  const generationRef = useRef(0);

  const search = useCallback(async (query: string) => {
    const gen = ++generationRef.current;
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const site = normalizeUrl(query);
      if (!site) {
        setError({ code: "INVALID_INPUT", message: "Empty or invalid input" });
        return;
      }

      const timeline = await utils.archive.getTimeline.fetch({ domain: site });
      if (gen !== generationRef.current) return;
      if (!timeline.success) {
        setError(timeline.error);
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
      if (gen !== generationRef.current) return;
      setError({
        code: "UNKNOWN",
        originalError: err instanceof Error ? err.message : undefined,
      });
    } finally {
      if (gen === generationRef.current) setIsLoading(false);
    }
  }, [utils]);

  return { result, isLoading, error, search };
}
