import { useMemo } from "react";
import { trpc } from "@/lib/api/trpc";
import { errorMessage, type AppError } from "@/types/errors";
import { getEra, getWaybackEmbedUrl } from "@/utils";

interface SnapshotState {
  timestamp: string;
  waybackUrl: string;
  era: string;
  isLoading: boolean;
  error: string | null;
}

interface CompareState {
  left: SnapshotState;
  right: SnapshotState;
}

interface UseCompareReturn {
  state: CompareState;
}

function buildSnapshotState(
  domain: string,
  timestamp: string,
  result: { success: true; data: unknown } | { success: false; error: AppError } | undefined,
  isLoading: boolean,
  error: { message?: string } | null
): SnapshotState {
  if (isLoading) {
    return { timestamp, waybackUrl: "", era: "", isLoading: true, error: null };
  }
  if (error) {
    return { timestamp, waybackUrl: "", era: "", isLoading: false, error: error.message || "Request failed" };
  }
  if (result?.success) {
    const data = result.data as { timestamp: string; url: string; isAvailable: boolean };
    return {
      timestamp: data.timestamp,
      waybackUrl: getWaybackEmbedUrl(data.url),
      era: getEra(data.timestamp),
      isLoading: false,
      error: null,
    };
  }
  return {
    timestamp,
    waybackUrl: "",
    era: "",
    isLoading: false,
    error: result ? errorMessage(result.error) : "Snapshot not available",
  };
}

export function useCompare(
  domain: string,
  timestampA: string,
  timestampB: string
): UseCompareReturn {
  const { data: resultA, isLoading: loadingA, error: errorA } = trpc.archive.getSnapshot.useQuery(
    { domain, timestamp: timestampA },
    { enabled: typeof window !== 'undefined' && domain.length > 0 && timestampA.length > 0 }
  );

  const { data: resultB, isLoading: loadingB, error: errorB } = trpc.archive.getSnapshot.useQuery(
    { domain, timestamp: timestampB },
    { enabled: typeof window !== 'undefined' && domain.length > 0 && timestampB.length > 0 }
  );

  const left = useMemo(
    () => buildSnapshotState(domain, timestampA, resultA, loadingA, errorA),
    [domain, timestampA, resultA, loadingA, errorA]
  );
  const right = useMemo(
    () => buildSnapshotState(domain, timestampB, resultB, loadingB, errorB),
    [domain, timestampB, resultB, loadingB, errorB]
  );

  return {
    state: { left, right },
  };
}
