import express, { Request, Response, NextFunction } from 'express';
import { login, logout, checkAuth } from '../controllers/auth';
import { authenticateJWT } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { supabaseServer } from '../config/supabase';
import { sendAdminNotification, sendClientReply } from '../services/email';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { validate } from '../middleware/validation';
import { schemas } from '../../validation/schemas';

const router = express.Router();

// ── Persistent Local CMS Fallback Store (for Instant Client Sync) ───────────
const uploadsDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storeFile = path.join(uploadsDir, 'local_cms_data.json');
let localCMS: {
  profile: any;
  projects: any[];
  skills: any[];
  socials: any[];
  experiences: any[];
  education: any[];
  certifications: any[];
  messages: any[];
} = {
  profile: null,
  projects: [],
  skills: [],
  socials: [],
  experiences: [],
  education: [],
  certifications: [],
  messages: [],
};




const DEFAULT_CMS: typeof localCMS = {
  profile: null,
  projects: [],
  skills: [],
  socials: [],
  experiences: [],
  education: [],
  certifications: [],
  messages: [],
};

function getLocalStore() {
  if (fs.existsSync(storeFile)) {
    try {
      const raw = JSON.parse(fs.readFileSync(storeFile, 'utf-8'));
      // Merge with defaults so all fields are guaranteed to exist
      // even if the stored JSON was written by an older server version
      localCMS = {
        ...DEFAULT_CMS,
        ...raw,
        // Ensure every array field is always an array
        projects: Array.isArray(raw.projects) ? raw.projects : [],
        skills: Array.isArray(raw.skills) ? raw.skills : [],
        socials: Array.isArray(raw.socials) ? raw.socials : [],
        experiences: Array.isArray(raw.experiences) ? raw.experiences : [],
        education: Array.isArray(raw.education) ? raw.education : [],
        certifications: Array.isArray(raw.certifications) ? raw.certifications : [],
        messages: Array.isArray(raw.messages) ? raw.messages : [],
      };
    } catch (e) {
      console.error('Error reading local CMS fallback store:', e);
    }
  }
  return localCMS;
}

function saveLocalStore() {
  try {
    fs.writeFileSync(storeFile, JSON.stringify(localCMS, null, 2));
  } catch (e) {
    console.error('Error saving local CMS fallback store:', e);
  }
}


// Merge database items with local CMS edits so updates reflect immediately
function mergeCollections(dbList: any[] = [], localList: any[] = []) {
  const map = new Map<string, any>();
  // 1. First add DB items
  dbList.forEach((item) => {
    const id = item.id || item._id;
    if (id) map.set(id, item);
  });
  // 2. Override with Local CMS items (edits & new creations)
  localList.forEach((item) => {
    const id = item.id || item._id;
    if (id) {
      const existing = map.get(id) || {};
      map.set(id, { ...existing, ...item });
    }
  });
  return Array.from(map.values());
}

// Helper to format profile object for client compatibility
const formatProfile = (data: any) => {
  if (!data) return null;
  return {
    ...data,
    profileImage: data.profile_image || data.profileImage || '',
    resumeUrl: data.resume_url || data.resumeUrl || '',
    profile_image: data.profile_image || data.profileImage || '',
    resume_url: data.resume_url || data.resumeUrl || '',
  };
};

// Helper to reliably query the latest profile record from Supabase ordered by updated_at / created_at descending
async function getLatestProfileFromSupabase() {
  try {
    let { data, error } = await supabaseServer
      .from('profiles')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      const fallback = await supabaseServer
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      data = fallback.data;
    }

    if (!data) {
      const unordered = await supabaseServer.from('profiles').select('*').limit(1).maybeSingle();
      data = unordered.data;
    }

    return data;
  } catch (e) {
    console.error('Error fetching latest profile from Supabase:', e);
    return null;
  }
}

// ==========================================
// 1. PUBLIC PORTFOLIO ENDPOINTS
// ==========================================

