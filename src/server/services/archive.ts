import { cachedFetch, getCacheKey } from './cache-service';

const CDX_API_BASE = "https://web.archive.org/cdx/search/cdx";
const AVAILABILITY_API_BASE = "https://archive.org/wayback/available";
const FETCH_TIMEOUT = 15000;

interface CDXRow {
  timestamp: string;
  original: string;
  mimetype: string;
  statuscode: string;
}

async function fetchWithTimeout(url: string, timeout: number = FETCH_TIMEOUT): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { signal: controller.signal });
    return response;
  } finally {
    clearTimeout(id);
  }
}

export async function searchCDX(
  url: string,
  options?: { from?: number; to?: number; limit?: number; filter?: string; matchType?: string }
): Promise<CDXRow[]> {
  const cacheKey = getCacheKey("cdx", url, options?.from, options?.to, options?.limit);
  return cachedFetch(
    cacheKey,
    async () => {
      const params = new URLSearchParams({
        url,
        output: "json",
        fl: "timestamp,original,mimetype,statuscode",
        matchType: "host",
        ...(options?.from && { from: String(options.from) }),
        ...(options?.to && { to: String(options.to) }),
        ...(options?.limit && { limit: String(options.limit) }),
        ...(options?.matchType && { matchType: options.matchType }),
      });

      const response = await fetchWithTimeout(`${CDX_API_BASE}?${params}`);
      if (!response.ok) throw new Error("Failed to fetch archive data");

      const data = await response.json();
      if (!Array.isArray(data) || data.length === 0) return [];

      const headers = data[0];
      const rows = data.slice(1);
      const parsed: CDXRow[] = rows.map((row: string[]) => {
        const obj: Record<string, string> = {};
        headers.forEach((header: string, index: number) => { obj[header] = row[index]; });
        return obj as unknown as CDXRow;
      });

      const seen = new Set<string>();
      return parsed.filter((row) => {
        if (seen.has(row.timestamp)) return false;
        seen.add(row.timestamp);
        return true;
      });
    },
    60 * 30
  );
}

interface WaybackResponse {
  archived_snapshots?: {
    closest?: { timestamp: string; url: string; status?: string; available?: boolean };
  };
}

export async function getWaybackAvailability(url: string, timestamp?: string): Promise<WaybackResponse> {
  const cacheKey = getCacheKey("wayback", url, timestamp);
  return cachedFetch(
    cacheKey,
    async () => {
      const params = new URLSearchParams({ url, ...(timestamp && { timestamp }) });
      const response = await fetchWithTimeout(`${AVAILABILITY_API_BASE}?${params}`);
      if (!response.ok) throw new Error("Failed to check wayback availability");
      return response.json() as WaybackResponse;
    },
    60 * 60 * 24
  );
}
