/**
 * Supabase Database Model Interfaces (PostgreSQL)
 */

export interface IUser {
  id: string;
  email: string;
  created_at?: string;
}

export interface IProfile {
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

export interface IProject {
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
  updated_at?: string;
}

export interface ISkill {
  id: string;
  name: string;
  category: string;
  level: number;
  icon?: string;
  display_order: number;
  published: boolean;
  created_at?: string;
}

export interface IExperience {
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

export interface IEducation {
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

export interface ICertification {
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

export interface IAchievement {
  id: string;
  title: string;
  issuer: string;
  description: string;
  date: string;
  verification_url?: string;
  published: boolean;
  display_order: number;
  created_at?: string;
}

export interface ISocialLink {
  id: string;
  platform: string;
  url: string;
  username: string;
  published: boolean;
  display_order: number;
  created_at?: string;
}

export interface IMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  created_at: string;
}