// Get profile and social links
router.get('/profile', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rawProfile = await getLatestProfileFromSupabase();
    let { data: dbSocials } = await supabaseServer
      .from('social_links')
      .select('*')
      .order('display_order', { ascending: true });

    const store = getLocalStore();
    const combinedSocials = mergeCollections(dbSocials || [], store.socials || []);
    const mergedProfile = { ...(rawProfile || {}), ...(store.profile || {}) };

    res.json({ profile: formatProfile(mergedProfile), socials: combinedSocials });
  } catch (err) {
    next(err);
  }
});


// Get published projects
router.get('/projects', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data: projects } = await supabaseServer
      .from('projects')
      .select('*')
      .order('display_order', { ascending: true });

    const store = getLocalStore();
    const combined = mergeCollections(projects || [], store.projects || []);
    res.json(combined);
  } catch (err) {
    next(err);
  }
});

// Get published skills
router.get('/skills', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data: skills } = await supabaseServer
      .from('skills')
      .select('*')
      .order('display_order', { ascending: true });

    const store = getLocalStore();
    const combined = mergeCollections(skills || [], store.skills || []);
    res.json(combined);
  } catch (err) {
    next(err);
  }
});

// Get combined education & experience timelines
router.get('/timeline', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data: experience } = await supabaseServer
      .from('experiences')
      .select('*')
      .order('display_order', { ascending: true });

    const { data: education } = await supabaseServer
      .from('education')
      .select('*')
      .order('display_order', { ascending: true });

    const store = getLocalStore();
    const expCombined = mergeCollections(experience || [], store.experiences || []);
    const eduCombined = mergeCollections(education || [], store.education || []);

    res.json({ experience: expCombined, education: eduCombined });
  } catch (err) {
    next(err);
  }
});

// Get experiences (both singular and plural aliases)
const handleGetExperiences = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data: experience } = await supabaseServer
      .from('experiences')
      .select('*')
      .order('display_order', { ascending: true });

    const store = getLocalStore();
    const expCombined = mergeCollections(experience || [], store.experiences || []);
    const formatted = expCombined.map((exp: any) => ({
      ...exp,
      title: exp.title || exp.role || 'Experience',
      name: exp.name || exp.role || exp.company || 'Experience',
    }));
    res.json(formatted);
  } catch (err) {
    next(err);
  }
};
router.get('/experience', handleGetExperiences);
router.get('/experiences', handleGetExperiences);

// Get certifications
router.get('/certifications', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data: certifications } = await supabaseServer
      .from('certifications')
      .select('*')
      .order('display_order', { ascending: true });

    const store = getLocalStore();
    const combined = mergeCollections(certifications || [], store.certifications || []);
    res.json(combined);
  } catch (err) {
    next(err);
  }
});


// Submit contact form
router.post('/contact', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, subject, message, profession } = req.body || {};

    if (!name || !name.toString().trim() || !email || !email.toString().trim() || !message || !message.toString().trim()) {
      return res.status(400).json({ error: 'Name, email, and message are required fields.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.toString().trim())) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    const formattedSubject = profession ? `[Role: ${profession}] ${subject || 'Portfolio Inquiry'}` : (subject || 'Portfolio Inquiry');

    const payload: any = {
      id: crypto.randomUUID(),
      name: name.toString().trim(),
      email: email.toString().trim(),
      subject: formattedSubject,
      message: message.toString().trim(),
      profession: profession || '',
      read: false,
      replied: false,
      replies: [],
      created_at: new Date().toISOString(),
    };

    // 1. Persist to local CMS store immediately (defensive)
    if (!Array.isArray(localCMS.messages)) localCMS.messages = [];
    localCMS.messages.unshift(payload);
    saveLocalStore();

    // 2. Persist to Supabase (non-blocking, best-effort)
    try {
      await supabaseServer.from('messages').insert([{ ...payload, replies: JSON.stringify(payload.replies) }]);
    } catch (dbErr) {
      console.warn('[Contact] Supabase insert warning:', dbErr);
    }

    // 3. Send admin notification email (non-blocking: message is already saved)
    const emailResult = await sendAdminNotification(payload);
    if (!emailResult.sent) {
      console.warn('[Contact] Admin notification email skipped:', emailResult.error);
    }

    res.status(201).json({
      success: true,
      message: 'Message sent successfully!',
      emailNotified: emailResult.sent,
    });
  } catch (err) {
    next(err);
  }
});


