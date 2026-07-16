import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { searchCDX } from '../services/archive';
import { normalizeUrl } from '../lib/utils';
import { ok, err } from '@/types/errors';

export const searchRouter = router({
  normalize: publicProcedure
    .input(z.object({ input: z.string().min(1).max(2048) }))
    .query(({ input }) => {
      const domain = normalizeUrl(input.input);
      if (!domain) return err({ code: 'INVALID_INPUT', message: 'Invalid URL or domain' });
      return ok({ domain });
    }),

  checkCoverage: publicProcedure
    .input(z.object({ domain: z.string().min(1).max(253) }))
    .query(async ({ input }) => {
      try {
        const results = await searchCDX(input.domain, { limit: 1 });
        if (!results || results.length === 0) return err({ code: 'NO_COVERAGE', domain: input.domain });
        return ok({ domain: input.domain, hasCoverage: true, firstSnapshot: results[0].timestamp, snapshotCount: 1 });
      } catch { return err({ code: 'ARCHIVE_UNAVAILABLE', retryable: true }); }
    }),
});
