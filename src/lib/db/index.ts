import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

let db: ReturnType<typeof createClient> | null = null;

export function getDb() {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables must be set');
  }
  if (!db) {
    db = createClient(supabaseUrl, supabaseKey);
  }
  return db;
}