// ==========================================
// 2. ADMIN AUTHENTICATION & PROFILE API
// ==========================================

router.post('/auth/login', login);
router.post('/auth/logout', logout);
router.get('/auth/status', authenticateJWT, checkAuth);


// Update Profile details
router.put('/admin/profile', authenticateJWT, validate(schemas.profileUpdateSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body;
    const rolesArray = Array.isArray(body.roles)
      ? body.roles
      : (typeof body.roles === 'string' ? body.roles.split(',').map((r: string) => r.trim()).filter(Boolean) : []);

    const payload = {
      name: body.name || 'MOHAMMAD RAEES',
      roles: rolesArray,
      bio: body.bio || '',
      availability: body.availability || 'Available for new opportunities',
      location: body.location || 'Pune, Maharashtra, India / Remote',
      profile_image: body.profileImage || body.profile_image || '',
      resume_url: body.resumeUrl || body.resume_url || '',
      updated_at: new Date().toISOString(),
    };

    const existingRecord = await getLatestProfileFromSupabase();
    const existingId = existingRecord?.id || null;

    if (existingId) {
      let { error } = await supabaseServer.from('profiles').update(payload).eq('id', existingId);
      if (error && (error.message?.includes('location') || error.code === 'PGRST204')) {
        const fallbackPayload = { ...payload };
        delete (fallbackPayload as any).location;
        const retry = await supabaseServer.from('profiles').update(fallbackPayload).eq('id', existingId);
        error = retry.error;
      }
      if (error && error.code !== '42501') throw error;
    } else {
      let { error } = await supabaseServer.from('profiles').insert([payload]);
      if (error && (error.message?.includes('location') || error.code === 'PGRST204')) {
        const fallbackPayload = { ...payload };
        delete (fallbackPayload as any).location;
        const retry = await supabaseServer.from('profiles').insert([fallbackPayload]);
        error = retry.error;
      }
      if (error && error.code !== '42501') throw error;
    }

    localCMS.profile = { ...(localCMS.profile || {}), ...payload };
    saveLocalStore();

    const latestProfile = await getLatestProfileFromSupabase();
    const finalResult = { ...(latestProfile || {}), ...payload };
    res.json(formatProfile(finalResult));
  } catch (err: any) {
    console.error('Error updating profile:', err.message || err);
    res.status(500).json({ error: err.message || 'Failed to update profile.' });
  }
});


// --- Projects CRUD ---
router.post('/admin/projects', authenticateJWT, validate(schemas.projectCreateSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body;
    const newItem = {
      id: crypto.randomUUID(),
      title: body.title,
      slug: body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: body.description,
      long_description: body.longDescription || body.long_description || '',
      thumbnail: body.thumbnail || '',
      video_url: body.videoUrl || body.video_url || '',
      tech_stack: Array.isArray(body.techStack) ? body.techStack : (body.tech_stack || []),
      demo_url: body.demoUrl || body.demo_url || '',
      github_url: body.githubUrl || body.github_url || '',
      featured: Boolean(body.featured),
      published: body.published !== undefined ? Boolean(body.published) : true,
      display_order: Number(body.order || body.display_order || 0),
      created_at: new Date().toISOString(),
    };

    localCMS.projects.unshift(newItem);
    saveLocalStore();

    let { data, error } = await supabaseServer.from('projects').insert([newItem]).select();
    if (error && (error.message?.includes('video_url') || error.code === 'PGRST204')) {
      const fallbackPayload = { ...newItem };
      delete (fallbackPayload as any).video_url;
      const retry = await supabaseServer.from('projects').insert([fallbackPayload]).select();
      data = retry.data;
    }

    res.status(201).json(data?.[0] || newItem);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create project.' });
  }
});

