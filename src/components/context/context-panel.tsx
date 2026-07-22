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
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <div className="h-4 tf-skeleton tf-skeleton--shimmer w-3/4" />
          <div className="h-3 tf-skeleton tf-skeleton--shimmer w-1/2" />
        </div>
        <div className="space-y-2">
          <div className="h-3 tf-skeleton tf-skeleton--shimmer w-full" />
          <div className="h-3 tf-skeleton tf-skeleton--shimmer w-2/3" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 text-sm">
      {/* Site Overview */}
      <div className="space-y-2">
        <h3 className="font-display text-base text-paper truncate">{domain}</h3>
        <div className="space-y-1.5 text-paper-faint font-mono text-xs">
          {firstArchived && (
            <p>
              First archived{" "}
              <span className="text-gold">{formatDate(firstArchived)}</span>
            </p>
          )}
          <p>
            Total{" "}
            <span className="text-gold">{totalSnapshots.toLocaleString()}</span>{" "}
            snapshots
          </p>
          <p>
            <Badge variant="temporal">
              {coverageQuality ? coverageQuality.charAt(0).toUpperCase() + coverageQuality.slice(1) : "Sparse"}
            </Badge>
          </p>
        </div>
      </div>

      {/* Active Snapshot */}
      {selectedCapture && eraInfo && (
        <div className="pt-5 border-t border-rule space-y-2">
          <Badge variant="temporal">{eraInfo.name}</Badge>
          {eraInfo.description && (
            <p className="text-paper-dim text-xs">{eraInfo.description}</p>
          )}
          <p className="font-mono text-gold text-sm">
            {formatDate(selectedCapture.timestamp)}
          </p>
          {snapshotOrdinal && (
            <p className="text-paper-dim text-xs font-mono">Snapshot {snapshotOrdinal}</p>
          )}
        </div>
      )}

      {/* Change Summary */}
      {isChangeMarker && (
        <div className="pt-5 border-t border-rule space-y-1">
          <p className="text-gold font-medium text-xs font-mono">Change detected</p>
          {changeDesc && (
            <p className="text-paper-dim text-xs font-mono">{changeDesc}</p>
          )}
          <p className="text-paper-dim text-xs">
            Significant change detected between adjacent snapshots.
          </p>
        </div>
      )}

      {/* Archive Notice */}
      <div className="pt-5 border-t border-rule">
        <p className="text-paper-dim text-xs leading-relaxed">
          Snapshots are sourced from the Internet Archive. Coverage and rendering
          quality may vary.
        </p>
      </div>
    </div>
  );
}
