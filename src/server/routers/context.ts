import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import * as contextService from '../services/context-service';
import { ok } from '@/types/errors';

export const contextRouter = router({
  getSiteContext: publicProcedure
    .input(z.object({ domain: z.string().min(1).max(253) }))
    .query(async ({ input }) => contextService.getSiteContext(input.domain)),

  getSnapshotContext: publicProcedure
    .input(z.object({ domain: z.string().min(1).max(253), timestamp: z.string().regex(/^\d{14}$/) }))
    .query(async ({ input }) => contextService.getSnapshotContext(input.domain, input.timestamp)),

  getEras: publicProcedure
    .query(() => ok({ eras: contextService.ERAS })),
});