router.put('/admin/projects/:id', authenticateJWT, validate(schemas.projectUpdateSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body;
    const id = req.params.id;
    const payload = {
      id,
      title: body.title,
      slug: body.slug,
      description: body.description,
      long_description: body.longDescription || body.long_description || '',
      thumbnail: body.thumbnail || '',
      video_url: body.videoUrl || body.video_url || '',
      tech_stack: Array.isArray(body.techStack) ? body.techStack : (body.tech_stack || []),
      demo_url: body.demoUrl || body.demo_url || '',
      github_url: body.githubUrl || body.github_url || '',
      featured: Boolean(body.featured),
      published: Boolean(body.published),
      display_order: Number(body.order || body.display_order || 0),
      updated_at: new Date().toISOString(),
    };

    // Update local store immediately for instant UI sync
    const idx = localCMS.projects.findIndex((p) => (p.id || p._id) === id);
    if (idx !== -1) {
      localCMS.projects[idx] = { ...localCMS.projects[idx], ...payload };
    } else {
      localCMS.projects.unshift(payload);
    }
    saveLocalStore();

    let { data, error } = await supabaseServer.from('projects').update(payload).eq('id', id).select();
    if (error && (error.message?.includes('video_url') || error.code === 'PGRST204')) {
      const fallbackPayload = { ...payload };
      delete (fallbackPayload as any).video_url;
      const retry = await supabaseServer.from('projects').update(fallbackPayload).eq('id', id).select();
      data = retry.data;
    }

    res.json(data?.[0] || payload);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update project.' });
  }
});

router.delete('/admin/projects/:id', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    await supabaseServer.from('projects').delete().eq('id', id);
    localCMS.projects = localCMS.projects.filter((p) => (p.id || p._id) !== id);
    saveLocalStore();
    res.json({ success: true, message: 'Project deleted.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete project.' });
  }
});

// --- Skills CRUD ---
router.post('/admin/skills', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body;
    const newItem = {
      id: crypto.randomUUID(),
      name: body.name,
      category: body.category || 'other',
      level: Number(body.level || 80),
      icon: body.icon || '',
      display_order: Number(body.order || body.display_order || 0),
      published: body.published !== undefined ? Boolean(body.published) : true,
    };

    localCMS.skills.unshift(newItem);
    saveLocalStore();

    let { data, error } = await supabaseServer.from('skills').insert([newItem]).select();
    res.status(201).json(data?.[0] || newItem);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create skill.' });
  }
});

router.put('/admin/skills/:id', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body;
    const id = req.params.id;
    const payload = {
      id,
      name: body.name,
      category: body.category,
      level: Number(body.level),
      icon: body.icon,
      display_order: Number(body.order || body.display_order || 0),
      published: Boolean(body.published),
    };

    const idx = localCMS.skills.findIndex((s) => (s.id || s._id) === id);
    if (idx !== -1) localCMS.skills[idx] = { ...localCMS.skills[idx], ...payload };
    else localCMS.skills.unshift(payload);
    saveLocalStore();

    let { data } = await supabaseServer.from('skills').update(payload).eq('id', id).select();
    res.json(data?.[0] || payload);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update skill.' });
  }
});

router.delete('/admin/skills/:id', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    await supabaseServer.from('skills').delete().eq('id', id);
    localCMS.skills = localCMS.skills.filter((s) => (s.id || s._id) !== id);
    saveLocalStore();
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete skill.' });
  }
});

// --- Experience CRUD ---
router.post('/admin/experience', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body;
    const newItem = {
      id: crypto.randomUUID(),
      role: body.role,
      company: body.company,
      logo: body.logo || '',
      start_date: body.startDate || body.start_date || '',
      end_date: body.endDate || body.end_date || null,
      responsibilities: Array.isArray(body.responsibilities) ? body.responsibilities : [],
      tech_tags: Array.isArray(body.techTags) ? body.techTags : (body.tech_tags || []),
      display_order: Number(body.order || body.display_order || 0),
    };

    localCMS.experiences.unshift(newItem);
    saveLocalStore();

    let { data } = await supabaseServer.from('experiences').insert([newItem]).select();
    res.status(201).json(data?.[0] || newItem);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create experience.' });
  }
});

