import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import * as archiveService from '../services/archive-service';

const timestampRegex = /^\d{14}$/;
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const archiveRouter = router({
  getTimeline: publicProcedure
    .input(z.object({ domain: z.string().min(1).max(253), fromYear: z.number().int().min(1991).max(2100).optional(), toYear: z.number().int().min(1991).max(2100).optional() }))
    .query(async ({ input }) => archiveService.getTimeline(input.domain, input.fromYear, input.toYear)),

  getSnapshot: publicProcedure
    .input(z.object({ domain: z.string().min(1).max(253), timestamp: z.string().regex(timestampRegex) }))
    .query(async ({ input }) => archiveService.getSnapshot(input.domain, input.timestamp)),

  getNearestSnapshot: publicProcedure
    .input(z.object({ domain: z.string().min(1).max(253), targetDate: z.string().regex(dateRegex), direction: z.enum(['before', 'after', 'nearest']).default('nearest') }))
    .query(async ({ input }) => archiveService.getNearestSnapshot(input.domain, input.targetDate, input.direction)),
});
