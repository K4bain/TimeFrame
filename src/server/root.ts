import { router } from './trpc';
import { archiveRouter } from './routers/archive';
import { searchRouter } from './routers/search';
import { contextRouter } from './routers/context';

export const appRouter = router({
  archive: archiveRouter,
  search: searchRouter,
  context: contextRouter,
});

export type AppRouter = typeof appRouter;