router.put('/admin/experience/:id', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body;
    const id = req.params.id;
    const payload = {
      id,
      role: body.role,
      company: body.company,
      logo: body.logo,
      start_date: body.startDate || body.start_date,
      end_date: body.endDate || body.end_date || null,
      responsibilities: Array.isArray(body.responsibilities) ? body.responsibilities : [],
      tech_tags: Array.isArray(body.techTags) ? body.techTags : (body.tech_tags || []),
      display_order: Number(body.order || body.display_order || 0),
    };

    const idx = localCMS.experiences.findIndex((e) => (e.id || e._id) === id);
    if (idx !== -1) localCMS.experiences[idx] = { ...localCMS.experiences[idx], ...payload };
    else localCMS.experiences.unshift(payload);
    saveLocalStore();

    let { data } = await supabaseServer.from('experiences').update(payload).eq('id', id).select();
    res.json(data?.[0] || payload);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update experience.' });
  }
});

router.delete('/admin/experience/:id', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    await supabaseServer.from('experiences').delete().eq('id', id);
    localCMS.experiences = localCMS.experiences.filter((e) => (e.id || e._id) !== id);
    saveLocalStore();
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete experience.' });
  }
});

// --- Education CRUD ---
router.post('/admin/education', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body;
    const newItem = {
      id: crypto.randomUUID(),
      degree: body.degree,
      institution: body.institution,
      logo: body.logo || '',
      start_date: body.startDate || body.start_date || '',
      end_date: body.endDate || body.end_date || '',
      milestones: Array.isArray(body.milestones) ? body.milestones : [],
      display_order: Number(body.order || body.display_order || 0),
    };

    localCMS.education.unshift(newItem);
    saveLocalStore();

    let { data } = await supabaseServer.from('education').insert([newItem]).select();
    res.status(201).json(data?.[0] || newItem);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create education.' });
  }
});

router.put('/admin/education/:id', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body;
    const id = req.params.id;
    const payload = {
      id,
      degree: body.degree,
      institution: body.institution,
      logo: body.logo,
      start_date: body.startDate || body.start_date,
      end_date: body.endDate || body.end_date,
      milestones: Array.isArray(body.milestones) ? body.milestones : [],
      display_order: Number(body.order || body.display_order || 0),
    };

    const idx = localCMS.education.findIndex((e) => (e.id || e._id) === id);
    if (idx !== -1) localCMS.education[idx] = { ...localCMS.education[idx], ...payload };
    else localCMS.education.unshift(payload);
    saveLocalStore();

    let { data } = await supabaseServer.from('education').update(payload).eq('id', id).select();
    res.json(data?.[0] || payload);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update education.' });
  }
});

router.delete('/admin/education/:id', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    await supabaseServer.from('education').delete().eq('id', id);
    localCMS.education = localCMS.education.filter((e) => (e.id || e._id) !== id);
    saveLocalStore();
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete education.' });
  }
});

// --- Certifications CRUD ---
router.post('/admin/certifications', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body;
    const skillsList = Array.isArray(body.skills)
      ? body.skills
      : (typeof body.skills === 'string' ? body.skills.split(',').map((s: string) => s.trim()).filter(Boolean) : []);

    const newItem = {
      id: crypto.randomUUID(),
      title: body.title,
      issuer: body.issuer,
      credential_id: body.credentialId || body.credential_id || '',
      verification_url: body.verificationUrl || body.verification_url || '',
      thumbnail: body.thumbnail || '',
      skills: skillsList,
      date: body.date || '',
      published: body.published !== undefined ? Boolean(body.published) : true,
      display_order: Number(body.order || body.display_order || 0),
    };

    localCMS.certifications.unshift(newItem);
    saveLocalStore();

    let { data, error } = await supabaseServer.from('certifications').insert([newItem]).select();
    if (error && (error.message?.includes('skills') || error.code === 'PGRST204')) {
      const fallbackPayload = { ...newItem };
      delete (fallbackPayload as any).skills;
      const retry = await supabaseServer.from('certifications').insert([fallbackPayload]).select();
      data = retry.data;
    }
    res.status(201).json(data?.[0] || newItem);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create certification.' });
  }
});

