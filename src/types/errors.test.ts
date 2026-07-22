import { describe, it, expect } from 'vitest';
import { ok, err, errorMessage, type AppError } from './errors';

describe('ok', () => {
  it('wraps data in a success result', () => {
    const result = ok({ value: 42 });
    expect(result.success).toBe(true);
    expect(result.success && result.data).toEqual({ value: 42 });
  });

  it('works with null/undefined data', () => {
    expect(ok(null).success).toBe(true);
    expect(ok(undefined).success).toBe(true);
  });

  it('works with arrays and strings', () => {
    expect(ok([1, 2, 3]).success).toBe(true);
    expect(ok('hello').success).toBe(true);
  });
});

describe('err', () => {
  it('wraps an error in a failure result', () => {
    const error: AppError = { code: 'NO_COVERAGE', domain: 'test.com' };
    const result = err(error);
    expect(result.success).toBe(false);
    expect(!result.success && result.error).toEqual(error);
  });

  it('preserves all error properties', () => {
    const error: AppError = { code: 'RATE_LIMITED', retryAfter: 30 };
    const result = err(error);
    if (!result.success && result.error.code === 'RATE_LIMITED') {
      expect(result.error.retryAfter).toBe(30);
    }
  });
});

describe('errorMessage', () => {
  it('returns the message for INVALID_INPUT', () => {
    expect(errorMessage({ code: 'INVALID_INPUT', message: 'Bad input' })).toBe('Bad input');
  });

  it('returns the message for INVALID_DOMAIN', () => {
    expect(errorMessage({ code: 'INVALID_DOMAIN', message: 'No good' })).toBe('No good');
  });

  it('includes the domain for NO_COVERAGE', () => {
    expect(errorMessage({ code: 'NO_COVERAGE', domain: 'example.com' })).toBe(
      'No archived snapshots found for example.com'
    );
  });

  it('includes the domain and direction for NO_SNAPSHOTS_IN_DIRECTION', () => {
    expect(
      errorMessage({ code: 'NO_SNAPSHOTS_IN_DIRECTION', domain: 'example.com', direction: 'before' })
    ).toBe('No snapshots found before this date for example.com');
  });

  it('includes timestamp and domain for SNAPSHOT_NOT_IN_TIMELINE', () => {
    expect(
      errorMessage({
        code: 'SNAPSHOT_NOT_IN_TIMELINE',
        domain: 'example.com',
        timestamp: '20050101',
      })
    ).toBe('Snapshot 20050101 not found in timeline for example.com');
  });

  it('returns a retry message for ARCHIVE_UNAVAILABLE', () => {
    expect(errorMessage({ code: 'ARCHIVE_UNAVAILABLE', retryable: true })).toContain(
      'Internet Archive'
    );
  });

  it('includes details for SNAPSHOT_UNAVAILABLE', () => {
    expect(
      errorMessage({ code: 'SNAPSHOT_UNAVAILABLE', domain: 'test.com', timestamp: '20050101' })
    ).toContain('20050101');
  });

  it('returns a rate-limit message for RATE_LIMITED', () => {
    expect(errorMessage({ code: 'RATE_LIMITED', retryAfter: 10 })).toContain('Rate limited');
  });

  it('returns an offline message for NETWORK_OFFLINE', () => {
    expect(errorMessage({ code: 'NETWORK_OFFLINE' })).toContain('offline');
  });

  it('includes timeoutMs for REQUEST_TIMEOUT', () => {
    expect(errorMessage({ code: 'REQUEST_TIMEOUT', timeoutMs: 8000 })).toContain('8000');
  });

  it('falls back for UNKNOWN with originalError', () => {
    expect(errorMessage({ code: 'UNKNOWN', originalError: 'Something broke' })).toBe(
      'Something broke'
    );
  });

  it('has a default fallback for UNKNOWN without originalError', () => {
    expect(errorMessage({ code: 'UNKNOWN' })).toBe('An unknown error occurred');
  });
});
