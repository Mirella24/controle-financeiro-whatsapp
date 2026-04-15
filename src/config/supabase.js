import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

if (!env.supabaseUrl || !env.supabaseSecretKey) {
  console.warn('Supabase não configurado no .env');
}

export const supabase = createClient(
  env.supabaseUrl,
  env.supabaseSecretKey
);