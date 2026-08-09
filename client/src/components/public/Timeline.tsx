import { useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Calendar, Award } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface TimelineProps {
  experience: any[];
  education: any[];
}

export default function Timeline({ experience, education }: TimelineProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      const cards = sectionRef.current?.querySelectorAll<HTMLElement>('.timeline-card');
      if (!cards || cards.length === 0) return;

      cards.forEach((card) => {
        gsap.fromTo(
          card,
          {
            opacity: 0,
            y: 90,
            scale: 0.94,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 92%',
              end: 'top 50%',
              scrub: 0.6,
              toggleActions: 'play reverse play reverse',
            },
          }
        );
      });
    }, sectionRef);

    return () => {
      ctx.revert();
    };
  }, [experience, education]);

  return (
    <section
      id="timeline"
      ref={sectionRef}
      className="py-24 max-w-5xl mx-auto px-6 scroll-mt-20 w-full"
    >
      {/* Eyebrow and Header */}
      <div className="flex items-center gap-2 mb-2">
        <span className="h-px w-6 bg-brand-crimson"></span>
        <span className="text-xs font-semibold text-brand-crimson tracking-[0.15em] uppercase">
          JOURNEY
        </span>
        <span className="h-px w-6 bg-brand-crimson"></span>
      </div>

      <h2 className="font-display font-black text-3xl md:text-4xl text-white uppercase mb-16">
        TIMELINE & HISTORY
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 relative">
        {/* Mid-line separator */}
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-border-subtle hidden lg:block pointer-events-none" />

        {/* Experience Timeline */}
        <div>
          <h3 className="font-display font-bold text-xl text-white uppercase mb-8 flex items-center gap-3">
            <Calendar className="size-5 text-brand-crimson" />
            WORK EXPERIENCE
          </h3>

          <div className="flex flex-col gap-8 relative border-l border-border-subtle lg:border-none pl-6 lg:pl-0">
            {experience.map((exp, index) => {
              const expId = exp.id || exp._id || `exp-${index}`;
              const techTags = exp.techTags || exp.tech_tags || [];
              const responsibilities = exp.responsibilities || [];
              const startDate = exp.startDate || exp.start_date || '';
              const endDate = exp.endDate || exp.end_date || 'Present';

              return (
                <div
                  key={expId}
                  className="timeline-card bg-surface-card border border-border-subtle p-6 rounded-2xl relative shadow-2xl hover:border-brand-crimson/40 transition-colors duration-500 group"
                >
                  <div className="absolute inset-0 border border-brand-crimson/0 group-hover:border-brand-crimson/30 rounded-2xl pointer-events-none transition-all duration-500 shadow-[0_0_25px_rgba(255,0,27,0.1)]" />

                  {/* Timeline node dot */}
                  <span className="absolute left-[-31px] top-[26px] size-2.5 rounded-full bg-brand-crimson border-2 border-black lg:hidden" />

                  <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <div>
                      <h4 className="font-semibold text-white text-base leading-snug group-hover:text-brand-crimson transition-colors duration-300">
                        {exp.role}
                      </h4>
                      <span className="text-xs text-text-secondary">{exp.company}</span>
                    </div>
                    <span className="text-xs font-mono text-text-muted">
                      {startDate} - {endDate}
                    </span>
                  </div>

                  <ul className="text-xs text-text-secondary leading-relaxed space-y-2 list-disc pl-4 mb-4 font-body">
                    {responsibilities.map((resp: string, i: number) => (
                      <li key={i}>{resp}</li>
                    ))}
                  </ul>

                  <div className="flex flex-wrap gap-1.5">
                    {techTags.map((tech: string, i: number) => (
                      <Badge
                        key={i}
                        variant="outline"
                        className="text-[9px] font-mono border-border-subtle text-text-secondary px-2 py-0.5 rounded bg-white/5"
                      >
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
              );
            })}

            {experience.length === 0 && (
              <div className="py-8 text-text-muted text-xs">No experience items available.</div>
            )}
          </div>
        </div>

        {/* Education Timeline */}
        <div>
          <h3 className="font-display font-bold text-xl text-white uppercase mb-8 flex items-center gap-3">
            <Award className="size-5 text-brand-crimson" />
            ACADEMIC EDUCATION
          </h3>

          <div className="flex flex-col gap-8 relative border-l border-border-subtle lg:border-none pl-6 lg:pl-0">
            {education.map((edu, index) => {
              const eduId = edu.id || edu._id || `edu-${index}`;
              const milestones = edu.milestones || [];
              const startDate = edu.startDate || edu.start_date || '';
              const endDate = edu.endDate || edu.end_date || '';

              return (
                <div
                  key={eduId}
                  className="timeline-card bg-surface-card border border-border-subtle p-6 rounded-2xl relative shadow-2xl hover:border-brand-crimson/40 transition-colors duration-500 group"
                >
                  <div className="absolute inset-0 border border-brand-crimson/0 group-hover:border-brand-crimson/30 rounded-2xl pointer-events-none transition-all duration-500 shadow-[0_0_25px_rgba(255,0,27,0.1)]" />

                  <span className="absolute left-[-31px] top-[26px] size-2.5 rounded-full bg-brand-crimson border-2 border-black lg:hidden" />

                  <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <div>
                      <h4 className="font-semibold text-white text-base leading-snug group-hover:text-brand-crimson transition-colors duration-300">
                        {edu.degree}
                      </h4>
                      <span className="text-xs text-text-secondary">{edu.institution}</span>
                    </div>
                    <span className="text-xs font-mono text-text-muted">
                      {startDate} - {endDate}
                    </span>
                  </div>

                  <ul className="text-xs text-text-secondary leading-relaxed space-y-2 list-disc pl-4 font-body">
                    {milestones.map((mile: string, i: number) => (
                      <li key={i}>{mile}</li>
                    ))}
                  </ul>
                </div>
              );
            })}

            {education.length === 0 && (
              <div className="py-8 text-text-muted text-xs">No education items available.</div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
