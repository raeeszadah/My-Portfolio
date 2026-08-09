import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Menu,
  X,
  Shield,
  Github,
  Linkedin,

  Twitter,
  Mail,
  Youtube,
  Globe,
  MapPin,
  Code2,
  Instagram,
  MessageSquare,
  Facebook,
  BookOpen,
  Terminal,
  Cpu,
  Trophy,
  Share2,
} from 'lucide-react';

import { apiFetch } from '@/lib/api';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [socials, setSocials] = useState<any[]>([]);
  const [activeSection, setActiveSection] = useState('hero');
  const footerRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    apiFetch('profile')
      .then((res) => res.json())
      .then((data) => {
        if (data.profile) setProfile(data.profile);
        if (data.socials) setSocials(data.socials);
      })
      .catch((err) => console.error('Error fetching layout data:', err));
  }, []);

  // ── Active section tracker for navigation highlighting ─────────────────
  useEffect(() => {
    const SECTIONS = ['hero', 'about', 'skills', 'projects', 'contact'];
    const observers: IntersectionObserver[] = [];

    SECTIONS.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;

      const threshold = id === 'projects' ? 0.05 : 0.35;

      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(id);
            }
          });
        },
        { threshold }
      );

      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((obs) => obs.disconnect());
  }, []);

  // ── GSAP ScrollTrigger Footer Reveal Animation ─────────────────────────────
  useEffect(() => {
    if (!footerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        footerRef.current,
        {
          opacity: 0,
          y: 70,
          scale: 0.97,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: footerRef.current,
            start: 'top 95%',
            end: 'top 65%',
            scrub: 0.5,
            toggleActions: 'play reverse play reverse',
          },
        }
      );
    }, footerRef);

    return () => {
      ctx.revert();
    };
  }, []);

  const handleNavClick = (selector: string) => {
    setMenuOpen(false);
    const element = document.querySelector(selector);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navClass = (section: string) =>
    `transition-colors cursor-pointer ${
      activeSection === section
        ? 'text-brand-crimson font-bold'
        : 'hover:text-white text-text-secondary'
    }`;

  const renderSocialIcon = (platform: string) => {
    const p = platform.toLowerCase();
    if (p.includes('github')) return <Github className="size-4" />;
    if (p.includes('linkedin')) return <Linkedin className="size-4" />;
    if (p.includes('twitter') || p === 'x') return <Twitter className="size-4" />;
    if (p.includes('email') || p.includes('mail') || p.includes('gmail')) return <Mail className="size-4" />;
    if (p.includes('youtube')) return <Youtube className="size-4" />;
    if (p.includes('instagram')) return <Instagram className="size-4" />;
    if (p.includes('facebook')) return <Facebook className="size-4" />;
    if (p.includes('discord')) return <MessageSquare className="size-4" />;
    if (p.includes('medium')) return <BookOpen className="size-4" />;
    if (p.includes('reddit')) return <Share2 className="size-4" />;
    if (p.includes('leetcode') || p.includes('code')) return <Code2 className="size-4" />;
    if (p.includes('hackerrank')) return <Terminal className="size-4" />;
    if (p.includes('codechef')) return <Cpu className="size-4" />;
    if (p.includes('codeforces')) return <Trophy className="size-4" />;
    return <Globe className="size-4" />;
  };


  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-body relative">
      {/* Sticky Header */}
      <header className="sticky top-0 w-full h-20 bg-black/85 backdrop-blur-md border-b border-border-subtle z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <Link
            to="/"
            className="font-display font-black text-xl tracking-wider select-none hover:text-brand-crimson transition-colors flex items-center gap-2"
          >
            <span>TECORITHAM</span>
            <span className="text-xs font-mono text-brand-crimson/80 font-normal">| Mohammad Raees</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold tracking-wider">
            <button onClick={() => handleNavClick('#hero')} className={navClass('hero')}>
              HOME
            </button>
            <button onClick={() => handleNavClick('#about')} className={navClass('about')}>
              ABOUT
            </button>
            <button onClick={() => handleNavClick('#skills')} className={navClass('skills')}>
              SKILLS
            </button>
            <button onClick={() => handleNavClick('#contact')} className={navClass('contact')}>
              CONTACT
            </button>
          </nav>

          {/* Mobile Hamburg Trigger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-white hover:text-brand-crimson transition-colors cursor-pointer"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Full-Screen Menu Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 bg-black z-40 flex flex-col items-center justify-center gap-10">
          <nav className="flex flex-col items-center gap-8 text-2xl font-display font-bold tracking-wide">
            <button
              onClick={() => handleNavClick('#hero')}
              className={`transition-colors cursor-pointer ${ activeSection === 'hero' ? 'text-brand-crimson' : 'hover:text-brand-crimson' }`}
            >
              HOME
            </button>
            <button
              onClick={() => handleNavClick('#about')}
              className={`transition-colors cursor-pointer ${ activeSection === 'about' ? 'text-brand-crimson' : 'hover:text-brand-crimson' }`}
            >
              ABOUT
            </button>
            <button
              onClick={() => handleNavClick('#skills')}
              className={`transition-colors cursor-pointer ${ activeSection === 'skills' ? 'text-brand-crimson' : 'hover:text-brand-crimson' }`}
            >
              SKILLS
            </button>
            <button
              onClick={() => handleNavClick('#contact')}
              className={`transition-colors cursor-pointer ${ activeSection === 'contact' ? 'text-brand-crimson' : 'hover:text-brand-crimson' }`}
            >
              CONTACT
            </button>
          </nav>
        </div>
      )}


      {/* Main Page Content */}
      <div className="flex-1 w-full">{children}</div>

      {/* Premium Curved & Animated Footer */}
      <footer
        ref={footerRef}
        className="w-full rounded-t-[3rem] md:rounded-t-[4rem] border-t-2 border-brand-crimson/40 bg-surface-card/95 backdrop-blur-md text-xs text-text-secondary pt-16 pb-12 z-10 shadow-[0_-20px_50px_rgba(255,0,27,0.08)] mt-12 relative overflow-hidden"
      >
        {/* Subtle Ambient Crimson Glow Frame */}
        <div className="absolute inset-0 rounded-t-[3rem] md:rounded-t-[4rem] border-t border-brand-crimson/20 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 flex flex-col gap-12 relative z-10">
          {/* Top Footer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-border-subtle">
            {/* Column 1: Brand & Info */}
            <div className="md:col-span-2 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <div className="font-display font-black text-2xl tracking-widest text-white flex items-center gap-2">
                  <span>TECORITHAM</span>
                  <span className="text-sm font-mono text-brand-crimson font-normal">| Mohammad Raees</span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed max-w-md font-body">
                  Engineering high-performance web applications, scalable backend REST APIs, and responsive interactive design systems.
                </p>
              </div>

              {/* Dynamic Location / Address Badge */}
              <div className="flex items-center gap-2 text-xs font-mono text-white/90 bg-black/60 border border-border-subtle px-3.5 py-2 rounded-lg w-fit">
                <MapPin className="size-3.5 text-brand-crimson shrink-0" />
                <span>{profile?.location || 'Pune, Maharashtra, India / Remote Worldwide'}</span>
              </div>
            </div>

            {/* Column 2: Navigation Shortcuts */}
            <div className="flex flex-col gap-3">
              <span className="font-mono font-bold text-xs text-brand-crimson tracking-widest uppercase">
                NAVIGATION
              </span>
              <ul className="flex flex-col gap-2.5 text-xs font-medium">
                <li>
                  <button onClick={() => handleNavClick('#hero')} className="hover:text-brand-crimson transition-colors">
                    01. HOME
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavClick('#about')} className="hover:text-brand-crimson transition-colors">
                    02. ABOUT ME & JOURNEY
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavClick('#skills')} className="hover:text-brand-crimson transition-colors">
                    03. TECHNICAL SKILLS
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavClick('#projects')} className="hover:text-brand-crimson transition-colors">
                    04. FEATURED PROJECTS
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavClick('#contact')} className="hover:text-brand-crimson transition-colors">
                    05. GET IN TOUCH
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Social Media Links */}
            <div className="flex flex-col gap-3">
              <span className="font-mono font-bold text-xs text-brand-crimson tracking-widest uppercase">
                SOCIAL MEDIA & PROFILES
              </span>
              <div className="flex flex-wrap gap-2.5 pt-1">
                {socials.map((social) => (
                  <a
                    key={social.id || social._id}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="size-9 rounded-lg bg-black/60 border border-border-subtle flex items-center justify-center text-text-secondary hover:text-white hover:bg-brand-crimson/20 hover:border-brand-crimson transition-all duration-300 hover:-translate-y-0.5"
                    title={`${social.platform} - ${social.username || social.url}`}
                  >
                    <span className="sr-only">{social.platform}</span>
                    {renderSocialIcon(social.platform)}
                  </a>
                ))}
                {socials.length === 0 && (
                  <div className="flex gap-2">
                    <a href="https://github.com" target="_blank" rel="noreferrer" className="size-9 rounded-lg bg-black/60 border border-border-subtle flex items-center justify-center text-text-secondary hover:text-white"><Github className="size-4" /></a>
                    <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="size-9 rounded-lg bg-black/60 border border-border-subtle flex items-center justify-center text-text-secondary hover:text-white"><Linkedin className="size-4" /></a>
                    <a href="mailto:mearaees@gmail.com" className="size-9 rounded-lg bg-black/60 border border-border-subtle flex items-center justify-center text-text-secondary hover:text-white"><Mail className="size-4" /></a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Copyright Row */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono">
            <div>
              &copy; {new Date().getFullYear()} <span className="text-white font-semibold">TECORITHAM | Mohammad Raees</span>. All Rights Reserved.
            </div>

            <div className="flex items-center gap-3">
              <span className="text-text-muted text-[10px]">ADMIN CONTROL PANEL</span>
              <button
                onClick={() => navigate('/admin/login')}
                className="p-2 rounded-lg bg-black/60 border border-border-subtle text-text-muted hover:text-brand-crimson hover:border-brand-crimson transition-colors cursor-pointer"
                title="Admin Panel CMS Login"
              >
                <Shield className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
