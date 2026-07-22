import { describe, it, expect } from 'vitest';
import { getErrorConfig } from './error-catalogue';
import type { AppError } from '@/types/errors';

describe('getErrorConfig', () => {
  it('returns config for NO_COVERAGE with domain in description', () => {
    const error: AppError = { code: 'NO_COVERAGE', domain: 'lostsite.com' };
    const config = getErrorConfig(error);
    expect(config.title).toBe('No archive found for this site.');
    expect(config.description).toContain('lostsite.com');
    expect(config.actionLabel).toBe('Try a different site');
  });

  it('returns config for ARCHIVE_UNAVAILABLE with retry action', () => {
    const error: AppError = { code: 'ARCHIVE_UNAVAILABLE', retryable: true };
    const config = getErrorConfig(error);
    expect(config.title).toBe('Archive temporarily unavailable.');
    expect(config.actionLabel).toBe('Try again');
  });

  it('returns config for NETWORK_OFFLINE with no action', () => {
    const error: AppError = { code: 'NETWORK_OFFLINE' };
    const config = getErrorConfig(error);
    expect(config.title).toBe('No internet connection.');
    expect(config.actionLabel).toBeNull();
  });

  it('returns config for RATE_LIMITED with retryAfter in description', () => {
    const error: AppError = { code: 'RATE_LIMITED', retryAfter: 15 };
    const config = getErrorConfig(error);
    expect(config.title).toBe('Loading...');
    expect(config.description).toContain('15');
    expect(config.actionLabel).toBeNull();
  });

  it('returns config for SNAPSHOT_UNAVAILABLE with no action', () => {
    const error: AppError = {
      code: 'SNAPSHOT_UNAVAILABLE',
      domain: 'test.com',
      timestamp: '20050101',
    };
    const config = getErrorConfig(error);
    expect(config.title).toBe('This snapshot is unavailable.');
    expect(config.actionLabel).toBeNull();
  });

  it('returns config for REQUEST_TIMEOUT with seconds in description', () => {
    const error: AppError = { code: 'REQUEST_TIMEOUT', timeoutMs: 8000 };
    const config = getErrorConfig(error);
    expect(config.title).toContain('taking too long');
    expect(config.description).toContain('8');
  });

  it('falls back to UNKNOWN for unrecognized codes', () => {
    // Simulate an unrecognized code by casting
    const error = { code: 'SOMETHING_NEW' } as unknown as AppError;
    const config = getErrorConfig(error);
    expect(config.title).toBe('Something went wrong.');
    expect(config.actionLabel).toBe('Reload page');
  });

  it('every error code produces a non-empty title', () => {
    const allCodes: AppError[] = [
      { code: 'INVALID_INPUT', message: 'x' },
      { code: 'INVALID_DOMAIN', message: 'x' },
      { code: 'INVALID_TIMESTAMP', message: 'x' },
      { code: 'NO_COVERAGE', domain: 'x.com' },
      { code: 'NO_SNAPSHOTS_IN_DIRECTION', domain: 'x.com', direction: 'after' },
      { code: 'SNAPSHOT_NOT_IN_TIMELINE', domain: 'x.com', timestamp: '20050101' },
      { code: 'ARCHIVE_UNAVAILABLE', retryable: true },
      { code: 'SNAPSHOT_UNAVAILABLE', domain: 'x.com', timestamp: '20050101' },
      { code: 'RATE_LIMITED', retryAfter: 5 },
      { code: 'SITE_NOT_FOUND', domain: 'x.com' },
      { code: 'CONTEXT_UNAVAILABLE', domain: 'x.com' },
      { code: 'NETWORK_OFFLINE' },
      { code: 'REQUEST_TIMEOUT', timeoutMs: 8000 },
      { code: 'UNKNOWN' },
    ];

    for (const error of allCodes) {
      const config = getErrorConfig(error);
      expect(config.title.length).toBeGreaterThan(0);
      expect(config.description.length).toBeGreaterThan(0);
    }
  });
});