router.put('/admin/certifications/:id', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body;
    const id = req.params.id;
    const skillsList = Array.isArray(body.skills)
      ? body.skills
      : (typeof body.skills === 'string' ? body.skills.split(',').map((s: string) => s.trim()).filter(Boolean) : []);

    const payload = {
      id,
      title: body.title,
      issuer: body.issuer,
      credential_id: body.credentialId || body.credential_id || '',
      verification_url: body.verificationUrl || body.verification_url || '',
      thumbnail: body.thumbnail || '',
      skills: skillsList,
      date: body.date || '',
      published: Boolean(body.published),
      display_order: Number(body.order || body.display_order || 0),
    };

    const idx = localCMS.certifications.findIndex((c) => (c.id || c._id) === id);
    if (idx !== -1) localCMS.certifications[idx] = { ...localCMS.certifications[idx], ...payload };
    else localCMS.certifications.unshift(payload);
    saveLocalStore();

    let { data, error } = await supabaseServer.from('certifications').update(payload).eq('id', id).select();
    if (error && (error.message?.includes('skills') || error.code === 'PGRST204')) {
      const fallbackPayload = { ...payload };
      delete (fallbackPayload as any).skills;
      const retry = await supabaseServer.from('certifications').update(fallbackPayload).eq('id', id).select();
      data = retry.data;
    }

    res.json(data?.[0] || payload);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update certification.' });
  }
});


router.delete('/admin/certifications/:id', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    await supabaseServer.from('certifications').delete().eq('id', id);
    localCMS.certifications = localCMS.certifications.filter((c) => (c.id || c._id) !== id);
    saveLocalStore();
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete certification.' });
  }
});

// --- Social Links CRUD ---
router.get('/socials', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data: socials } = await supabaseServer
      .from('social_links')
      .select('*')
      .order('display_order', { ascending: true });

    const combined = mergeCollections(socials || [], localCMS.socials || []);
    res.json(combined);
  } catch (err) {
    next(err);
  }
});

router.post('/admin/socials', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body;
    const newItem = {
      id: crypto.randomUUID(),
      platform: body.platform,
      url: body.url,
      username: body.username || '',
      published: body.published !== undefined ? Boolean(body.published) : true,
      display_order: Number(body.displayOrder || body.order || body.display_order || 0),
    };

    localCMS.socials.unshift(newItem);
    saveLocalStore();

    let { data } = await supabaseServer.from('social_links').insert([newItem]).select();
    res.status(201).json(data?.[0] || newItem);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create social link.' });
  }
});

router.put('/admin/socials/:id', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body;
    const id = req.params.id;
    const payload = {
      id,
      platform: body.platform,
      url: body.url,
      username: body.username || '',
      published: Boolean(body.published),
      display_order: Number(body.displayOrder || body.order || body.display_order || 0),
    };

    const idx = localCMS.socials.findIndex((s) => (s.id || s._id) === id);
    if (idx !== -1) localCMS.socials[idx] = { ...localCMS.socials[idx], ...payload };
    else localCMS.socials.unshift(payload);
    saveLocalStore();

    let { data } = await supabaseServer.from('social_links').update(payload).eq('id', id).select();
    res.json(data?.[0] || payload);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update social link.' });
  }
});

router.delete('/admin/socials/:id', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    await supabaseServer.from('social_links').delete().eq('id', id);
    localCMS.socials = localCMS.socials.filter((s) => (s.id || s._id) !== id);
    saveLocalStore();
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete social link.' });
  }
});

// --- Message Inbox Management ---
router.get('/admin/messages', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    let { data: dbMessages } = await supabaseServer.from('messages').select('*').order('created_at', { ascending: false });
    const store = getLocalStore();
    const combined = mergeCollections(dbMessages || [], store.messages || []);
    res.json(combined);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch messages.' });
  }
});

router.put('/admin/messages/:id/read', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    const { read } = req.body;

    const idx = localCMS.messages.findIndex((m) => (m.id || m._id) === id);
    if (idx !== -1) {
      localCMS.messages[idx].read = Boolean(read);
    }
    saveLocalStore();

    try {
      await supabaseServer.from('messages').update({ read: Boolean(read) }).eq('id', id);
    } catch (dbErr) {
      console.warn('Supabase update read warning:', dbErr);
    }

    res.json({ success: true, read: Boolean(read) });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to mark message read status.' });
  }
});

