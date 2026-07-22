import { describe, it, expect } from 'vitest';
import {
  formatDate,
  getEra,
  normalizeUrl,
  getWaybackEmbedUrl,
} from './index';

describe('formatDate', () => {
  it('formats a full 14-digit Wayback timestamp', () => {
    expect(formatDate('20051215T103045'.replace('T', ''))).toBe('2005-12-15 10:30');
  });

  it('returns input unchanged for timestamps shorter than 12 chars', () => {
    expect(formatDate('2005')).toBe('2005');
    expect(formatDate('')).toBe('');
  });

  it('handles exactly 12-digit timestamps', () => {
    expect(formatDate('200512151030')).toBe('2005-12-15 10:30');
  });
});

describe('getEra', () => {
  it('returns "early-web" for years before 1996', () => {
    expect(getEra('19930101000000')).toBe('early-web');
  });

  it('returns "browser-wars" for 1996-2000', () => {
    expect(getEra('19980615000000')).toBe('browser-wars');
  });

  it('returns "post-crash" for 2001-2003', () => {
    expect(getEra('20020301000000')).toBe('post-crash');
  });

  it('returns "web-20" for 2004-2008', () => {
    expect(getEra('20070101000000')).toBe('web-20');
  });

  it('returns "mobile-transition" for 2009-2012', () => {
    expect(getEra('20100615000000')).toBe('mobile-transition');
  });

  it('returns "flat-design" for 2013-2016', () => {
    expect(getEra('20150101000000')).toBe('flat-design');
  });

  it('returns "platform-web" for 2017-2021', () => {
    expect(getEra('20190615000000')).toBe('platform-web');
  });

  it('returns "ai-transition" for 2022 onward', () => {
    expect(getEra('20230101000000')).toBe('ai-transition');
    expect(getEra('20250615000000')).toBe('ai-transition');
  });

  it('returns empty string for invalid input', () => {
    expect(getEra('')).toBe('');
    expect(getEra('abc')).toBe('');
  });
});

describe('normalizeUrl', () => {
  it('strips protocol and www prefix', () => {
    expect(normalizeUrl('https://www.google.com')).toBe('google.com');
    expect(normalizeUrl('http://www.google.com')).toBe('google.com');
  });

  it('strips path, query, and fragment', () => {
    expect(normalizeUrl('https://google.com/search?q=test')).toBe('google.com');
    expect(normalizeUrl('google.com/path/to/page#section')).toBe('google.com');
  });

  it('lowercases the hostname', () => {
    expect(normalizeUrl('HTTPS://WWW.Google.COM')).toBe('google.com');
  });

  it('handles input without protocol', () => {
    expect(normalizeUrl('google.com')).toBe('google.com');
    expect(normalizeUrl('www.example.org')).toBe('example.org');
  });

  it('handles subdomains correctly (only strips leading www)', () => {
    expect(normalizeUrl('https://mail.google.com')).toBe('mail.google.com');
    expect(normalizeUrl('https://www.mail.google.com')).toBe('mail.google.com');
  });

  it('does not strip "www" from the middle of a hostname', () => {
    // Regression test for the server-side bug where /www\./ lacked ^ anchor
    expect(normalizeUrl('mywwwsite.com')).toBe('mywwwsite.com');
    expect(normalizeUrl('https://mywwwsite.com')).toBe('mywwwsite.com');
  });

  it('strips ports', () => {
    expect(normalizeUrl('https://localhost:3000')).toBe('localhost');
    expect(normalizeUrl('example.com:8080')).toBe('example.com');
  });

  it('trims whitespace', () => {
    expect(normalizeUrl('  google.com  ')).toBe('google.com');
  });
});

describe('getWaybackEmbedUrl', () => {
  it('inserts if_ suffix to suppress Wayback toolbar', () => {
    const input = 'https://web.archive.org/web/20051215103045/http://example.com';
    const result = getWaybackEmbedUrl(input);
    expect(result).toBe('https://web.archive.org/web/20051215103045if_/http://example.com');
  });

  it('upgrades http to https', () => {
    const input = 'http://web.archive.org/web/20051215103045/http://example.com';
    const result = getWaybackEmbedUrl(input);
    expect(result.startsWith('https://')).toBe(true);
  });

  it('handles already-https URLs', () => {
    const input = 'https://web.archive.org/web/20100101000000/https://google.com';
    const result = getWaybackEmbedUrl(input);
    expect(result).toBe('https://web.archive.org/web/20100101000000if_/https://google.com');
  });

  it('does not double-apply if_ suffix', () => {
    const input = 'https://web.archive.org/web/20051215103045if_/http://example.com';
    const result = getWaybackEmbedUrl(input);
    // The regex only matches /web/{14digits}/ so the if_ variant is left alone
    expect(result).toBe(input);
  });
});
