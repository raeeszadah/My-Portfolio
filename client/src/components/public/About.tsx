import { useEffect, useRef } from 'react';
import Timeline from './Timeline';
import Certifications from './Certifications';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface AboutProps {
  profile: any;
  timeline: { experience: any[]; education: any[] };
  certifications: any[];
}

export default function About({ profile, timeline, certifications }: AboutProps) {
  const profileRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!profileRef.current) return;

    const ctx = gsap.context(() => {
      const items = profileRef.current?.querySelectorAll<HTMLElement>('.about-reveal-item');
      if (!items || items.length === 0) return;

      items.forEach((item) => {
        gsap.fromTo(
          item,
          {
            opacity: 0,
            y: 80,
            scale: 0.95,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: item,
              start: 'top 90%',
              end: 'top 45%',
              scrub: 0.5,
              toggleActions: 'play reverse play reverse',
            },
          }
        );
      });
    }, profileRef);

    return () => {
      ctx.revert();
    };
  }, [profile]);

  return (
    <div className="w-full flex flex-col">
      {/* 1. ABOUT PROFILE SECTION */}
      <section
        id="about"
        ref={profileRef}
        className="py-24 max-w-4xl mx-auto px-6 scroll-mt-20 w-full"
      >
        {/* Eyebrow and Header */}
        <div className="about-reveal-item flex items-center gap-2 mb-2">
          <span className="h-px w-6 bg-brand-crimson"></span>
          <span className="text-xs font-semibold text-brand-crimson tracking-[0.15em] uppercase">
            ABOUT ME
          </span>
          <span className="h-px w-6 bg-brand-crimson"></span>
        </div>

        <h2 className="about-reveal-item font-display font-black text-3xl md:text-4xl text-white uppercase mb-8">
          MY PROFILE
        </h2>

        {/* Content Card */}
        <div className="about-reveal-item bg-surface-card border border-border-subtle p-8 rounded-3xl space-y-6 shadow-2xl relative hover:border-brand-crimson/30 transition-colors duration-500 group">
          <div className="absolute inset-0 border border-brand-crimson/0 group-hover:border-brand-crimson/30 rounded-3xl pointer-events-none transition-all duration-500 shadow-[0_0_30px_rgba(255,0,27,0.1)]" />

          <p className="text-text-secondary text-base md:text-lg leading-relaxed font-body">
            {profile?.bio ||
              'Final-year B.Tech student in Electronics & Computer Engineering at MIT-ADT University (Pune, India) and practising Full Stack & AI Software Engineer behind Tecoritham. Experienced in building AI-powered SaaS platforms, REST APIs, and responsive frontends using MERN Stack, Next.js, TypeScript, and Generative AI.'}
          </p>
          <p className="text-text-secondary text-base md:text-lg leading-relaxed font-body">
            I design systems that stand out. With every project, my focus remains on performance, clean coding standards, and high-fidelity micro-animations. I believe in stable visual environments where dynamic content feeds seamlessly without ever breaking the underlying design system.
          </p>

          {profile?.availability && (
            <div className="mt-8 pt-6 border-t border-border-subtle flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <span className="size-2.5 rounded-full bg-green-500 animate-ping" />
                <span className="text-sm font-semibold tracking-wide text-white uppercase">Status:</span>
                <span className="text-sm text-text-secondary">{profile.availability}</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 2. TIMELINE & EDUCATION HISTORY (JOURNEY) */}
      <Timeline experience={timeline.experience} education={timeline.education} />

      {/* 3. CREDENTIALS & CERTIFICATIONS */}
      <Certifications certifications={certifications} />
    </div>
  );
}
