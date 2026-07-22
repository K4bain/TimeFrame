import type { AppError } from "@/types/errors";

export interface ErrorDisplayConfig {
  title: string;
  description: string;
  actionLabel: string | null;
}

/**
 * Error catalogue — maps each AppError code to its user-facing
 * title, description, and recovery action label.
 *
 * Spec reference: ERR.3 (Error Catalogue), COMP.10 (Error States).
 * Generic errors are not permitted — every code has a specific message.
 */
export function getErrorConfig(error: AppError): ErrorDisplayConfig {
  switch (error.code) {
    case "INVALID_INPUT":
      return {
        title: "No valid website detected.",
        description: "Enter a website address like google.com or youtube.com.",
        actionLabel: "Clear and retype",
      };

    case "INVALID_DOMAIN":
      return {
        title: "That doesn't look like a website.",
        description: "Try entering a domain like google.com or en.wikipedia.org.",
        actionLabel: "Clear and retype",
      };

    case "NO_COVERAGE":
      return {
        title: "No archive found for this site.",
        description: `The Internet Archive has no recorded snapshots of ${error.domain}. Some websites were never archived or were archived too recently.`,
        actionLabel: "Try a different site",
      };

    case "ARCHIVE_UNAVAILABLE":
      return {
        title: "Archive temporarily unavailable.",
        description: "The Internet Archive is unreachable right now. This is temporary.",
        actionLabel: "Try again",
      };

    case "SNAPSHOT_UNAVAILABLE":
      return {
        title: "This snapshot is unavailable.",
        description: "The archive captured this URL but the snapshot cannot be retrieved.",
        actionLabel: null, // Adjacent navigation offered by parent
      };

    case "RATE_LIMITED":
      return {
        title: "Loading...",
        description: `The archive is busy. Retrying in ${error.retryAfter} seconds.`,
        actionLabel: null, // Auto-retry, no manual action
      };

    case "NETWORK_OFFLINE":
      return {
        title: "No internet connection.",
        description: "Timeframe requires a network connection to load archive data.",
        actionLabel: null, // Resolves automatically on reconnect
      };

    case "REQUEST_TIMEOUT":
      return {
        title: "The archive is taking too long to respond.",
        description: `The request timed out after ${error.timeoutMs / 1000} seconds.`,
        actionLabel: "Try again",
      };

    case "SNAPSHOT_NOT_IN_TIMELINE":
      return {
        title: "Snapshot not found.",
        description: "This snapshot is not in the timeline for this site.",
        actionLabel: null,
      };

    case "NO_SNAPSHOTS_IN_DIRECTION":
      return {
        title: "No snapshots found.",
        description: `There are no archived snapshots ${error.direction} this date for ${error.domain}.`,
        actionLabel: null,
      };

    case "SITE_NOT_FOUND":
      return {
        title: "Site not found.",
        description: `No data is available for ${error.domain}.`,
        actionLabel: "Try a different site",
      };

    case "CONTEXT_UNAVAILABLE":
      return {
        title: "Context unavailable for this site.",
        description: "Timeline and viewer will continue to function.",
        actionLabel: null,
      };

    case "INVALID_TIMESTAMP":
      return {
        title: "Invalid timestamp.",
        description: error.message,
        actionLabel: null,
      };

    case "UNKNOWN":
    default:
      return {
        title: "Something went wrong.",
        description: "An unexpected error occurred.",
        actionLabel: "Reload page",
      };
  }
}
