import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { ok, err } from '@/types/errors';
import { searchCDX } from '../services/archive';

const DOMAIN_REGEX = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

export const searchRouter = router({
  normalize: publicProcedure
    .input(z.object({ input: z.string() }))
    .query(({ input }) => {
      const cleaned = input.input.trim().toLowerCase();
      if (!cleaned) {
        return err({ code: 'INVALID_INPUT', message: 'Empty input' });
      }

      let url = cleaned;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }

      try {
        const parsed = new URL(url);
        let hostname = parsed.hostname;
        if (hostname.startsWith('www.')) {
          hostname = hostname.slice(4);
        }
        if (!DOMAIN_REGEX.test(hostname)) {
          return err({ code: 'INVALID_DOMAIN', message: `Invalid domain: ${hostname}` });
        }
        return ok({ domain: hostname });
      } catch {
        return err({ code: 'INVALID_INPUT', message: `Could not parse: ${input.input}` });
      }
    }),

  checkCoverage: publicProcedure
    .input(z.object({ domain: z.string().min(1).max(253) }))
    .query(async ({ input }) => {
      try {
        const results = await searchCDX(input.domain, {
          limit: 1,
          matchType: 'domain',
          filter: 'statuscode:200',
        });

        if (!results || results.length === 0) {
          return err({ code: 'NO_COVERAGE', domain: input.domain });
        }

        const firstSnapshot = results[0].timestamp;
        return ok({
          domain: input.domain,
          firstSnapshot,
          snapshotCount: 1, // At least one exists; full count deferred to getTimeline
        });
      } catch {
        return err({ code: 'ARCHIVE_UNAVAILABLE', retryable: true });
      }
    }),
});
