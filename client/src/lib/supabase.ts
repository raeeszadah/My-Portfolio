import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://txmbbpvkmmzjgyjiefgh.supabase.co';
const SUPABASE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_Zz86-R-ltl7Hri8Ohbs3Bw_MlqKl2YZ';

/**
 * Initialize client-side Supabase client for DB queries and Auth operations.
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Database Types for Supabase Tables
export interface SupabaseProfile {
  id: string;
  name: string;
  roles: string[];
  bio: string;
  profile_image?: string;
  resume_url?: string;
  availability: string;
  created_at?: string;
  updated_at?: string;
}

export interface SupabaseProject {
  id: string;
  title: string;
  slug: string;
  description: string;
  long_description?: string;
  thumbnail?: string;
  tech_stack: string[];
  demo_url?: string;
  github_url?: string;
  featured: boolean;
  published: boolean;
  display_order: number;
  created_at?: string;
}

export interface SupabaseSkill {
  id: string;
  name: string;
  category: string;
  level: number;
  icon?: string;
  display_order: number;
  published: boolean;
  created_at?: string;
}

export interface SupabaseExperience {
  id: string;
  role: string;
  company: string;
  logo?: string;
  start_date: string;
  end_date?: string;
  responsibilities: string[];
  tech_tags: string[];
  display_order: number;
  created_at?: string;
}

export interface SupabaseEducation {
  id: string;
  degree: string;
  institution: string;
  logo?: string;
  start_date: string;
  end_date: string;
  milestones: string[];
  display_order: number;
  created_at?: string;
}

export interface SupabaseCertification {
  id: string;
  title: string;
  issuer: string;
  credential_id?: string;
  verification_url?: string;
  thumbnail?: string;
  date: string;
  published: boolean;
  display_order: number;
  created_at?: string;
}

export interface SupabaseSocialLink {
  id: string;
  platform: string;
  url: string;
  username: string;
  published: boolean;
  display_order: number;
  created_at?: string;
}

export interface SupabaseMessage {
  id?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read?: boolean;
  created_at?: string;
}

/**
 * Helper: Submit visitor contact message to Supabase DB
 */
export async function submitContactMessage(payload: SupabaseMessage) {
  const { data, error } = await supabase
    .from('messages')
    .insert([payload])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data;
}

/**
 * Helper: Get public profile from Supabase DB
 */
export async function fetchProfile() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching profile from Supabase:', error);
    return null;
  }
  return data as SupabaseProfile | null;
}

/**
 * Helper: Fetch published projects from Supabase DB
 */
export async function fetchPublishedProjects() {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('published', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching projects from Supabase:', error);
    return [];
  }
  return data as SupabaseProject[];
}
