import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Pencil,
  Trash2,
  Upload,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  Share2,
  X,
  FileText,
  Search,
  Reply,
  MailCheck,
  Send,
  Mail,
} from 'lucide-react';

import { apiFetch, getMediaUrl } from '@/lib/api';


interface ContentPanelsProps {
  refreshStats: () => void;
}

export default function ContentPanels({ refreshStats }: ContentPanelsProps) {
  const params = useParams<{ panel: string }>();
  const location = useLocation();
  const panel = params.panel || 'profile';

  const [data, setData] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>({
    name: '',
    roles: '',
    bio: '',
    availability: '',
    location: '',
    profileImage: '',
    resumeUrl: '',
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Message Inbox reply state
  const [replyingMsgId, setReplyingMsgId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<string>('');

  // LinkedIn-style skills tags state for Certifications
  const [skillSearchQuery, setSkillSearchQuery] = useState<string>('');
  const [showSkillSuggestions, setShowSkillSuggestions] = useState<boolean>(false);


  const DEFAULT_SKILLS = [
    'Prompt Engineering',
    'Generative AI',
    'React',
    'TypeScript',
    'Node.js',
    'Python',
    'System Design',
    'DevOps',
    'AWS',
    'PostgreSQL',
    'Tailwind CSS',
    'Next.js',
    'Docker',
    'GraphQL',
    'MongoDB',
    'C++',
    'Java',
    'Machine Learning',
    'Data Structures',
    'Git',
    'Vercel',
    'Figma',
    'Clerk',
    'Inngest',
    'Convex DB',
    'Remotion',
    'REST API',
  ];

  const addSkillTag = (skillName: string) => {
    if (!editingItem) return;
    const currentSkills = Array.isArray(editingItem.skills) ? editingItem.skills : [];
    if (!currentSkills.includes(skillName)) {
      setEditingItem({ ...editingItem, skills: [...currentSkills, skillName] });
    }
    setSkillSearchQuery('');
    setShowSkillSuggestions(false);
  };


  // Sync panel selection dynamically from React Router params & location
  useEffect(() => {
    setEditingItem(null);
    setIsAdding(false);
    setAlert(null);
    fetchData(panel);
  }, [panel, location.pathname]);

  const fetchData = async (activePanel = panel) => {

    setLoading(true);
    try {
      if (activePanel === 'profile') {
        const res = await apiFetch('profile');
        const json = await res.json();
        if (json.profile) {
          const rawRoles = json.profile.roles;
          const rolesStr = Array.isArray(rawRoles) ? rawRoles.join(', ') : (rawRoles || '');
          setProfile({
            ...json.profile,
            roles: rolesStr,
            profileImage: json.profile.profileImage || json.profile.profile_image || '',
            resumeUrl: json.profile.resumeUrl || json.profile.resume_url || '',
            location: json.profile.location || 'Pune, Maharashtra, India / Remote',
          });
        }
      } else if (activePanel === 'messages') {
        const res = await apiFetch('admin/messages');
        const json = await res.json();
        setData(Array.isArray(json) ? json : []);
      } else if (activePanel === 'socials') {
        const res = await apiFetch('socials');
        const json = await res.json();
        setData(Array.isArray(json) ? json : []);
      } else {
        // projects, skills, timeline, certifications
        const endpoint = (activePanel === 'timeline' ? 'timeline' : activePanel) || '';
        const res = await apiFetch(endpoint);
        const json = await res.json();
        if (activePanel === 'timeline') {
          const exp = Array.isArray(json.experience) ? json.experience.map((e: any) => ({ ...e, type: 'experience' })) : [];
          const edu = Array.isArray(json.education) ? json.education.map((e: any) => ({ ...e, type: 'education' })) : [];
          setData([...exp, ...edu]);
        } else {
          setData(Array.isArray(json) ? json : []);
        }
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };



  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'profileImage' | 'resumeUrl' | 'thumbnail' | 'videoUrl'
  ) => {
    if (!e.target.files?.[0]) return;
    setUploading(true);
    setAlert(null);

    const formData = new FormData();
    formData.append('file', e.target.files[0]);

    try {
      const res = await apiFetch('admin/upload', {
        method: 'POST',
        body: formData,
      });
      const json = await res.json();
      if (res.ok && json.fileUrl) {
        if (editingItem) {
          setEditingItem({
            ...editingItem,
            [field]: json.fileUrl,
            ...(field === 'videoUrl' ? { video_url: json.fileUrl } : {}),
          });
          setAlert({ type: 'success', msg: `${field === 'videoUrl' ? 'Video demo' : 'File'} uploaded to Supabase Storage!` });
        } else {
          const updatedProfile = { ...profile, [field]: json.fileUrl };
          setProfile(updatedProfile);

          // Auto-persist profile upload to server & database immediately
          const rawRoles = updatedProfile.roles;
          const rolesArray = Array.isArray(rawRoles)
            ? rawRoles
            : (typeof rawRoles === 'string' ? rawRoles.split(',').map((r: string) => r.trim()).filter(Boolean) : []);

          const saveRes = await apiFetch('admin/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...updatedProfile, roles: rolesArray }),
          });
          const saveJson = await saveRes.json();

          if (saveRes.ok && saveJson && !saveJson.error) {
            setProfile({
              ...saveJson,
              roles: Array.isArray(saveJson.roles) ? saveJson.roles.join(', ') : (saveJson.roles || ''),
              profileImage: saveJson.profileImage || saveJson.profile_image || '',
              resumeUrl: saveJson.resumeUrl || saveJson.resume_url || '',
            });
            setAlert({ type: 'success', msg: `${field === 'resumeUrl' ? 'Resume PDF' : 'Profile picture'} uploaded and saved successfully in Supabase!` });
            refreshStats();
          } else {
            setAlert({ type: 'error', msg: saveJson?.error || 'File uploaded, but failed to save profile in database.' });
          }
        }
      } else {
        setAlert({ type: 'error', msg: json.error || 'Upload failed.' });
      }
    } catch (err) {
      setAlert({ type: 'error', msg: 'Network error uploading file.' });
    } finally {
      setUploading(false);
    }
  };

  // Submit profile edits
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAlert(null);

    const rawRoles = profile.roles;
    const rolesArray = Array.isArray(rawRoles)
      ? rawRoles
      : (typeof rawRoles === 'string' ? rawRoles.split(',').map((r: string) => r.trim()).filter(Boolean) : []);

    try {
      const res = await apiFetch('admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...profile, roles: rolesArray }),
      });
      const json = await res.json();
      if (res.ok && json && !json.error) {
        setProfile({
          ...json,
          roles: Array.isArray(json.roles) ? json.roles.join(', ') : (json.roles || ''),
          profileImage: json.profileImage || json.profile_image || '',
          resumeUrl: json.resumeUrl || json.resume_url || '',
        });
        setAlert({ type: 'success', msg: 'Profile updated & persisted successfully in Supabase!' });
        refreshStats();
      } else {
        setAlert({ type: 'error', msg: json?.error || 'Failed to update profile in database.' });
      }
    } catch (err) {
      setAlert({ type: 'error', msg: 'Error submitting profile details.' });
    } finally {
      setLoading(false);
    }
  };

  // CRUD actions for list items
  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAlert(null);

    const itemId = editingItem?.id || editingItem?._id;
    const method = itemId ? 'PUT' : 'POST';
    
    let endpoint = panel;
    if (panel === 'timeline') {
      endpoint = editingItem.type === 'education' ? 'education' : 'experience';
    }
    const endpointPath = itemId 
      ? `admin/${endpoint}/${itemId}`
      : `admin/${endpoint}`;

    const submission = { ...editingItem };
    if (submission.techStack && typeof submission.techStack === 'string') {
      submission.techStack = submission.techStack.split(',').map((s: string) => s.trim()).filter(Boolean);
    }
    if (submission.techTags && typeof submission.techTags === 'string') {
      submission.techTags = submission.techTags.split(',').map((s: string) => s.trim()).filter(Boolean);
    }
    if (submission.responsibilities && typeof submission.responsibilities === 'string') {
      submission.responsibilities = submission.responsibilities.split('\n').map((s: string) => s.trim()).filter(Boolean);
    }
    if (submission.milestones && typeof submission.milestones === 'string') {
      submission.milestones = submission.milestones.split('\n').map((s: string) => s.trim()).filter(Boolean);
    }

    try {
      const res = await apiFetch(endpointPath, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submission),
      });
      const json = await res.json();

      if (res.ok && json && !json.error) {
        setAlert({ type: 'success', msg: 'Item saved & persisted successfully in Supabase!' });
        setEditingItem(null);
        setIsAdding(false);
        await fetchData();
        refreshStats();
      } else {
        setAlert({ type: 'error', msg: json?.error || 'Failed to save item in database.' });
      }
    } catch (err) {
      setAlert({ type: 'error', msg: 'Network error saving item.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (id: string, type?: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    setLoading(true);
    setAlert(null);

    let endpoint = panel;
    if (panel === 'timeline') {
      endpoint = type === 'education' ? 'education' : 'experience';
    }

    try {
      const res = await apiFetch(`admin/${endpoint}/${id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (res.ok && json && !json.error) {
        setAlert({ type: 'success', msg: 'Item deleted.' });
        await fetchData();
        refreshStats();
      } else {
        setAlert({ type: 'error', msg: json?.error || 'Delete failed in database.' });
      }
    } catch (err) {
      setAlert({ type: 'error', msg: 'Error deleting item.' });
    } finally {
      setLoading(false);
    }
  };

  const toggleMessageRead = async (id: string, currentRead: boolean) => {
    try {
      await apiFetch(`admin/messages/${id}/read`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: !currentRead }),
      });
      fetchData();
      refreshStats();
    } catch (err) {
      console.error('Error updating read state:', err);
    }
  };

  const handleSendReply = async (msg: any) => {
    if (!replyText.trim()) {
      setAlert({ type: 'error', msg: 'Please type a reply before sending.' });
      return;
    }
    setLoading(true);
    setAlert(null);

    try {
      const res = await apiFetch(`admin/messages/${msg.id || msg._id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ replyText }),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        if (json.emailSent) {
          setAlert({ type: 'success', msg: `Reply emailed to ${msg.email} and saved in thread.` });
        } else {
          // Server saved the reply but email failed (e.g. app password not configured yet)
          setAlert({
            type: 'error',
            msg: `Reply saved in inbox. Email delivery failed: ${json.emailError || 'SMTP not configured'}. Add EMAIL_APP_PASSWORD to .env to enable sending.`,
          });
        }
        setReplyingMsgId(null);
        setReplyText('');
        fetchData();
        refreshStats();
      } else {
        setAlert({ type: 'error', msg: json.error || 'Failed to send reply.' });
      }
    } catch (err) {
      setAlert({ type: 'error', msg: 'Network error while sending reply.' });
    } finally {
      setLoading(false);
    }
  };


  if (loading && data.length === 0 && !profile.name) {
    return <div className="text-center font-mono py-12 text-xs uppercase animate-pulse">Loading panel content...</div>;
  }

  return (
    <div className="flex flex-col gap-6 select-none">
      {/* Panel Headers */}
      <div className="flex items-center justify-between border-b border-border-subtle pb-4">
        <div>
          <h1 className="font-display font-black text-2xl text-white uppercase tracking-wider">{panel} panel</h1>
          <p className="text-xs text-text-secondary mt-1">Manage all components for {panel} collections.</p>
        </div>
        {panel !== 'profile' && panel !== 'messages' && !editingItem && !isAdding && (
          <Button
            onClick={() => {
              setIsAdding(true);
              if (panel === 'projects') {
                setEditingItem({ title: '', slug: '', description: '', longDescription: '', techStack: '', demoUrl: '', githubUrl: '', featured: false, published: true });
              } else if (panel === 'skills') {
                setEditingItem({ name: '', category: 'frontend', level: 80, published: true });
              } else if (panel === 'socials') {
                setEditingItem({ platform: 'GitHub', url: '', username: '', displayOrder: data.length + 1, published: true });
              } else if (panel === 'timeline') {
                setEditingItem({ type: 'experience', role: '', company: '', startDate: '', endDate: '', responsibilities: '', milestones: '', degree: '', institution: '' });
              } else if (panel === 'certifications') {
                setEditingItem({ title: '', issuer: '', credentialId: '', verificationUrl: '', date: '', published: true });
              }
            }}
            className="bg-brand-crimson text-white hover:bg-brand-crimson-dim text-xs font-semibold px-4 py-2 cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="size-4" />
            ADD NEW
          </Button>
        )}
      </div>

      {alert && (
        <div className={`p-4 border rounded-lg text-xs flex items-center gap-2 ${
          alert.type === 'success'
            ? 'bg-green-500/10 border-green-500/30 text-green-500'
            : 'bg-red-500/10 border-red-500/30 text-red-500'
        }`}>
          {alert.type === 'success' ? <CheckCircle className="size-4" /> : <AlertTriangle className="size-4" />}
          <span>{alert.msg}</span>
        </div>
      )}

      {/* PROFILE PANEL */}
      {panel === 'profile' && (
        <form onSubmit={handleProfileSubmit} className="bg-surface-card border border-border-subtle p-6 rounded-xl flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-text-secondary">NAME</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full bg-black border border-border-subtle focus:border-brand-crimson text-white rounded px-4 py-3 text-sm focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-text-secondary">AVAILABILITY</label>
              <input
                type="text"
                value={profile.availability}
                onChange={(e) => setProfile({ ...profile, availability: e.target.value })}
                className="w-full bg-black border border-border-subtle focus:border-brand-crimson text-white rounded px-4 py-3 text-sm focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-text-secondary">LOCATION</label>
              <input
                type="text"
                value={profile.location || ''}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                placeholder="Pune, Maharashtra, India / Remote"
                className="w-full bg-black border border-border-subtle focus:border-brand-crimson text-white rounded px-4 py-3 text-sm focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-secondary">ROLES (comma separated)</label>
            <input
              type="text"
              value={profile.roles}
              onChange={(e) => setProfile({ ...profile, roles: e.target.value })}
              className="w-full bg-black border border-border-subtle focus:border-brand-crimson text-white rounded px-4 py-3 text-sm focus:outline-none"
              placeholder="Full Stack Engineer, UI Architect"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-secondary">BIO STATEMENT</label>
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              rows={4}
              className="w-full bg-black border border-border-subtle focus:border-brand-crimson text-white rounded px-4 py-3 text-sm focus:outline-none resize-none"
            />
          </div>

          {/* File upload inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border-subtle">
            <div className="flex flex-col gap-3">
              <label className="text-xs font-semibold text-text-secondary">PROFILE PICTURE</label>
              {profile.profileImage && (
                <img src={profile.profileImage} className="w-16 h-16 object-cover rounded-full border border-border-subtle" alt="profile preview" />
              )}
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  id="profile-img-upload"
                  onChange={(e) => handleFileUpload(e, 'profileImage')}
                  className="hidden"
                  accept="image/*"
                />
                <label
                  htmlFor="profile-img-upload"
                  className="inline-flex items-center gap-2 bg-white/5 border border-border-subtle hover:border-brand-crimson px-4 py-2.5 rounded text-xs text-white cursor-pointer transition-colors"
                >
                  <Upload className="size-4 text-brand-crimson" />
                  {uploading ? 'UPLOADING...' : 'UPLOAD PICTURE'}
                </label>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-xs font-semibold text-text-secondary">ACTIVE RESUME PDF</label>
              {profile.resumeUrl && (
                <div className="text-xs text-text-secondary">Currently linked: <a href={profile.resumeUrl} target="_blank" className="text-brand-crimson underline">View PDF</a></div>
              )}
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  id="resume-pdf-upload"
                  onChange={(e) => handleFileUpload(e, 'resumeUrl')}
                  className="hidden"
                  accept="application/pdf"
                />
                <label
                  htmlFor="resume-pdf-upload"
                  className="inline-flex items-center gap-2 bg-white/5 border border-border-subtle hover:border-brand-crimson px-4 py-2.5 rounded text-xs text-white cursor-pointer transition-colors"
                >
                  <Upload className="size-4 text-brand-crimson" />
                  {uploading ? 'UPLOADING...' : 'UPLOAD RESUME'}
                </label>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="bg-brand-crimson text-white hover:bg-brand-crimson-dim uppercase font-semibold text-xs tracking-wider py-4 mt-4 shadow-[0_0_20px_rgba(255,0,27,0.2)] cursor-pointer"
          >
            UPDATE PROFILE DETAILS
          </Button>
        </form>
      )}

      {/* EDITING / ADDING FORM (FOR CRUD PANELS) */}
      {editingItem && (
        <form onSubmit={handleSaveItem} className="bg-surface-card border border-border-subtle p-6 rounded-xl flex flex-col gap-5">
          <div className="flex items-center gap-2 text-text-secondary hover:text-white transition-colors cursor-pointer text-xs mb-2" onClick={() => setEditingItem(null)}>
            <ArrowLeft className="size-4" /> BACK TO LIST
          </div>

          {/* SOCIAL LINKS FORM */}
          {panel === 'socials' && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-text-secondary">PLATFORM</label>
                  <select
                    value={editingItem.platform || 'GitHub'}
                    onChange={(e) => setEditingItem({ ...editingItem, platform: e.target.value })}
                    className="bg-black border border-border-subtle focus:border-brand-crimson text-white rounded px-4 py-3 text-sm focus:outline-none cursor-pointer"
                  >
                    <option value="GitHub">GitHub</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Twitter / X">Twitter / X</option>
                    <option value="Email / Gmail">Email / Gmail</option>
                    <option value="Discord">Discord</option>
                    <option value="Medium">Medium</option>
                    <option value="Reddit">Reddit</option>
                    <option value="YouTube">YouTube</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Instagram">Instagram</option>
                    <option value="LeetCode">LeetCode</option>
                    <option value="HackerRank">HackerRank</option>
                    <option value="CodeChef">CodeChef</option>
                    <option value="Codeforces">Codeforces</option>
                    <option value="Portfolio / Website">Portfolio / Website</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-text-secondary">USERNAME / HANDLE</label>
                  <input
                    type="text"
                    value={editingItem.username || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, username: e.target.value })}
                    placeholder="@mearaees"
                    className="bg-black border border-border-subtle focus:border-brand-crimson text-white rounded px-4 py-3 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-text-secondary">FULL PROFILE URL</label>
                <input
                  type="url"
                  required
                  value={editingItem.url || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, url: e.target.value })}
                  placeholder="https://github.com/mearaees"
                  className="bg-black border border-border-subtle focus:border-brand-crimson text-white rounded px-4 py-3 text-sm focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-text-secondary">DISPLAY ORDER</label>
                  <input
                    type="number"
                    value={editingItem.displayOrder || editingItem.display_order || 1}
                    onChange={(e) => setEditingItem({ ...editingItem, displayOrder: parseInt(e.target.value, 10) || 1 })}
                    className="bg-black border border-border-subtle focus:border-brand-crimson text-white rounded px-4 py-3 text-sm focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="social-published"
                    checked={editingItem.published !== false}
                    onChange={(e) => setEditingItem({ ...editingItem, published: e.target.checked })}
                    className="size-4 text-brand-crimson focus:ring-brand-crimson rounded cursor-pointer"
                  />
                  <label htmlFor="social-published" className="text-xs font-medium text-text-secondary cursor-pointer">
                    PUBLISH ON FOOTER / PUBLIC SITE
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* PROJECT FORMS */}
          {panel === 'projects' && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-text-secondary">TITLE</label>
                  <input
                    type="text"
                    required
                    value={editingItem.title}
                    onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') })}
                    className="bg-black border border-border-subtle focus:border-brand-crimson text-white rounded px-4 py-3 text-sm focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-text-secondary">SLUG</label>
                  <input
                    type="text"
                    required
                    value={editingItem.slug}
                    onChange={(e) => setEditingItem({ ...editingItem, slug: e.target.value })}
                    className="bg-black border border-border-subtle focus:border-brand-crimson text-white rounded px-4 py-3 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-text-secondary">SHORT DESCRIPTION</label>
                <input
                  type="text"
                  required
                  value={editingItem.description}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  className="bg-black border border-border-subtle focus:border-brand-crimson text-white rounded px-4 py-3 text-sm focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-text-secondary">LONG SPECIFICATION (optional)</label>
                <textarea
                  value={editingItem.longDescription || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, longDescription: e.target.value })}
                  rows={4}
                  className="bg-black border border-border-subtle focus:border-brand-crimson text-white rounded px-4 py-3 text-sm focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-text-secondary">TECH STACK (comma separated)</label>
                  <input
                    type="text"
                    value={editingItem.techStack || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, techStack: e.target.value })}
                    className="bg-black border border-border-subtle focus:border-brand-crimson text-white rounded px-4 py-3 text-sm focus:outline-none"
                    placeholder="React, TypeScript, Node.js"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-text-secondary">LIVE DEMO URL</label>
                  <input
                    type="text"
                    value={editingItem.demoUrl || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, demoUrl: e.target.value })}
                    className="bg-black border border-border-subtle focus:border-brand-crimson text-white rounded px-4 py-3 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-text-secondary">GITHUB REPOSITORY URL</label>
                <input
                  type="text"
                  value={editingItem.githubUrl || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, githubUrl: e.target.value })}
                  className="bg-black border border-border-subtle focus:border-brand-crimson text-white rounded px-4 py-3 text-sm focus:outline-none"
                />
              </div>

              {/* MEDIA ATTACHMENTS (SCREENSHOT IMAGE & DEMO VIDEO OVERVIEW) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border-subtle">
                {/* 1. Project Screenshot Image */}
                <div className="flex flex-col gap-3 bg-black/40 border border-border-subtle p-4 rounded-xl">
                  <span className="text-xs font-bold text-white uppercase flex items-center gap-2">
                    <span>PROJECT SCREENSHOT / COVER IMAGE</span>
                  </span>

                  {editingItem.thumbnail && (
                    <div className="w-full h-36 rounded-lg border border-border-subtle overflow-hidden relative bg-black">
                      <img src={editingItem.thumbnail} alt="Project Screenshot Preview" className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-mono text-text-secondary uppercase">IMAGE URL LINK</label>
                    <input
                      type="text"
                      value={editingItem.thumbnail || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, thumbnail: e.target.value })}
                      placeholder="https://... or upload below"
                      className="bg-black border border-border-subtle focus:border-brand-crimson text-white rounded px-3 py-2 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="file"
                      id="proj-screenshot-upload"
                      onChange={(e) => handleFileUpload(e, 'thumbnail')}
                      className="hidden"
                      accept="image/*"
                    />
                    <label
                      htmlFor="proj-screenshot-upload"
                      className="w-full inline-flex items-center justify-center gap-2 bg-white/5 border border-border-subtle hover:border-brand-crimson px-4 py-2.5 rounded text-xs font-semibold text-white cursor-pointer transition-colors"
                    >
                      <Upload className="size-4 text-brand-crimson" />
                      {uploading ? 'UPLOADING...' : 'UPLOAD SCREENSHOT'}
                    </label>
                  </div>
                </div>

                {/* 2. Demo Video Overview */}
                <div className="flex flex-col gap-3 bg-black/40 border border-border-subtle p-4 rounded-xl">
                  <span className="text-xs font-bold text-white uppercase flex items-center gap-2">
                    <span>DEMO VIDEO OVERVIEW</span>
                  </span>

                  {(editingItem.videoUrl || editingItem.video_url) && (
                    <div className="w-full h-36 rounded-lg border border-border-subtle overflow-hidden relative bg-black">
                      <video src={editingItem.videoUrl || editingItem.video_url} controls className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-mono text-text-secondary uppercase">VIDEO DEMO URL LINK</label>
                    <input
                      type="text"
                      value={editingItem.videoUrl || editingItem.video_url || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, videoUrl: e.target.value, video_url: e.target.value })}
                      placeholder="https://... MP4/WEBM or upload below"
                      className="bg-black border border-border-subtle focus:border-brand-crimson text-white rounded px-3 py-2 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="file"
                      id="proj-video-upload"
                      onChange={(e) => handleFileUpload(e, 'videoUrl')}
                      className="hidden"
                      accept="video/*,.mp4,.webm,.mov"
                    />
                    <label
                      htmlFor="proj-video-upload"
                      className="w-full inline-flex items-center justify-center gap-2 bg-white/5 border border-border-subtle hover:border-brand-crimson px-4 py-2.5 rounded text-xs font-semibold text-white cursor-pointer transition-colors"
                    >
                      <Upload className="size-4 text-brand-crimson" />
                      {uploading ? 'UPLOADING...' : 'UPLOAD VIDEO DEMO (MP4/WEBM)'}
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">

                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={Boolean(editingItem.featured)}
                    onChange={(e) => setEditingItem({ ...editingItem, featured: e.target.checked })}
                    className="size-4 text-brand-crimson rounded"
                  />
                  <span>FEATURED BUILD</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={editingItem.published !== false}
                    onChange={(e) => setEditingItem({ ...editingItem, published: e.target.checked })}
                    className="size-4 text-brand-crimson rounded"
                  />
                  <span>PUBLISHED</span>
                </label>
              </div>
            </div>
          )}

          {/* SKILLS FORMS */}
          {panel === 'skills' && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-text-secondary">SKILL NAME</label>
                  <input
                    type="text"
                    required
                    value={editingItem.name}
                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                    className="bg-black border border-border-subtle focus:border-brand-crimson text-white rounded px-4 py-3 text-sm focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-text-secondary">CATEGORY</label>
                  <select
                    value={editingItem.category}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                    className="bg-black border border-border-subtle focus:border-brand-crimson text-white rounded px-4 py-3 text-sm focus:outline-none cursor-pointer"
                  >
                    <option value="frontend">Frontend</option>
                    <option value="backend">Backend</option>
                    <option value="database">Database</option>
                    <option value="devops">DevOps / Cloud</option>
                    <option value="languages">Languages</option>
                    <option value="ai">AI / Machine Learning</option>
                    <option value="tools">Tools & Frameworks</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-text-secondary">PROFICIENCY LEVEL (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={editingItem.level}
                    onChange={(e) => setEditingItem({ ...editingItem, level: parseInt(e.target.value, 10) || 80 })}
                    className="bg-black border border-border-subtle focus:border-brand-crimson text-white rounded px-4 py-3 text-sm focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="skill-published"
                    checked={editingItem.published !== false}
                    onChange={(e) => setEditingItem({ ...editingItem, published: e.target.checked })}
                    className="size-4 text-brand-crimson rounded cursor-pointer"
                  />
                  <label htmlFor="skill-published" className="text-xs font-medium text-text-secondary cursor-pointer">
                    PUBLISHED ON SKILLS CLOUD
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TIMELINE / JOURNEY FORMS */}
          {panel === 'timeline' && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-text-secondary uppercase">ENTRY TYPE</label>
                  <select
                    value={editingItem.type || 'experience'}
                    onChange={(e) => setEditingItem({ ...editingItem, type: e.target.value })}
                    className="bg-black border border-border-subtle focus:border-brand-crimson text-white rounded px-4 py-3 text-sm focus:outline-none cursor-pointer"
                  >
                    <option value="experience">Work Experience</option>
                    <option value="education">Education / Degree</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-text-secondary uppercase">
                    {editingItem.type === 'education' ? 'DEGREE / PROGRAM' : 'JOB ROLE / TITLE'} <span className="text-brand-crimson">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingItem.type === 'education' ? (editingItem.degree || '') : (editingItem.role || '')}
                    onChange={(e) => setEditingItem({
                      ...editingItem,
                      ...(editingItem.type === 'education' ? { degree: e.target.value } : { role: e.target.value })
                    })}
                    placeholder={editingItem.type === 'education' ? 'e.g. B.Tech in Electronics & Computer Engineering' : 'e.g. Full Stack Developer Intern'}
                    className="bg-black border border-border-subtle focus:border-brand-crimson text-white rounded px-4 py-3 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-text-secondary uppercase">
                    {editingItem.type === 'education' ? 'INSTITUTION / UNIVERSITY' : 'COMPANY / ORGANIZATION'} <span className="text-brand-crimson">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingItem.type === 'education' ? (editingItem.institution || '') : (editingItem.company || '')}
                    onChange={(e) => setEditingItem({
                      ...editingItem,
                      ...(editingItem.type === 'education' ? { institution: e.target.value } : { company: e.target.value })
                    })}
                    placeholder={editingItem.type === 'education' ? 'e.g. MIT-ADT University' : 'e.g. Tecoritham Tech'}
                    className="bg-black border border-border-subtle focus:border-brand-crimson text-white rounded px-4 py-3 text-sm focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-text-secondary uppercase">START DATE</label>
                  <input
                    type="text"
                    value={editingItem.startDate || editingItem.start_date || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, startDate: e.target.value, start_date: e.target.value })}
                    placeholder="e.g. Oct 2024 or 2022"
                    className="bg-black border border-border-subtle focus:border-brand-crimson text-white rounded px-4 py-3 text-sm focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-text-secondary uppercase">END DATE</label>
                  <input
                    type="text"
                    value={editingItem.endDate || editingItem.end_date || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, endDate: e.target.value, end_date: e.target.value })}
                    placeholder="e.g. Present or Jan 2025"
                    className="bg-black border border-border-subtle focus:border-brand-crimson text-white rounded px-4 py-3 text-sm focus:outline-none"
                  />
                </div>
              </div>

              {editingItem.type !== 'education' && (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-text-secondary uppercase">TECH STACK TAGS (comma separated)</label>
                  <input
                    type="text"
                    value={typeof editingItem.techTags === 'string' ? editingItem.techTags : (Array.isArray(editingItem.techTags) ? editingItem.techTags.join(', ') : '')}
                    onChange={(e) => setEditingItem({ ...editingItem, techTags: e.target.value, tech_tags: e.target.value })}
                    placeholder="React, Node.js, TypeScript, Supabase"
                    className="bg-black border border-border-subtle focus:border-brand-crimson text-white rounded px-4 py-3 text-sm focus:outline-none"
                  />
                </div>
              )}

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-text-secondary uppercase">
                  {editingItem.type === 'education' ? 'KEY FOCUS / ACHIEVEMENTS (one per line)' : 'RESPONSIBILITIES & HIGHLIGHTS (one per line)'}
                </label>
                <textarea
                  value={
                    typeof editingItem.responsibilities === 'string'
                      ? editingItem.responsibilities
                      : (Array.isArray(editingItem.responsibilities) ? editingItem.responsibilities.join('\n') : (typeof editingItem.milestones === 'string' ? editingItem.milestones : (Array.isArray(editingItem.milestones) ? editingItem.milestones.join('\n') : '')))
                  }
                  onChange={(e) => setEditingItem({
                    ...editingItem,
                    ...(editingItem.type === 'education' ? { milestones: e.target.value } : { responsibilities: e.target.value })
                  })}
                  rows={4}
                  placeholder="Engineered high-performance REST APIs&#10;Architected scalable React frontend microservices"
                  className="bg-black border border-border-subtle focus:border-brand-crimson text-white rounded px-4 py-3 text-sm focus:outline-none resize-none font-mono"
                />
              </div>
            </div>
          )}

          {/* CERTIFICATIONS FORMS */}
          {panel === 'certifications' && (

            <div className="flex flex-col gap-5">
              {/* Row 1: Title & Issuer */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-text-secondary uppercase">
                    CERTIFICATE TITLE <span className="text-brand-crimson">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingItem.title || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                    placeholder="e.g. Generative AI & Prompt Engineering Professional"
                    className="bg-black border border-border-subtle focus:border-brand-crimson text-white rounded px-4 py-3 text-sm focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-text-secondary uppercase">
                    ISSUING ORGANIZATION / COMPANY <span className="text-brand-crimson">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingItem.issuer || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, issuer: e.target.value })}
                    placeholder="e.g. DeepLearning.AI, Coursera, Meta, AWS"
                    className="bg-black border border-border-subtle focus:border-brand-crimson text-white rounded px-4 py-3 text-sm focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 2: Credential ID, Verification URL, Date */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-text-secondary uppercase">
                    CREDENTIAL ID
                  </label>
                  <input
                    type="text"
                    value={editingItem.credentialId || editingItem.credential_id || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, credentialId: e.target.value, credential_id: e.target.value })}
                    placeholder="e.g. CERT-98421-X9"
                    className="bg-black border border-border-subtle focus:border-brand-crimson text-white rounded px-4 py-3 text-sm focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-text-secondary uppercase">
                    CREDENTIAL VERIFICATION URL
                  </label>
                  <input
                    type="url"
                    value={editingItem.verificationUrl || editingItem.verification_url || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, verificationUrl: e.target.value, verification_url: e.target.value })}
                    placeholder="https://coursera.org/verify/..."
                    className="bg-black border border-border-subtle focus:border-brand-crimson text-white rounded px-4 py-3 text-sm focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-text-secondary uppercase">
                    ISSUE DATE
                  </label>
                  <input
                    type="text"
                    value={editingItem.date || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, date: e.target.value })}
                    placeholder="e.g. Oct 2025 or 2025"
                    className="bg-black border border-border-subtle focus:border-brand-crimson text-white rounded px-4 py-3 text-sm focus:outline-none"
                  />
                </div>
              </div>

              {/* LINKEDIN-STYLE SEARCHABLE SKILLS TAG INPUT */}
              <div className="flex flex-col gap-2 bg-black/40 border border-border-subtle p-4 rounded-xl relative">
                <label className="text-xs font-bold text-white uppercase flex items-center justify-between">
                  <span className="flex items-center">
                    <Search className="size-3.5 text-brand-crimson mr-1.5 inline" />
                    ASSOCIATED SKILLS (LINKEDIN-STYLE TAGS)
                  </span>
                  <span className="text-[10px] font-mono text-text-muted font-normal">Type to search or add custom skill</span>
                </label>


                {/* Selected Skill Tag Chips */}
                <div className="flex flex-wrap gap-2 min-h-[42px] p-2 bg-black border border-border-subtle rounded-lg items-center">
                  {(Array.isArray(editingItem.skills) ? editingItem.skills : []).map((skill: string, index: number) => (
                    <span
                      key={`${skill}-${index}`}
                      className="inline-flex items-center gap-1.5 bg-brand-crimson-subtle/30 text-white border border-brand-crimson/50 text-xs px-3 py-1 rounded-full font-medium shadow-[0_0_10px_rgba(255,0,27,0.15)]"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = (editingItem.skills || []).filter((_: any, i: number) => i !== index);
                          setEditingItem({ ...editingItem, skills: updated });
                        }}
                        className="text-text-muted hover:text-white transition-colors cursor-pointer"
                      >
                        <X className="size-3" />
                      </button>
                    </span>
                  ))}

                  {/* Search Input field */}
                  <div className="relative flex-1 min-w-[200px]">
                    <input
                      type="text"
                      value={skillSearchQuery}
                      onChange={(e) => {
                        setSkillSearchQuery(e.target.value);
                        setShowSkillSuggestions(true);
                      }}
                      onFocus={() => setShowSkillSuggestions(true)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && skillSearchQuery.trim()) {
                          e.preventDefault();
                          addSkillTag(skillSearchQuery.trim());
                        }
                      }}
                      placeholder="Search skill (e.g. Prompt Engineering)..."
                      className="w-full bg-transparent text-white text-xs py-1 px-2 focus:outline-none placeholder-text-muted"
                    />

                    {/* Suggestions Dropdown */}
                    {showSkillSuggestions && skillSearchQuery.trim() && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-surface-card border border-border-subtle rounded-xl shadow-2xl z-50 max-h-48 overflow-y-auto divide-y divide-border-subtle/40">
                        {DEFAULT_SKILLS
                          .filter((s) => s.toLowerCase().includes(skillSearchQuery.toLowerCase().trim()))
                          .filter((s) => !(editingItem.skills || []).includes(s))
                          .slice(0, 8)
                          .map((suggestion) => (
                            <button
                              key={suggestion}
                              type="button"
                              onClick={() => addSkillTag(suggestion)}
                              className="w-full text-left px-4 py-2.5 text-xs text-white hover:bg-brand-crimson/20 hover:text-brand-crimson transition-colors flex items-center justify-between cursor-pointer"
                            >
                              <span>{suggestion}</span>
                              <Plus className="size-3 text-brand-crimson" />
                            </button>
                          ))}

                        {!DEFAULT_SKILLS.some((s) => s.toLowerCase() === skillSearchQuery.toLowerCase().trim()) && (
                          <button
                            type="button"
                            onClick={() => addSkillTag(skillSearchQuery.trim())}
                            className="w-full text-left px-4 py-2.5 text-xs text-brand-crimson hover:bg-brand-crimson/20 transition-colors flex items-center gap-1.5 cursor-pointer font-semibold"
                          >
                            <Plus className="size-3" /> Add custom skill "{skillSearchQuery.trim()}"
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* CERTIFICATE MEDIA (PDF DOCUMENT OR IMAGE/SCREENSHOT) */}
              <div className="flex flex-col gap-3 bg-black/40 border border-border-subtle p-4 rounded-xl">
                <span className="text-xs font-bold text-white uppercase flex items-center gap-2">
                  <span>CERTIFICATE MEDIA (PDF DOCUMENT OR IMAGE/SCREENSHOT)</span>
                </span>

                {/* Live Preview */}
                {editingItem.thumbnail && (() => {
                  const mediaUrl = getMediaUrl(editingItem.thumbnail);
                  const isPdf = mediaUrl.toLowerCase().includes('.pdf');

                  return (
                    <div className="w-full rounded-lg border border-border-subtle overflow-hidden bg-black p-3 flex flex-col items-center justify-center relative">
                      {isPdf ? (
                        <div className="flex items-center gap-3 text-xs text-white p-3 bg-white/5 border border-border-subtle rounded-lg w-full">
                          <FileText className="size-6 text-brand-crimson shrink-0" />
                          <div className="overflow-hidden flex-1">
                            <span className="font-semibold block truncate">PDF Certificate Document Attached</span>
                            <a href={mediaUrl} target="_blank" rel="noreferrer" className="text-[10px] font-mono text-brand-crimson hover:underline truncate block">
                              {mediaUrl}
                            </a>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-40 overflow-hidden rounded relative">
                          <img src={mediaUrl} alt="Certificate Preview" className="w-full h-full object-contain" />
                        </div>
                      )}
                    </div>
                  );
                })()}


                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-mono text-text-secondary uppercase">MEDIA URL LINK (IMAGE OR PDF)</label>
                  <input
                    type="text"
                    value={editingItem.thumbnail || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, thumbnail: e.target.value })}
                    placeholder="https://... or upload below"
                    className="bg-black border border-border-subtle focus:border-brand-crimson text-white rounded px-3 py-2 text-xs focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="file"
                    id="cert-media-upload"
                    onChange={(e) => handleFileUpload(e, 'thumbnail')}
                    className="hidden"
                    accept="image/*,.pdf"
                  />
                  <label
                    htmlFor="cert-media-upload"
                    className="w-full inline-flex items-center justify-center gap-2 bg-white/5 border border-border-subtle hover:border-brand-crimson px-4 py-2.5 rounded text-xs font-semibold text-white cursor-pointer transition-colors"
                  >
                    <Upload className="size-4 text-brand-crimson" />
                    {uploading ? 'UPLOADING...' : 'UPLOAD CERTIFICATE (IMAGE OR PDF)'}
                  </label>
                </div>
              </div>

              {/* Published Checkbox */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="cert-published"
                  checked={editingItem.published !== false}
                  onChange={(e) => setEditingItem({ ...editingItem, published: e.target.checked })}
                  className="size-4 text-brand-crimson rounded cursor-pointer"
                />
                <label htmlFor="cert-published" className="text-xs font-medium text-text-secondary cursor-pointer">
                  PUBLISHED ON PUBLIC PORTFOLIO
                </label>
              </div>
            </div>
          )}


          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-subtle">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditingItem(null)}
              className="border-border-subtle hover:bg-white/5 text-xs py-3.5 px-6 cursor-pointer"
            >
              CANCEL
            </Button>
            <Button
              type="submit"
              className="bg-brand-crimson text-white hover:bg-brand-crimson-dim uppercase font-semibold text-xs py-3.5 px-8 shadow-[0_0_15px_rgba(255,0,27,0.2)] cursor-pointer"
            >
              SAVE ITEM
            </Button>
          </div>
        </form>
      )}

      {/* LIST VIEWS */}
      {!editingItem && !isAdding && (
        <div className="bg-surface-card border border-border-subtle rounded-xl overflow-hidden">
          {/* MESSAGES VIEW */}
          {panel === 'messages' && (
            <div className="flex flex-col divide-y divide-border-subtle">
              {data.map((msg) => (
                <div
                  key={msg.id || msg._id}
                  className={`flex flex-col gap-0 transition-colors ${
                    !msg.read ? 'bg-brand-crimson-subtle/5 border-l-2 border-l-brand-crimson' : ''
                  }`}
                >
                  {/* ── Message Header ── */}
                  <div className="px-6 pt-5 pb-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-semibold text-white text-sm">{msg.name}</span>
                        <a href={`mailto:${msg.email}`} className="text-xs font-mono text-brand-crimson hover:underline">
                          {msg.email}
                        </a>
                        {msg.profession && (
                          <span className="text-[10px] font-mono text-text-muted bg-white/5 px-2 py-0.5 rounded border border-border-subtle">
                            {msg.profession}
                          </span>
                        )}
                        {!msg.read && (
                          <span className="inline-flex items-center text-[9px] font-mono font-bold bg-brand-crimson text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                            NEW
                          </span>
                        )}
                        {msg.replied && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            <MailCheck className="size-2.5" />
                            REPLIED
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-text-muted">
                        {new Date(msg.created_at || msg.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Subject */}
                    <div className="text-xs font-mono font-bold text-white/90 uppercase tracking-wide border-l-2 border-brand-crimson/40 pl-3">
                      {msg.subject}
                    </div>

                    {/* Original message bubble (client → admin) */}
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-white/10 border border-border-subtle flex items-center justify-center text-xs font-bold text-text-secondary mt-0.5">
                        {(msg.name || '?')[0].toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-text-secondary leading-relaxed font-body whitespace-pre-wrap bg-black/30 rounded-xl rounded-tl-none px-4 py-3 border border-border-subtle">
                          {msg.message}
                        </p>
                      </div>
                    </div>

                    {/* ── Conversation Thread (past replies) ── */}
                    {Array.isArray(msg.replies) && msg.replies.length > 0 && (
                      <div className="flex flex-col gap-3 mt-1">
                        {msg.replies.map((reply: any, i: number) => (
                          <div key={i} className="flex gap-3 justify-end">
                            <div className="flex-1 flex flex-col items-end gap-1">
                              <p className="text-xs text-white leading-relaxed font-body whitespace-pre-wrap bg-brand-crimson/10 border border-brand-crimson/20 rounded-xl rounded-tr-none px-4 py-3 max-w-[90%]">
                                {reply.text}
                              </p>
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] font-mono text-text-muted">
                                  {new Date(reply.sentAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </span>
                                {reply.emailSent ? (
                                  <span className="inline-flex items-center gap-1 text-[9px] font-mono text-green-400">
                                    <MailCheck className="size-2.5" /> EMAIL SENT
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[9px] font-mono text-yellow-500" title={reply.emailError || 'SMTP not configured'}>
                                    <AlertTriangle className="size-2.5" /> INBOX ONLY
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-brand-crimson/20 border border-brand-crimson/40 flex items-center justify-center text-xs font-bold text-brand-crimson mt-0.5">
                              MR
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* ── Reply Composer ── */}
                    {replyingMsgId === (msg.id || msg._id) && (
                      <div className="flex flex-col gap-3 mt-2 bg-black/50 border border-brand-crimson/20 rounded-xl p-4 shadow-[0_0_20px_rgba(255,0,27,0.05)]">
                        <label className="text-[10px] font-mono text-brand-crimson uppercase flex items-center gap-1.5 font-semibold">
                          <Reply className="size-3" />
                          COMPOSING REPLY TO: {msg.email}
                        </label>
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          rows={5}
                          placeholder={`Hi ${msg.name},\n\nThank you for reaching out!\n\nBest regards,\nMohammad Raees`}
                          className="w-full bg-black border border-border-subtle focus:border-brand-crimson text-white rounded-lg px-4 py-3 text-xs focus:outline-none resize-none font-body leading-relaxed"
                          autoFocus
                        />
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <p className="text-[10px] font-mono text-text-muted">
                            Sends a real email to <strong className="text-white">{msg.email}</strong> via Gmail SMTP.
                          </p>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => { setReplyingMsgId(null); setReplyText(''); }}
                              className="text-xs text-text-muted hover:text-white px-4 py-2 rounded border border-border-subtle hover:bg-white/5 transition-colors cursor-pointer"
                            >
                              CANCEL
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSendReply(msg)}
                              disabled={loading}
                              className="text-xs font-semibold bg-brand-crimson hover:bg-brand-crimson-dim disabled:opacity-50 text-white px-5 py-2 rounded-lg flex items-center gap-2 transition-colors cursor-pointer shadow-[0_0_15px_rgba(255,0,27,0.25)]"
                            >
                              <Send className="size-3.5" />
                              {loading ? 'SENDING...' : 'SEND REPLY'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ── Action Bar ── */}
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          if (replyingMsgId === (msg.id || msg._id)) {
                            setReplyingMsgId(null);
                            setReplyText('');
                          } else {
                            setReplyingMsgId(msg.id || msg._id);
                            setReplyText('');
                          }
                        }}
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold border px-3 py-1.5 rounded transition-colors cursor-pointer ${
                          replyingMsgId === (msg.id || msg._id)
                            ? 'border-brand-crimson bg-brand-crimson/10 text-brand-crimson'
                            : 'border-border-subtle hover:border-brand-crimson hover:bg-brand-crimson/5 text-text-secondary hover:text-white'
                        }`}
                      >
                        <Reply className="size-3.5" />
                        {replyingMsgId === (msg.id || msg._id) ? 'COMPOSING...' : 'REPLY'}
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleMessageRead(msg.id || msg._id, msg.read)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold border border-border-subtle hover:bg-white/5 text-text-secondary hover:text-white px-3 py-1.5 rounded transition-colors cursor-pointer"
                      >
                        {msg.read ? 'MARK UNREAD' : 'MARK READ'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(msg.id || msg._id)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold border border-border-subtle hover:border-red-500 hover:bg-red-500/10 text-red-400 px-3 py-1.5 rounded transition-colors cursor-pointer"
                      >
                        <Trash2 className="size-3.5" />
                        DELETE
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {data.length === 0 && (
                <div className="py-16 text-center flex flex-col items-center gap-3 text-text-muted">
                  <Mail className="size-8 opacity-30" />
                  <p className="text-xs">Your inbox is empty. Messages from the contact form appear here.</p>
                </div>
              )}
            </div>
          )}

          {/* SOCIAL LINKS VIEW */}
          {panel === 'socials' && (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.map((social) => (
                <div
                  key={social.id || social._id}
                  className="bg-black/60 border border-border-subtle p-4 rounded-xl flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="p-2 bg-white/5 rounded-lg border border-border-subtle text-brand-crimson shrink-0">
                      <Share2 className="size-4" />
                    </div>
                    <div className="overflow-hidden">
                      <h3 className="text-xs font-bold text-white uppercase truncate">{social.platform}</h3>
                      <a href={social.url} target="_blank" rel="noreferrer" className="text-[10px] font-mono text-text-secondary hover:text-brand-crimson truncate block">
                        {social.username || social.url}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      onClick={() => setEditingItem(social)}
                      size="sm"
                      variant="outline"
                      className="border-border-subtle hover:border-brand-crimson hover:bg-brand-crimson-subtle text-xs py-2 px-2.5 cursor-pointer"
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      onClick={() => handleDeleteItem(social.id || social._id)}
                      size="sm"
                      variant="outline"
                      className="border-border-subtle hover:border-red-500 hover:bg-red-500/10 text-xs py-2 px-2.5 cursor-pointer"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              ))}

              {data.length === 0 && (
                <div className="col-span-full py-12 text-center text-text-muted text-xs">No social links added yet.</div>
              )}
            </div>
          )}

          {/* PROJECTS VIEW */}
          {panel === 'projects' && (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.map((proj) => (
                <div key={proj.id || proj._id} className="bg-black/60 border border-border-subtle p-5 rounded-xl flex flex-col justify-between gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-bold text-white uppercase">{proj.title}</h3>
                      {proj.featured && <Badge className="bg-brand-crimson text-white text-[8px]">FEATURED</Badge>}
                    </div>
                    <p className="text-xs text-text-secondary line-clamp-2">{proj.description}</p>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-subtle">
                    <Button
                      onClick={() => setEditingItem(proj)}
                      size="sm"
                      variant="outline"
                      className="border-border-subtle hover:border-brand-crimson text-xs py-2 px-3 cursor-pointer"
                    >
                      <Pencil className="size-3.5" /> EDIT
                    </Button>
                    <Button
                      onClick={() => handleDeleteItem(proj.id || proj._id)}
                      size="sm"
                      variant="outline"
                      className="border-border-subtle hover:border-red-500 text-xs py-2 px-3 cursor-pointer text-red-400"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              ))}

              {data.length === 0 && (
                <div className="col-span-full py-12 text-center text-text-muted text-xs">No projects found.</div>
              )}
            </div>
          )}

          {/* SKILLS VIEW */}
          {panel === 'skills' && (
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {data.map((skill) => (
                <div key={skill.id || skill._id} className="bg-black/60 border border-border-subtle p-4 rounded-xl flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xs font-semibold text-white uppercase">{skill.name}</h3>
                    <div className="text-[10px] font-mono text-text-muted mt-0.5">{skill.category} • {skill.level}%</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      onClick={() => setEditingItem(skill)}
                      size="sm"
                      variant="outline"
                      className="border-border-subtle hover:border-brand-crimson text-xs py-2 px-2.5 cursor-pointer"
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      onClick={() => handleDeleteItem(skill.id || skill._id)}
                      size="sm"
                      variant="outline"
                      className="border-border-subtle hover:border-red-500 text-xs py-2 px-2.5 cursor-pointer"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              ))}

              {data.length === 0 && (
                <div className="col-span-full py-12 text-center text-text-muted text-xs">No skills found.</div>
              )}
            </div>
          )}

          {/* TIMELINE VIEW */}
          {panel === 'timeline' && (
            <div className="p-6 flex flex-col gap-6">
              {data.map((item) => (
                <div key={item.id || item._id} className="flex items-center justify-between border-b border-border-subtle pb-4 last:border-none last:pb-0">
                  <div>
                    <h3 className="text-sm font-semibold text-white uppercase">
                      {item.type === 'experience' ? item.role : item.degree}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-text-secondary mt-1 flex-wrap">
                      <span>{item.type === 'experience' ? item.company : item.institution}</span>
                      <span>•</span>
                      <span className="font-mono text-[10px]">{item.startDate || item.start_date} - {item.endDate || item.end_date || 'Present'}</span>
                      <span>•</span>
                      <Badge className="text-[9px] font-mono bg-white/5 border-border-subtle uppercase px-2 py-0.5">{item.type}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => setEditingItem({
                        ...item,
                        techTags: Array.isArray(item.techTags) ? item.techTags.join(', ') : item.techTags,
                        responsibilities: Array.isArray(item.responsibilities) ? item.responsibilities.join('\n') : item.responsibilities,
                        milestones: Array.isArray(item.milestones) ? item.milestones.join('\n') : item.milestones
                      })}
                      size="sm"
                      variant="outline"
                      className="border-border-subtle hover:border-brand-crimson text-xs py-2 px-3 cursor-pointer"
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      onClick={() => handleDeleteItem(item.id || item._id, item.type)}
                      size="sm"
                      variant="outline"
                      className="border-border-subtle hover:border-red-500 text-xs py-2 px-3 cursor-pointer text-red-400"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              ))}

              {data.length === 0 && (
                <div className="py-12 text-center text-text-muted text-xs">No timeline items found.</div>
              )}
            </div>
          )}

          {/* CERTIFICATIONS VIEW */}
          {panel === 'certifications' && (
            <div className="p-6 flex flex-col gap-4">
              {data.map((cert) => (
                <div key={cert.id || cert._id} className="flex items-center justify-between border-b border-border-subtle pb-4 last:border-none last:pb-0">
                  <div>
                    <h3 className="text-sm font-semibold text-white uppercase">{cert.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-text-secondary mt-1 font-mono">
                      <span>{cert.issuer}</span>
                      <span>•</span>
                      <span>{cert.date}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => {
                        setIsAdding(false);
                        setEditingItem({
                          ...cert,
                          title: cert.title || '',
                          issuer: cert.issuer || '',
                          credentialId: cert.credentialId || cert.credential_id || '',
                          verificationUrl: cert.verificationUrl || cert.verification_url || '',
                          date: cert.date || '',
                          thumbnail: cert.thumbnail || '',
                          skills: Array.isArray(cert.skills) ? cert.skills : (typeof cert.skills === 'string' ? cert.skills.split(',').map((s: string) => s.trim()).filter(Boolean) : []),
                          published: cert.published !== false,
                        });
                      }}
                      size="sm"
                      variant="outline"
                      className="border-border-subtle hover:border-brand-crimson text-xs py-2 px-3 cursor-pointer"
                    >
                      <Pencil className="size-3.5 text-brand-crimson" /> EDIT
                    </Button>

                    <Button
                      onClick={() => handleDeleteItem(cert.id || cert._id)}
                      size="sm"
                      variant="outline"
                      className="border-border-subtle hover:border-red-500 text-xs py-2 px-3 cursor-pointer text-red-400"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              ))}

              {data.length === 0 && (
                <div className="py-12 text-center text-text-muted text-xs">No certifications found.</div>
              )}
            </div>
          )}

        </div>
      )}
    </div>
  );
}
