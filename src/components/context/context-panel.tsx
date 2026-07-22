"use client";

import { useMemo } from "react";
import { trpc } from "@/lib/api/trpc";
import { formatDate, getEra } from "@/utils";
import { Badge } from "@/components/ui/badge";
import type { Capture } from "@/types";

interface ContextPanelProps {
  domain: string;
  captures: Capture[];
  selectedCapture: Capture | null;
  isLoading: boolean;
  changeScore?: number;
}

function getCoverageQualityLabel(count: number): string {
  if (count > 500) return "Good";
  if (count > 100) return "Moderate";
  return "Sparse";
}

export function ContextPanel({
  domain,
  captures,
  selectedCapture,
  isLoading,
  changeScore,
}: ContextPanelProps) {
  const { data: siteContext } = trpc.context.getSiteContext.useQuery(
    { domain },
    { enabled: domain.length > 0 }
  );

  const selectedTimestamp = selectedCapture?.timestamp || "";
  const { data: snapshotContext } = trpc.context.getSnapshotContext.useQuery(
    { domain, timestamp: selectedTimestamp },
    { enabled: domain.length > 0 && selectedTimestamp.length > 0 }
  );

  const { data: erasData } = trpc.context.getEras.useQuery(undefined, {
    staleTime: 1000 * 60 * 60 * 24,
  });

  const eraInfo = useMemo(() => {
    if (!selectedCapture) return null;
    const eraSlug = getEra(selectedCapture.timestamp);

    if (snapshotContext?.success) {
      return snapshotContext.data.era;
    }

    if (erasData?.success) {
      const era = erasData.data.eras.find((e) => e.slug === eraSlug);
      if (era) return { name: era.name, slug: era.slug, description: era.description };
    }

    return { name: eraSlug, slug: eraSlug, description: "" };
  }, [selectedCapture, snapshotContext, erasData]);

  const snapshotOrdinal = useMemo(() => {
    if (snapshotContext?.success) {
      return `${snapshotContext.data.snapshotOrdinal} of ${snapshotContext.data.totalSnapshots}`;
    }
    if (!selectedCapture || captures.length === 0) return null;
    const idx = captures.findIndex((c) => c.timestamp === selectedCapture.timestamp);
    return idx >= 0 ? `${idx + 1} of ${captures.length}` : null;
  }, [selectedCapture, captures, snapshotContext]);

  const firstArchived = siteContext?.success
    ? siteContext.data.firstArchived
    : captures.length > 0
      ? captures[0].timestamp
      : null;

  const totalSnapshots = siteContext?.success
    ? siteContext.data.totalSnapshots
    : captures.length;

  const coverageQuality = siteContext?.success
    ? siteContext.data.coverageQuality
    : getCoverageQualityLabel(captures.length);

  const isChangeMarker = snapshotContext?.success
    ? snapshotContext.data.isChangeMarker
    : changeScore !== undefined && changeScore > 0.2;

  const changeDesc = snapshotContext?.success && snapshotContext.data.changeContext
    ? `Change score: ${snapshotContext.data.changeContext.score.toFixed(1)}`
    : null;

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <div className="space-y-2">
          <div className="h-4 bg-bg-elevated rounded w-3/4 animate-pulse" />
          <div className="h-3 bg-bg-elevated rounded w-1/2 animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-bg-elevated rounded w-full animate-pulse" />
          <div className="h-3 bg-bg-elevated rounded w-2/3 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 text-sm">
      {/* Site Overview */}
      <div className="space-y-2">
        <h3 className="font-medium text-text-primary truncate">{domain}</h3>
        <div className="space-y-1 text-text-muted">
          {firstArchived && (
            <p>
              First archived:{" "}
              <span className="font-mono text-temporal-text">
                {formatDate(firstArchived)}
              </span>
            </p>
          )}
          <p>
            Total snapshots:{" "}
            <span className="font-mono text-temporal-text">
              {totalSnapshots.toLocaleString()}
            </span>
          </p>
          <p>
            Coverage:{" "}
            <Badge variant="temporal">
              {coverageQuality ? coverageQuality.charAt(0).toUpperCase() + coverageQuality.slice(1) : "Sparse"}
            </Badge>
          </p>
        </div>
      </div>

      {/* Active Snapshot */}
      {selectedCapture && eraInfo && (
        <div className="pt-3 border-t border-border-subtle space-y-2">
          <Badge variant="temporal">{eraInfo.name}</Badge>
          {eraInfo.description && (
            <p className="text-text-muted text-xs">{eraInfo.description}</p>
          )}
          <p className="font-mono text-temporal-text text-base">
            {formatDate(selectedCapture.timestamp)}
          </p>
          {snapshotOrdinal && (
            <p className="text-text-muted text-xs">Snapshot {snapshotOrdinal}</p>
          )}
        </div>
      )}

      {/* Change Summary */}
      {isChangeMarker && (
        <div className="pt-3 border-t border-border-subtle space-y-1">
          <p className="text-temporal-text font-medium text-xs">Change detected</p>
          {changeDesc && (
            <p className="text-text-muted text-xs">{changeDesc}</p>
          )}
          <p className="text-text-muted text-xs">
            Significant change detected between adjacent snapshots.
          </p>
        </div>
      )}

      {/* Archive Notice */}
      <div className="pt-3 border-t border-border-subtle">
        <p className="text-text-muted text-xs leading-relaxed">
          Snapshots are sourced from the Internet Archive. Coverage and rendering
          quality may vary.
        </p>
      </div>
    </div>
  );
}
