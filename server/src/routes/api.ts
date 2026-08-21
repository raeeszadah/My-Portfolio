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
import { schemas } from '../validation/schemas';

const router = express.Router();

// Helper to format profile object for client compatibility
const formatProfile = (data: any) => {
  if (!data) return null;
  return {
    ...data,
    profileImage: data.profile_image || data.profileImage || '',
    resumeUrl: data.resume_url || data.resumeUrl || '',
    profile_image: data.profile_image || data.profileImage || '',
    resume_url: data.resume_url || data.resumeUrl || '',
    location: data.location || 'Pune, Maharashtra, India / Remote',
  };
};

// Helper to query the latest profile record from Supabase ordered by updated_at / created_at descending
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

// Helper to handle Supabase Storage Uploads
async function uploadToSupabaseStorage(filePath: string, originalName: string, mimeType: string): Promise<string> {
  const bucketName = 'portfolio-assets';
  try {
    const { data: buckets } = await supabaseServer.storage.listBuckets();
    const exists = buckets?.some((b) => b.name === bucketName);
    if (!exists) {
      await supabaseServer.storage.createBucket(bucketName, {
        public: true,
      });
    }
  } catch (bErr) {
    console.warn('Supabase Storage bucket check/create notice:', bErr);
  }

  const cleanFileName = `${Date.now()}-${originalName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  const fileBuffer = fs.readFileSync(filePath);

  const { error } = await supabaseServer.storage
    .from(bucketName)
    .upload(cleanFileName, fileBuffer, {
      contentType: mimeType || 'application/octet-stream',
      upsert: true,
    });

  if (error) {
    console.error('Supabase storage upload error:', error);
    throw error;
  }

  const { data: publicUrlData } = supabaseServer.storage
    .from(bucketName)
    .getPublicUrl(cleanFileName);

  return publicUrlData.publicUrl;
}

// ==========================================
// 1. PUBLIC PORTFOLIO ENDPOINTS (Direct Supabase Hydration)
// ==========================================

// Get profile and social links
router.get('/profile', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rawProfile = await getLatestProfileFromSupabase();
    const { data: dbSocials } = await supabaseServer
      .from('social_links')
      .select('*')
      .order('display_order', { ascending: true });

    res.json({ profile: formatProfile(rawProfile), socials: dbSocials || [] });
  } catch (err) {
    next(err);
  }
});

// Get published projects
router.get('/projects', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data: projects, error } = await supabaseServer
      .from('projects')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;
    res.json(projects || []);
  } catch (err) {
    next(err);
  }
});

// Get published skills
router.get('/skills', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data: skills, error } = await supabaseServer
      .from('skills')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;
    res.json(skills || []);
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

    res.json({ experience: experience || [], education: education || [] });
  } catch (err) {
    next(err);
  }
});

// Get experiences (singular & plural aliases)
const handleGetExperiences = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data: experience, error } = await supabaseServer
      .from('experiences')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;
    const formatted = (experience || []).map((exp: any) => ({
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

// Get education
router.get('/education', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data: education, error } = await supabaseServer
      .from('education')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;
    res.json(education || []);
  } catch (err) {
    next(err);
  }
});

// Get certifications
router.get('/certifications', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data: certifications, error } = await supabaseServer
      .from('certifications')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;
    res.json(certifications || []);
  } catch (err) {
    next(err);
  }
});

// Get achievements
router.get('/achievements', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data: achievements, error } = await supabaseServer
      .from('achievements')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;
    res.json(achievements || []);
  } catch (err) {
    next(err);
  }
});

// Get socials
router.get('/socials', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data: socials, error } = await supabaseServer
      .from('social_links')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;
    res.json(socials || []);
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
      read: false,
      created_at: new Date().toISOString(),
    };

    const { error: dbErr } = await supabaseServer.from('messages').insert([payload]);
    if (dbErr) {
      console.warn('[Contact] Supabase insert warning:', dbErr.message);
    }

    const emailResult = await sendAdminNotification(payload);

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
// 2. ADMIN AUTHENTICATION & TARGETED UPDATE/INSERT APIs
// ==========================================

router.post('/auth/login', login);
router.post('/auth/logout', logout);
router.get('/auth/status', authenticateJWT, checkAuth);

// Update Profile details (Targeted Update to Supabase)
router.put('/admin/profile', authenticateJWT, validate(schemas.profileUpdateSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body;
    const rolesArray = Array.isArray(body.roles)
      ? body.roles
      : (typeof body.roles === 'string' ? body.roles.split(',').map((r: string) => r.trim()).filter(Boolean) : []);

    const existingRecord = await getLatestProfileFromSupabase();

    const payload: any = {
      name: body.name || existingRecord?.name || 'MOHAMMAD RAEES',
      roles: rolesArray.length > 0 ? rolesArray : (existingRecord?.roles || ['Full Stack Developer']),
      bio: body.bio !== undefined ? body.bio : (existingRecord?.bio || ''),
      availability: body.availability !== undefined ? body.availability : (existingRecord?.availability || 'Available for new opportunities'),
      location: body.location !== undefined ? body.location : (existingRecord?.location || 'Pune, Maharashtra, India / Remote'),
      profile_image: body.profileImage !== undefined ? body.profileImage : (body.profile_image !== undefined ? body.profile_image : (existingRecord?.profile_image || '')),
      resume_url: body.resumeUrl !== undefined ? body.resumeUrl : (body.resume_url !== undefined ? body.resume_url : (existingRecord?.resume_url || '')),
      updated_at: new Date().toISOString(),
    };

    if (existingRecord?.id) {
      let updateRes = await supabaseServer.from('profiles').update(payload).eq('id', existingRecord.id);
      if (updateRes.error && (updateRes.error.message?.includes('location') || updateRes.error.code === 'PGRST204')) {
        const fallbackPayload = { ...payload };
        delete fallbackPayload.location;
        updateRes = await supabaseServer.from('profiles').update(fallbackPayload).eq('id', existingRecord.id);
      }

      if (updateRes.error) {
        return res.status(500).json({ error: updateRes.error.message || 'Failed to update profile in database.' });
      }

      const updatedProfile = await getLatestProfileFromSupabase();
      return res.json(formatProfile(updatedProfile || { ...existingRecord, ...payload }));
    } else {
      const insertPayload = { ...payload, id: crypto.randomUUID() };
      let insertRes = await supabaseServer.from('profiles').insert([insertPayload]).select();
      if (insertRes.error && (insertRes.error.message?.includes('location') || insertRes.error.code === 'PGRST204')) {
        const fallbackPayload = { ...insertPayload };
        delete fallbackPayload.location;
        insertRes = await supabaseServer.from('profiles').insert([fallbackPayload]).select();
      }

      if (insertRes.error || !insertRes.data || insertRes.data.length === 0) {
        return res.status(500).json({ error: insertRes.error?.message || 'Failed to create profile in database.' });
      }

      return res.json(formatProfile(insertRes.data[0]));
    }
  } catch (err: any) {
    console.error('Error updating profile:', err.message || err);
    res.status(500).json({ error: err.message || 'Failed to update profile in database.' });
  }
});

// --- Projects CRUD (Targeted Updates) ---
router.post('/admin/projects', authenticateJWT, validate(schemas.projectCreateSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body;
    const newItem = {
      id: crypto.randomUUID(),
      title: body.title,
      slug: body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: body.description || '',
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
      updated_at: new Date().toISOString(),
    };

    let { data, error } = await supabaseServer.from('projects').insert([newItem]).select();
    if (error && (error.message?.includes('video_url') || error.code === 'PGRST204')) {
      const fallbackPayload = { ...newItem };
      delete (fallbackPayload as any).video_url;
      const retry = await supabaseServer.from('projects').insert([fallbackPayload]).select();
      data = retry.data;
      error = retry.error;
    }

    if (error || !data || data.length === 0) {
      return res.status(500).json({ error: error?.message || 'Database error: failed to create project in Supabase.' });
    }

    res.status(201).json(data[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create project.' });
  }
});

router.put('/admin/projects/:id', authenticateJWT, validate(schemas.projectUpdateSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body;
    const id = req.params.id;

    const { data: existing } = await supabaseServer.from('projects').select('*').eq('id', id).maybeSingle();

    const payload = {
      title: body.title !== undefined ? body.title : existing?.title,
      slug: body.slug !== undefined ? body.slug : existing?.slug,
      description: body.description !== undefined ? body.description : existing?.description,
      long_description: body.longDescription !== undefined ? body.longDescription : (body.long_description !== undefined ? body.long_description : existing?.long_description),
      thumbnail: body.thumbnail !== undefined ? body.thumbnail : existing?.thumbnail,
      video_url: body.videoUrl !== undefined ? body.videoUrl : (body.video_url !== undefined ? body.video_url : existing?.video_url),
      tech_stack: body.techStack !== undefined ? (Array.isArray(body.techStack) ? body.techStack : []) : (body.tech_stack !== undefined ? body.tech_stack : existing?.tech_stack),
      demo_url: body.demoUrl !== undefined ? body.demoUrl : (body.demo_url !== undefined ? body.demo_url : existing?.demo_url),
      github_url: body.githubUrl !== undefined ? body.githubUrl : (body.github_url !== undefined ? body.github_url : existing?.github_url),
      featured: body.featured !== undefined ? Boolean(body.featured) : (existing?.featured ?? false),
      published: body.published !== undefined ? Boolean(body.published) : (existing?.published ?? true),
      display_order: Number(body.order !== undefined ? body.order : (body.display_order !== undefined ? body.display_order : (existing?.display_order || 0))),
      updated_at: new Date().toISOString(),
    };

    let updateRes = await supabaseServer.from('projects').update(payload).eq('id', id);
    if (updateRes.error && (updateRes.error.message?.includes('video_url') || updateRes.error.code === 'PGRST204')) {
      const fallbackPayload = { ...payload };
      delete (fallbackPayload as any).video_url;
      updateRes = await supabaseServer.from('projects').update(fallbackPayload).eq('id', id);
    }

    if (updateRes.error) {
      return res.status(500).json({ error: updateRes.error.message || 'Failed to update project in database.' });
    }

    const { data: updated } = await supabaseServer.from('projects').select('*').eq('id', id).maybeSingle();
    res.json(updated || { id, ...payload });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update project.' });
  }
});

router.delete('/admin/projects/:id', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    const { error } = await supabaseServer.from('projects').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true, message: 'Project deleted.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete project.' });
  }
});

// --- Skills CRUD (Targeted Updates) ---
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
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseServer.from('skills').insert([newItem]).select();
    if (error || !data || data.length === 0) {
      return res.status(500).json({ error: error?.message || 'Database error: failed to create skill in Supabase.' });
    }
    res.status(201).json(data[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create skill.' });
  }
});

router.put('/admin/skills/:id', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body;
    const id = req.params.id;
    const { data: existing } = await supabaseServer.from('skills').select('*').eq('id', id).maybeSingle();

    const payload = {
      name: body.name !== undefined ? body.name : existing?.name,
      category: body.category !== undefined ? body.category : existing?.category,
      level: body.level !== undefined ? Number(body.level) : existing?.level,
      icon: body.icon !== undefined ? body.icon : existing?.icon,
      display_order: Number(body.order !== undefined ? body.order : (body.display_order !== undefined ? body.display_order : (existing?.display_order || 0))),
      published: body.published !== undefined ? Boolean(body.published) : (existing?.published ?? true),
    };

    const updateRes = await supabaseServer.from('skills').update(payload).eq('id', id);
    if (updateRes.error) {
      return res.status(500).json({ error: updateRes.error.message || 'Failed to update skill in database.' });
    }

    const { data: updated } = await supabaseServer.from('skills').select('*').eq('id', id).maybeSingle();
    res.json(updated || { id, ...payload });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update skill.' });
  }
});

router.delete('/admin/skills/:id', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    const { error } = await supabaseServer.from('skills').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete skill.' });
  }
});

// --- Experience CRUD (Targeted Updates) ---
router.post('/admin/experience', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body;
    const newItem = {
      id: crypto.randomUUID(),
      role: body.role || '',
      company: body.company || '',
      logo: body.logo || '',
      start_date: body.startDate || body.start_date || '',
      end_date: body.endDate || body.end_date || null,
      responsibilities: Array.isArray(body.responsibilities) ? body.responsibilities : [],
      tech_tags: Array.isArray(body.techTags) ? body.techTags : (body.tech_tags || []),
      display_order: Number(body.order || body.display_order || 0),
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseServer.from('experiences').insert([newItem]).select();
    if (error || !data || data.length === 0) {
      return res.status(500).json({ error: error?.message || 'Database error: failed to create experience in Supabase.' });
    }
    res.status(201).json(data[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create experience.' });
  }
});

router.put('/admin/experience/:id', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body;
    const id = req.params.id;
    const { data: existing } = await supabaseServer.from('experiences').select('*').eq('id', id).maybeSingle();

    const payload = {
      role: body.role !== undefined ? body.role : existing?.role,
      company: body.company !== undefined ? body.company : existing?.company,
      logo: body.logo !== undefined ? body.logo : existing?.logo,
      start_date: body.startDate !== undefined ? body.startDate : (body.start_date !== undefined ? body.start_date : existing?.start_date),
      end_date: body.endDate !== undefined ? body.endDate : (body.end_date !== undefined ? body.end_date : existing?.end_date),
      responsibilities: body.responsibilities !== undefined ? (Array.isArray(body.responsibilities) ? body.responsibilities : []) : existing?.responsibilities,
      tech_tags: body.techTags !== undefined ? (Array.isArray(body.techTags) ? body.techTags : []) : (body.tech_tags !== undefined ? body.tech_tags : existing?.tech_tags),
      display_order: Number(body.order !== undefined ? body.order : (body.display_order !== undefined ? body.display_order : (existing?.display_order || 0))),
    };

    const updateRes = await supabaseServer.from('experiences').update(payload).eq('id', id);
    if (updateRes.error) {
      return res.status(500).json({ error: updateRes.error.message || 'Failed to update experience in database.' });
    }

    const { data: updated } = await supabaseServer.from('experiences').select('*').eq('id', id).maybeSingle();
    res.json(updated || { id, ...payload });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update experience.' });
  }
});

router.delete('/admin/experience/:id', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    const { error } = await supabaseServer.from('experiences').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete experience.' });
  }
});

// --- Education CRUD (Targeted Updates) ---
router.post('/admin/education', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body;
    const newItem = {
      id: crypto.randomUUID(),
      degree: body.degree || '',
      institution: body.institution || '',
      logo: body.logo || '',
      start_date: body.startDate || body.start_date || '',
      end_date: body.endDate || body.end_date || '',
      milestones: Array.isArray(body.milestones) ? body.milestones : [],
      display_order: Number(body.order || body.display_order || 0),
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseServer.from('education').insert([newItem]).select();
    if (error || !data || data.length === 0) {
      return res.status(500).json({ error: error?.message || 'Database error: failed to create education in Supabase.' });
    }
    res.status(201).json(data[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create education.' });
  }
});

router.put('/admin/education/:id', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body;
    const id = req.params.id;
    const { data: existing } = await supabaseServer.from('education').select('*').eq('id', id).maybeSingle();

    const payload = {
      degree: body.degree !== undefined ? body.degree : existing?.degree,
      institution: body.institution !== undefined ? body.institution : existing?.institution,
      logo: body.logo !== undefined ? body.logo : existing?.logo,
      start_date: body.startDate !== undefined ? body.startDate : (body.start_date !== undefined ? body.start_date : existing?.start_date),
      end_date: body.endDate !== undefined ? body.endDate : (body.end_date !== undefined ? body.end_date : existing?.end_date),
      milestones: body.milestones !== undefined ? (Array.isArray(body.milestones) ? body.milestones : []) : existing?.milestones,
      display_order: Number(body.order !== undefined ? body.order : (body.display_order !== undefined ? body.display_order : (existing?.display_order || 0))),
    };

    const updateRes = await supabaseServer.from('education').update(payload).eq('id', id);
    if (updateRes.error) {
      return res.status(500).json({ error: updateRes.error.message || 'Failed to update education in database.' });
    }

    const { data: updated } = await supabaseServer.from('education').select('*').eq('id', id).maybeSingle();
    res.json(updated || { id, ...payload });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update education.' });
  }
});

router.delete('/admin/education/:id', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    const { error } = await supabaseServer.from('education').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete education.' });
  }
});

// --- Certifications CRUD (Targeted Updates) ---
router.post('/admin/certifications', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body;
    const skillsList = Array.isArray(body.skills)
      ? body.skills
      : (typeof body.skills === 'string' ? body.skills.split(',').map((s: string) => s.trim()).filter(Boolean) : []);

    const newItem = {
      id: crypto.randomUUID(),
      title: body.title || '',
      issuer: body.issuer || '',
      credential_id: body.credentialId || body.credential_id || '',
      verification_url: body.verificationUrl || body.verification_url || '',
      thumbnail: body.thumbnail || '',
      skills: skillsList,
      date: body.date || '',
      published: body.published !== undefined ? Boolean(body.published) : true,
      display_order: Number(body.order || body.display_order || 0),
      created_at: new Date().toISOString(),
    };

    let { data, error } = await supabaseServer.from('certifications').insert([newItem]).select();
    if (error && (error.message?.includes('skills') || error.code === 'PGRST204')) {
      const fallbackPayload = { ...newItem };
      delete (fallbackPayload as any).skills;
      const retry = await supabaseServer.from('certifications').insert([fallbackPayload]).select();
      data = retry.data;
      error = retry.error;
    }

    if (error || !data || data.length === 0) {
      return res.status(500).json({ error: error?.message || 'Database error: failed to create certification in Supabase.' });
    }

    res.status(201).json(data[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create certification.' });
  }
});

router.put('/admin/certifications/:id', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body;
    const id = req.params.id;
    const { data: existing } = await supabaseServer.from('certifications').select('*').eq('id', id).maybeSingle();

    const skillsList = body.skills !== undefined
      ? (Array.isArray(body.skills) ? body.skills : (typeof body.skills === 'string' ? body.skills.split(',').map((s: string) => s.trim()).filter(Boolean) : []))
      : existing?.skills;

    const payload = {
      title: body.title !== undefined ? body.title : existing?.title,
      issuer: body.issuer !== undefined ? body.issuer : existing?.issuer,
      credential_id: body.credentialId !== undefined ? body.credentialId : (body.credential_id !== undefined ? body.credential_id : existing?.credential_id),
      verification_url: body.verificationUrl !== undefined ? body.verificationUrl : (body.verification_url !== undefined ? body.verification_url : existing?.verification_url),
      thumbnail: body.thumbnail !== undefined ? body.thumbnail : existing?.thumbnail,
      skills: skillsList,
      date: body.date !== undefined ? body.date : existing?.date,
      published: body.published !== undefined ? Boolean(body.published) : (existing?.published ?? true),
      display_order: Number(body.order !== undefined ? body.order : (body.display_order !== undefined ? body.display_order : (existing?.display_order || 0))),
    };

    let updateRes = await supabaseServer.from('certifications').update(payload).eq('id', id);
    if (updateRes.error && (updateRes.error.message?.includes('skills') || updateRes.error.code === 'PGRST204')) {
      const fallbackPayload = { ...payload };
      delete (fallbackPayload as any).skills;
      updateRes = await supabaseServer.from('certifications').update(fallbackPayload).eq('id', id);
    }

    if (updateRes.error) {
      return res.status(500).json({ error: updateRes.error.message || 'Failed to update certification in database.' });
    }

    const { data: updated } = await supabaseServer.from('certifications').select('*').eq('id', id).maybeSingle();
    res.json(updated || { id, ...payload });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update certification.' });
  }
});

router.delete('/admin/certifications/:id', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    const { error } = await supabaseServer.from('certifications').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete certification.' });
  }
});

// --- Achievements CRUD (Targeted Updates) ---
router.post('/admin/achievements', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body;
    const newItem = {
      id: crypto.randomUUID(),
      title: body.title || '',
      issuer: body.issuer || '',
      description: body.description || '',
      date: body.date || '',
      verification_url: body.verificationUrl || body.verification_url || '',
      published: body.published !== undefined ? Boolean(body.published) : true,
      display_order: Number(body.order || body.display_order || 0),
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseServer.from('achievements').insert([newItem]).select();
    if (error || !data || data.length === 0) {
      return res.status(500).json({ error: error?.message || 'Database error: failed to create achievement in Supabase.' });
    }
    res.status(201).json(data[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create achievement.' });
  }
});

router.put('/admin/achievements/:id', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body;
    const id = req.params.id;
    const { data: existing } = await supabaseServer.from('achievements').select('*').eq('id', id).maybeSingle();

    const payload = {
      title: body.title !== undefined ? body.title : existing?.title,
      issuer: body.issuer !== undefined ? body.issuer : existing?.issuer,
      description: body.description !== undefined ? body.description : existing?.description,
      date: body.date !== undefined ? body.date : existing?.date,
      verification_url: body.verificationUrl !== undefined ? body.verificationUrl : (body.verification_url !== undefined ? body.verification_url : existing?.verification_url),
      published: body.published !== undefined ? Boolean(body.published) : (existing?.published ?? true),
      display_order: Number(body.order !== undefined ? body.order : (body.display_order !== undefined ? body.display_order : (existing?.display_order || 0))),
    };

    const updateRes = await supabaseServer.from('achievements').update(payload).eq('id', id);
    if (updateRes.error) {
      return res.status(500).json({ error: updateRes.error.message || 'Failed to update achievement in database.' });
    }

    const { data: updated } = await supabaseServer.from('achievements').select('*').eq('id', id).maybeSingle();
    res.json(updated || { id, ...payload });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update achievement.' });
  }
});

router.delete('/admin/achievements/:id', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    const { error } = await supabaseServer.from('achievements').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete achievement.' });
  }
});

// --- Social Links CRUD (Targeted Updates) ---
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
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseServer.from('social_links').insert([newItem]).select();
    if (error || !data || data.length === 0) {
      return res.status(500).json({ error: error?.message || 'Database error: failed to create social link in Supabase.' });
    }
    res.status(201).json(data[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create social link.' });
  }
});

router.put('/admin/socials/:id', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body;
    const id = req.params.id;
    const { data: existing } = await supabaseServer.from('social_links').select('*').eq('id', id).maybeSingle();

    const payload = {
      platform: body.platform !== undefined ? body.platform : existing?.platform,
      url: body.url !== undefined ? body.url : existing?.url,
      username: body.username !== undefined ? body.username : existing?.username,
      published: body.published !== undefined ? Boolean(body.published) : (existing?.published ?? true),
      display_order: Number(body.displayOrder !== undefined ? body.displayOrder : (body.order !== undefined ? body.order : (body.display_order !== undefined ? body.display_order : (existing?.display_order || 0)))),
    };

    const updateRes = await supabaseServer.from('social_links').update(payload).eq('id', id);
    if (updateRes.error) {
      return res.status(500).json({ error: updateRes.error.message || 'Failed to update social link in database.' });
    }

    const { data: updated } = await supabaseServer.from('social_links').select('*').eq('id', id).maybeSingle();
    res.json(updated || { id, ...payload });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update social link.' });
  }
});

router.delete('/admin/socials/:id', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    const { error } = await supabaseServer.from('social_links').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete social link.' });
  }
});

// --- Message Inbox Management ---
router.get('/admin/messages', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data: dbMessages, error } = await supabaseServer
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(dbMessages || []);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch messages.' });
  }
});

router.put('/admin/messages/:id/read', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    const { read } = req.body;

    const { error } = await supabaseServer.from('messages').update({ read: Boolean(read) }).eq('id', id);
    if (error) throw error;

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

    const { data: msg } = await supabaseServer.from('messages').select('*').eq('id', id).maybeSingle();
    if (!msg) {
      return res.status(404).json({ error: 'Message not found in inbox.' });
    }

    // 1. Send reply email to client
    const emailResult = await sendClientReply(
      { id: msg.id, name: msg.name, email: msg.email, subject: msg.subject, message: msg.message },
      replyText.trim()
    );

    const replyEntry = {
      text: replyText.trim(),
      sentAt: new Date().toISOString(),
      emailSent: emailResult.sent,
      emailError: emailResult.error || null,
    };

    let currentReplies = [];
    try {
      currentReplies = typeof msg.replies === 'string' ? JSON.parse(msg.replies) : (Array.isArray(msg.replies) ? msg.replies : []);
    } catch {
      currentReplies = [];
    }
    currentReplies.push(replyEntry);

    // 2. Update Supabase record
    await supabaseServer
      .from('messages')
      .update({
        read: true,
        replied: true,
        replied_at: replyEntry.sentAt,
        replies: JSON.stringify(currentReplies),
      })
      .eq('id', id);

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
    const { error } = await supabaseServer.from('messages').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete message.' });
  }
});

// --- File Upload Handler (Supabase Storage Direct Upload) ---
const handleFileUpload = async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  try {
    const publicUrl = await uploadToSupabaseStorage(req.file.path, req.file.originalname, req.file.mimetype);
    return res.status(201).json({ success: true, fileUrl: publicUrl, url: publicUrl });
  } catch (err: any) {
    console.warn('Supabase Storage upload fallback to local URL:', err.message || err);
    const host = req.get('host') || 'localhost:5000';
    const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
    const baseUrl = process.env.BACKEND_URL || `${protocol}://${host}`;
    const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;
    return res.status(201).json({ success: true, fileUrl, url: fileUrl });
  }
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
