import { useMemo } from "react";
import { trpc } from "@/lib/api/trpc";
import { ERA_DISPLAY } from "@/lib/era-display";
import type { AppError } from "@/types/errors";
import { getEra, getWaybackEmbedUrl } from "@/utils";

interface ViewerState {
  site: string;
  timestamp: string;
  waybackUrl: string;
  isLoading: boolean;
  error: AppError | null;
  era: string;
}

interface UseViewerReturn {
  state: ViewerState;
}

export function useViewer(domain: string, timestamp: string): UseViewerReturn {
  const { data: result, isLoading, error } = trpc.archive.getSnapshot.useQuery(
    { domain, timestamp },
    { enabled: domain.length > 0 && timestamp.length > 0 }
  );

  const state = useMemo<ViewerState>(() => {
    if (isLoading) {
      return { site: domain, timestamp, waybackUrl: "", isLoading: true, error: null, era: "" };
    }

    if (error) {
      return {
        site: domain,
        timestamp,
        waybackUrl: "",
        isLoading: false,
        error: {
          code: "ARCHIVE_UNAVAILABLE",
          retryable: true,
        },
        era: "",
      };
    }

    if (result?.success) {
      const data = result.data as { timestamp: string; url: string; isAvailable: boolean };
      return {
        site: domain,
        timestamp: data.timestamp,
        waybackUrl: getWaybackEmbedUrl(data.url),
        isLoading: false,
        error: null,
        era: ERA_DISPLAY[getEra(data.timestamp)] ?? getEra(data.timestamp),
      };
    }

    // result is a failure — propagate the typed AppError
    return {
      site: domain,
      timestamp,
      waybackUrl: "",
      isLoading: false,
      error: result
        ? result.error
        : { code: "SNAPSHOT_UNAVAILABLE", domain, timestamp },
      era: "",
    };
  }, [result, isLoading, error, domain, timestamp]);

  return { state };
}
