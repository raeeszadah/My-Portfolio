import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Button } from '@/components/ui/button';
import { ArrowDown, Download } from 'lucide-react';

import { getMediaUrl } from '@/lib/api';
import { IconCloud } from '@/components/ui/interactive-icon-cloud';


interface HeroProps {
  profile: any;
}

export default function Hero({ profile }: HeroProps) {
  const rolesRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Stagger Fade-in Entry Animation
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.hero-item',
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1, stagger: 0.15, ease: 'power4.out' }
      );
    }, containerRef);

    // 2. Rotating Roles text animator
    const roles = profile?.roles || ['Full Stack Engineer', 'Creative Developer'];
    let roleIndex = 0;
    const roleEl = rolesRef.current;

    const rotateRoles = setInterval(() => {
      if (roleEl) {
        gsap.to(roleEl, {
          opacity: 0,
          y: -20,
          duration: 0.4,
          onComplete: () => {
            roleIndex = (roleIndex + 1) % roles.length;
            roleEl.innerText = roles[roleIndex];
            gsap.fromTo(
              roleEl,
              { y: 20, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.4 }
            );
          },
        });
      }
    }, 3000);

    return () => {
      ctx.revert();
      clearInterval(rotateRoles);
    };
  }, [profile]);

  const handleScrollDown = () => {
    const nextSec = document.querySelector('#about');
    if (nextSec) {
      nextSec.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const techNames = [
    "TypeScript",
    "JavaScript",
    "React",
    "Node.js",
    "Express",
    "Next.js",
    "PostgreSQL",
    "MongoDB",
    "Docker",
    "Git",
    "Figma",
    "Tailwind CSS",
    "GSAP",
    "Framer Motion",
    "AWS Cloud",
    "Vite",
    "Python",
    "C++",
    "GraphQL",
    "HTML5",
    "CSS3",
    "Android",
    "Java",
    "OpenAI"
  ];

  return (
    <section
      id="hero"
      ref={containerRef}
      className="min-h-[calc(100vh-80px)] flex items-center relative overflow-hidden px-6 lg:px-12 select-none py-16"
    >
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-brand-crimson-glow blur-[120px] pointer-events-none" />

      {/* 3D Background Icon Cloud (85% Opacity, Background Stack) */}
      <div className="absolute inset-0 flex items-center justify-center opacity-85 z-0 pointer-events-none">
        <div className="w-full max-w-2xl translate-x-[15%] translate-y-[-5%] opacity-85 flex items-center justify-center">
          <IconCloud iconNames={techNames} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-16 items-center z-10">
        {/* Left Side: Intro Text & CTAs */}
        <div className="lg:col-span-7 text-left flex flex-col items-start justify-center">
          <div className="hero-item text-xs font-semibold text-brand-crimson tracking-[0.15em] uppercase mb-4 flex items-center gap-2">
            <span className="h-px w-6 bg-brand-crimson inline-block"></span>
            CREATIVE DEVELOPER & ARCHITECT
          </div>

          <h1 className="hero-item font-display font-black text-5xl md:text-7xl tracking-tight text-text-primary mb-6 uppercase leading-none">
            {profile?.name || 'MOHAMMAD RAEES'}
          </h1>

          <div className="hero-item h-8 md:h-10 text-xl md:text-2xl font-display font-bold text-brand-crimson tracking-wider uppercase mb-8">
            <span ref={rolesRef}>{profile?.roles?.[0] || 'FULL STACK ENGINEER'}</span>
          </div>

          <p className="hero-item text-text-secondary text-base md:text-lg mb-10 max-w-xl leading-relaxed font-body">
            {profile?.bio || 'Crafting clean interfaces, fast backends, and stunning scroll experiences.'}
          </p>

          <div className="hero-item flex flex-wrap gap-4">
            <Button
              onClick={() => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-brand-crimson text-white hover:bg-brand-crimson-dim px-8 py-6 rounded-full uppercase font-semibold text-xs tracking-wider transition-all duration-300 shadow-[0_0_20px_rgba(255,0,27,0.2)] hover:shadow-[0_0_30px_rgba(255,0,27,0.4)] cursor-pointer"
            >
              LET'S CHAT
            </Button>
            <Button
              onClick={() => document.querySelector('#projects')?.scrollIntoView({ behavior: 'smooth' })}
              variant="outline"
              className="border-border-dim text-white hover:border-brand-crimson hover:bg-brand-crimson-subtle px-8 py-6 rounded-full transition-all duration-300 cursor-pointer"
            >
              SEE WORK
            </Button>

            {(profile?.resumeUrl || profile?.resume_url) && (
              <a
                href={getMediaUrl(profile.resumeUrl || profile.resume_url)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-brand-crimson/50 text-brand-crimson hover:text-white hover:bg-brand-crimson hover:border-brand-crimson px-7 py-3.5 rounded-full font-semibold text-xs tracking-wider transition-all duration-300 shadow-[0_0_15px_rgba(255,0,27,0.2)]"
              >
                <Download className="size-4" />
                RESUME
              </a>
            )}
          </div>

        </div>

        {/* Right Side: High-quality circular photo */}
        <div className="lg:col-span-5 flex justify-center items-center relative">
          <div className="hero-item relative group">
            {/* Outer Glow Ring */}
            <div className="absolute -inset-1.5 bg-gradient-to-r from-brand-crimson to-brand-crimson-glow/40 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
            
            {/* Photo Container */}
            <div className="relative w-[280px] h-[280px] md:w-[360px] md:h-[360px] rounded-full overflow-hidden bg-surface-card border-2 border-border-subtle/60 flex items-center justify-center shadow-[0_0_40px_rgba(255,0,27,0.25)]">
              <img
                src={getMediaUrl(profile?.profileImage || profile?.profile_image) || '/profile.png'}
                alt={profile?.name || 'Developer Avatar'}
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              {/* Overlay shadow / gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>
        </div>


      </div>

      {/* Scroll Down action */}
      <button
        onClick={handleScrollDown}
        className="hero-item absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-text-muted hover:text-white transition-colors cursor-pointer animate-bounce"
      >
        <span className="text-[10px] tracking-widest uppercase">Scroll Down</span>
        <ArrowDown className="size-4 text-brand-crimson" />
      </button>
    </section>
  );
}
