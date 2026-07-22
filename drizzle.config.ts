import { defineConfig } from 'drizzle-kit';

/**
 * Drizzle Kit configuration.
 * Required by the db:generate, db:migrate, db:push, and db:studio scripts.
 *
 * The database URL is read from DATABASE_URL with a fallback to SUPABASE_URL,
 * matching the variable names used in src/lib/db/index.ts.
 */
export default defineConfig({
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || process.env.SUPABASE_URL || '',
  },
  verbose: true,
  strict: true,
});