router.post('/admin/messages/:id/reply', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    const { replyText } = req.body;

    if (!replyText || !replyText.trim()) {
      return res.status(400).json({ error: 'Reply text cannot be empty.' });
    }

    // Find message in local CMS
    const idx = (localCMS.messages || []).findIndex((m: any) => (m.id || m._id) === id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Message not found in inbox.' });
    }

    const msg = localCMS.messages[idx];

    // 1. Send the reply email to the client FIRST (real, not fake)
    const emailResult = await sendClientReply(
      { id: msg.id, name: msg.name, email: msg.email, subject: msg.subject, message: msg.message },
      replyText.trim()
    );

    // 2. Build the reply entry for conversation history
    const replyEntry = {
      text: replyText.trim(),
      sentAt: new Date().toISOString(),
      emailSent: emailResult.sent,
      emailError: emailResult.error || null,
    };

    // 3. Update local CMS — append to replies thread
    if (!Array.isArray(localCMS.messages[idx].replies)) {
      localCMS.messages[idx].replies = [];
    }
    localCMS.messages[idx].replies.push(replyEntry);
    localCMS.messages[idx].read = true;
    localCMS.messages[idx].replied = true;
    localCMS.messages[idx].repliedAt = replyEntry.sentAt;
    saveLocalStore();

    // 4. Persist to Supabase (best-effort, non-blocking)
    try {
      await supabaseServer
        .from('messages')
        .update({
          read: true,
          replied: true,
          replied_at: replyEntry.sentAt,
          replies: JSON.stringify(localCMS.messages[idx].replies),
        })
        .eq('id', id);
    } catch (dbErr) {
      console.warn('[Reply] Supabase update warning:', dbErr);
    }

    res.json({
      success: true,
      emailSent: emailResult.sent,
      emailError: emailResult.error || null,
      reply: replyEntry,
      message: emailResult.sent
        ? 'Reply sent to client by email and recorded.'
        : `Reply recorded in inbox. Email delivery failed: ${emailResult.error}`,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to send reply.' });
  }
});

router.delete('/admin/messages/:id', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    localCMS.messages = localCMS.messages.filter((m) => (m.id || m._id) !== id);
    saveLocalStore();

    try {
      await supabaseServer.from('messages').delete().eq('id', id);
    } catch (dbErr) {
      console.warn('Supabase delete message warning:', dbErr);
    }

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete message.' });
  }
});


// --- File Upload Handler ---
const handleFileUpload = (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }
  const host = req.get('host') || 'localhost:5000';
  const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
  const baseUrl = process.env.BACKEND_URL || `${protocol}://${host}`;
  const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;
  res.status(201).json({ success: true, fileUrl, url: fileUrl });
};

const uploadSingleFile = (req: Request, res: Response, next: NextFunction) => {
  upload.single('file')(req, res, (err: any) => {
    if (err) {
      return res.status(400).json({ error: err.message || 'File upload validation failed.' });
    }
    if (req.file && req.file.filename.toLowerCase().endsWith('.svg')) {
      const filePath = req.file.path;
      try {
        const svgContent = fs.readFileSync(filePath, 'utf-8');
        const lowerContent = svgContent.toLowerCase();
        const hasScript =
          lowerContent.includes('<script') ||
          lowerContent.includes('javascript:') ||
          lowerContent.includes('onload=') ||
          lowerContent.includes('onerror=') ||
          lowerContent.includes('onclick=');

        if (hasScript) {
          try {
            fs.unlinkSync(filePath);
          } catch {}
          return res.status(400).json({ error: 'SVG upload rejected: file contains inline script or event handler.' });
        }
      } catch (readErr) {
        console.warn('SVG inspection warning:', readErr);
      }
    }
    handleFileUpload(req, res);
  });
};

router.post('/upload', uploadSingleFile);
router.post('/uploads', uploadSingleFile);
router.post('/admin/upload', authenticateJWT, uploadSingleFile);
router.post('/admin/uploads', authenticateJWT, uploadSingleFile);


export default router;
