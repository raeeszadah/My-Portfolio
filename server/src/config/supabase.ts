import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Ensure environment variables are loaded
dotenv.config({ path: path.join(__dirname, '../../../.env') });
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://txmbbpvkmmzjgyjiefgh.supabase.co';
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  'sb_publishable_Zz86-R-ltl7Hri8Ohbs3Bw_MlqKl2YZ';


/**
 * Server-side Supabase Client Instance
 * Project ID: txmbbpvkmmzjgyjiefgh
 */
export const supabaseServer = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: false, // Server environment should not persist browser sessions
    autoRefreshToken: false,
  },
});

export default supabaseServer;
