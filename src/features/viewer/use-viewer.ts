import { useMemo } from "react";
import { trpc } from "@/lib/api/trpc";
import { errorMessage } from "@/types/errors";
import { getEra, getWaybackEmbedUrl } from "@/utils";

interface ViewerState {
  site: string;
  timestamp: string;
  waybackUrl: string;
  isLoading: boolean;
  error: string | null;
  era: string;
}

interface UseViewerReturn {
  state: ViewerState;
}

export function useViewer(domain: string, timestamp: string): UseViewerReturn {
  const { data: result, isLoading, error } = trpc.archive.getSnapshot.useQuery(
    { domain, timestamp },
    { enabled: typeof window !== 'undefined' && domain.length > 0 && timestamp.length > 0 }
  );

  const state = useMemo<ViewerState>(() => {
    if (isLoading) {
      return { site: domain, timestamp, waybackUrl: "", isLoading: true, error: null, era: "" };
    }

    if (error) {
      return { site: domain, timestamp, waybackUrl: "", isLoading: false, error: error.message, era: "" };
    }

    if (result?.success) {
      const data = result.data as { timestamp: string; url: string; isAvailable: boolean };
      return {
        site: domain,
        timestamp: data.timestamp,
        waybackUrl: getWaybackEmbedUrl(data.url),
        isLoading: false,
        error: null,
        era: getEra(data.timestamp),
      };
    }

    return {
      site: domain,
      timestamp,
      waybackUrl: "",
      isLoading: false,
      error: result ? errorMessage(result.error) : "Snapshot not available",
      era: "",
    };
  }, [result, isLoading, error, domain, timestamp]);

  return { state };
}
