import { useEffect, useState } from 'react';
import { useNavigate, Routes, Route, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  Sliders,
  FolderOpen,
  Calendar,
  Award,
  Mail,
  LogOut,
  ChevronRight,
  ExternalLink,
  Globe,
  Share2,
} from 'lucide-react';

import ContentPanels from './ContentPanels';
import { apiFetch } from '@/lib/api';
import { supabase } from '@/lib/supabase';

export default function DashboardShell() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    projects: 0,
    skills: 0,
    messages: 0,
    unreadMessages: 0,
  });

  const navigate = useNavigate();

  useEffect(() => {
    // 1. Verify Authentication Status
    apiFetch('auth/status')
      .then((res) => res.json())
      .then((data) => {
        if (data.isAuthenticated) {
          setUser(data);
          // 2. Fetch statistics
          fetchStats();
        } else {
          navigate('/admin/login');
        }
        setLoading(false);
      })
      .catch(() => {
        navigate('/admin/login');
        setLoading(false);
      });
  }, [navigate]);

  const fetchStats = async () => {
    try {
      const [projRes, skillRes, msgRes] = await Promise.all([
        apiFetch('projects'),
        apiFetch('skills'),
        apiFetch('admin/messages'),
      ]);

      const projects = await projRes.json();
      const skills = await skillRes.json();
      const messages = await msgRes.json();

      setStats({
        projects: Array.isArray(projects) ? projects.length : 0,
        skills: Array.isArray(skills) ? skills.length : 0,
        messages: Array.isArray(messages) ? messages.length : 0,
        unreadMessages: Array.isArray(messages) ? messages.filter((m: any) => !m.read).length : 0,
      });
    } catch (err) {
      console.error('Error fetching dashboard statistics:', err);
    }
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem('admin_token');
      await supabase.auth.signOut();
      await apiFetch('auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      navigate('/admin/login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center font-display uppercase tracking-widest text-xs animate-pulse">
        Loading admin workspace...
      </div>
    );
  }

  const sidebarLinks = [
    { name: 'Overview', path: '', icon: LayoutDashboard },
    { name: 'Profile & Resume', path: 'profile', icon: User },
    { name: 'Social Media Links', path: 'socials', icon: Share2 },
    { name: 'Skills & Tech', path: 'skills', icon: Sliders },
    { name: 'Projects', path: 'projects', icon: FolderOpen },
    { name: 'Timeline / Journey', path: 'timeline', icon: Calendar },
    { name: 'Certifications', path: 'certifications', icon: Award },
    { name: 'Message Inbox', path: 'messages', icon: Mail, badge: stats.unreadMessages },
  ];


  return (
    <div className="min-h-screen bg-black text-white flex flex-col md:flex-row relative">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 shrink-0 bg-surface-card border-r border-border-subtle flex flex-col justify-between py-6">
        <div className="flex flex-col gap-8">
          {/* Logo Header - Navigates to Public Homepage */}
          <Link
            to="/"
            className="px-6 border-b border-border-subtle pb-4 flex items-center justify-between group hover:opacity-90 transition-all select-none"
            title="Click to view Public Portfolio Homepage"
          >
            <div>
              <div className="font-display font-black text-base tracking-widest text-white group-hover:text-brand-crimson transition-colors flex items-center gap-1.5">
                <span>TECORITHAM</span>
                <ExternalLink className="size-3 text-text-muted group-hover:text-brand-crimson transition-colors" />
              </div>
              <span className="text-[10px] text-brand-crimson font-bold block uppercase tracking-wider">
                ADMIN PANEL &rarr; HOMEPAGE
              </span>
            </div>
          </Link>

          {/* Nav links */}
          <nav className="flex flex-col gap-1 px-3">
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className="flex items-center justify-between p-3.5 rounded text-xs font-semibold text-text-secondary hover:text-white hover:bg-white/5 transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="size-4 text-brand-crimson" />
                    <span className="uppercase tracking-wider">{link.name}</span>
                  </div>
                  {link.badge && link.badge > 0 ? (
                    <span className="bg-brand-crimson text-white px-2 py-0.5 rounded-full text-[9px] font-mono">
                      {link.badge}
                    </span>
                  ) : (
                    <ChevronRight className="size-3.5 text-text-muted" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="px-3 flex flex-col gap-2 pt-6 border-t border-border-subtle">
          <Link
            to="/"
            className="w-full flex items-center gap-2.5 p-3 rounded-lg bg-white/5 border border-border-subtle text-xs font-mono text-text-secondary hover:text-white hover:border-brand-crimson/50 transition-all"
          >
            <Globe className="size-3.5 text-brand-crimson" />
            <span className="uppercase tracking-wider">VIEW PUBLIC WEBSITE</span>
          </Link>

          <div className="px-3 text-[10px] font-mono text-text-muted select-none mt-2">
            SIGNED IN AS:<br />
            <span className="text-white truncate block">{user?.email}</span>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3.5 rounded text-xs font-semibold text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer mt-1"
          >
            <LogOut className="size-4" />
            <span className="uppercase tracking-wider">LOG OUT</span>
          </button>
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full overflow-y-auto">
        <Routes>
          <Route
            path=""
            element={
              <div className="flex flex-col gap-10 select-none">
                <div className="flex items-center justify-between flex-wrap gap-4 border-b border-border-subtle pb-6">
                  <div>
                    <h1 className="font-display font-black text-2xl md:text-3xl text-white uppercase tracking-tight mb-2">
                      WORKSPACE OVERVIEW
                    </h1>
                    <p className="text-xs text-text-secondary">
                      Welcome to your private CMS workspace dashboard.
                    </p>
                  </div>
                  <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-xs font-bold text-brand-crimson hover:text-white border border-brand-crimson/40 hover:border-brand-crimson px-4 py-2 rounded-full transition-all duration-300 bg-brand-crimson-subtle/20"
                  >
                    <Globe className="size-3.5" />
                    LIVE PORTFOLIO SITE
                  </Link>
                </div>

                {/* Stat Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  <Link to="projects" className="bg-surface-card border border-border-subtle hover:border-brand-crimson/40 p-6 rounded-xl transition-all group">
                    <div className="text-[10px] text-text-secondary uppercase mb-2 group-hover:text-brand-crimson">Total Projects</div>
                    <div className="text-3xl font-display font-black text-white">{stats.projects}</div>
                  </Link>
                  <Link to="skills" className="bg-surface-card border border-border-subtle hover:border-brand-crimson/40 p-6 rounded-xl transition-all group">
                    <div className="text-[10px] text-text-secondary uppercase mb-2 group-hover:text-brand-crimson">Total Skills</div>
                    <div className="text-3xl font-display font-black text-white">{stats.skills}</div>
                  </Link>
                  <Link to="messages" className="bg-surface-card border border-border-subtle hover:border-brand-crimson/40 p-6 rounded-xl transition-all group">
                    <div className="text-[10px] text-text-secondary uppercase mb-2 group-hover:text-brand-crimson">Total Messages</div>
                    <div className="text-3xl font-display font-black text-white">{stats.messages}</div>
                  </Link>
                  <Link to="messages" className="bg-surface-card border border-brand-crimson/30 hover:border-brand-crimson p-6 rounded-xl shadow-[0_0_15px_rgba(255,0,27,0.04)] transition-all group">
                    <div className="text-[10px] text-brand-crimson uppercase mb-2">Unread Messages</div>
                    <div className="text-3xl font-display font-black text-brand-crimson">
                      {stats.unreadMessages}
                    </div>
                  </Link>
                </div>

                {/* Shortcuts */}
                <div className="bg-surface-card border border-border-subtle p-8 rounded-2xl flex flex-col gap-4">
                  <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider">
                    Quick CMS Action Shortcuts
                  </h3>
                  <div className="flex flex-wrap gap-4 text-xs font-mono">
                    <Link
                      to="profile"
                      className="bg-white/5 hover:bg-brand-crimson-subtle/20 border border-border-subtle hover:border-brand-crimson/50 px-4 py-2.5 rounded transition-all duration-200"
                    >
                      EDIT PROFILE BIO & RESUME
                    </Link>
                    <Link
                      to="projects"
                      className="bg-white/5 hover:bg-brand-crimson-subtle/20 border border-border-subtle hover:border-brand-crimson/50 px-4 py-2.5 rounded transition-all duration-200"
                    >
                      ADD / EDIT PROJECTS
                    </Link>
                    <Link
                      to="skills"
                      className="bg-white/5 hover:bg-brand-crimson-subtle/20 border border-border-subtle hover:border-brand-crimson/50 px-4 py-2.5 rounded transition-all duration-200"
                    >
                      MANAGE TECH SKILLS
                    </Link>
                    <Link
                      to="timeline"
                      className="bg-white/5 hover:bg-brand-crimson-subtle/20 border border-border-subtle hover:border-brand-crimson/50 px-4 py-2.5 rounded transition-all duration-200"
                    >
                      UPDATE JOURNEY TIMELINE
                    </Link>
                    <Link
                      to="messages"
                      className="bg-white/5 hover:bg-brand-crimson-subtle/20 border border-border-subtle hover:border-brand-crimson/50 px-4 py-2.5 rounded transition-all duration-200"
                    >
                      VIEW VISITOR MESSAGES
                    </Link>
                  </div>
                </div>
              </div>
            }
          />
          {/* Sub routes handle dynamically */}
          <Route path=":panel" element={<ContentPanels refreshStats={fetchStats} />} />
        </Routes>
      </main>
    </div>
  );
}
