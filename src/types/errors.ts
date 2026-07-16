export type AppError =
  | { code: 'INVALID_INPUT';            message: string }
  | { code: 'INVALID_DOMAIN';           message: string }
  | { code: 'INVALID_TIMESTAMP';        message: string }
  | { code: 'NO_COVERAGE';              domain: string }
  | { code: 'NO_SNAPSHOTS_IN_DIRECTION'; domain: string; direction: string }
  | { code: 'SNAPSHOT_NOT_IN_TIMELINE'; domain: string; timestamp: string }
  | { code: 'ARCHIVE_UNAVAILABLE';      retryable: boolean }
  | { code: 'SNAPSHOT_UNAVAILABLE';     domain: string; timestamp: string }
  | { code: 'RATE_LIMITED';             retryAfter: number }
  | { code: 'SITE_NOT_FOUND';           domain: string }
  | { code: 'CONTEXT_UNAVAILABLE';      domain: string }
  | { code: 'NETWORK_OFFLINE' }
  | { code: 'REQUEST_TIMEOUT';          timeoutMs: number }
  | { code: 'UNKNOWN';                  originalError?: string };

export type Result<T> =
  | { success: true;  data: T }
  | { success: false; error: AppError };

export function ok<T>(data: T): Result<T> {
  return { success: true, data };
}

export function err<T>(error: AppError): Result<T> {
  return { success: false, error };
}

export function errorMessage(err: AppError): string {
  switch (err.code) {
    case 'INVALID_INPUT':
    case 'INVALID_DOMAIN':
    case 'INVALID_TIMESTAMP':
      return err.message;
    case 'NO_COVERAGE':
      return `No archived snapshots found for ${err.domain}`;
    case 'NO_SNAPSHOTS_IN_DIRECTION':
      return `No snapshots found ${err.direction} this date for ${err.domain}`;
    case 'SNAPSHOT_NOT_IN_TIMELINE':
      return `Snapshot ${err.timestamp} not found in timeline for ${err.domain}`;
    case 'ARCHIVE_UNAVAILABLE':
      return 'The Internet Archive is currently unavailable. Please try again.';
    case 'SNAPSHOT_UNAVAILABLE':
      return `Snapshot ${err.timestamp} is not available for ${err.domain}`;
    case 'RATE_LIMITED':
      return 'Rate limited by the Internet Archive. Please wait a moment.';
    case 'SITE_NOT_FOUND':
      return `Site ${err.domain} not found`;
    case 'CONTEXT_UNAVAILABLE':
      return `Context data unavailable for ${err.domain}`;
    case 'NETWORK_OFFLINE':
      return 'You appear to be offline. Please check your connection.';
    case 'REQUEST_TIMEOUT':
      return `Request timed out after ${err.timeoutMs}ms`;
    case 'UNKNOWN':
      return err.originalError || 'An unknown error occurred';
  }
}
