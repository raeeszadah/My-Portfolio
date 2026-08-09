import { useState, useEffect, useRef } from 'react';
import { ExternalLink, Github, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getMediaUrl } from '@/lib/api';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ProjectsProps {
  projects: any[];
}

export default function Projects({ projects }: ProjectsProps) {
  const [filter, setFilter] = useState('all');
  const sectionRef = useRef<HTMLDivElement>(null);
  const pinContainerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  const categories = [
    'all',
    ...Array.from(
      new Set(
        projects.flatMap((p) => p.techStack || p.tech_stack || [])
      )
    ),
  ];

  const filteredProjects =
    filter === 'all'
      ? projects
      : projects.filter((p) => {
          const stack = p.techStack || p.tech_stack || [];
          return stack.includes(filter);
        });

  // ── GSAP ScrollTrigger Pinned Section Card Deck Animation ─────────────────
  useEffect(() => {
    if (!pinContainerRef.current || !cardsRef.current) return;

    const ctx = gsap.context(() => {
      const cards = cardsRef.current?.querySelectorAll<HTMLElement>('.project-card');
      if (!cards || cards.length === 0) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: pinContainerRef.current,
          pin: true,
          start: 'top top+=80',
          end: () => `+=${cards.length * 550}`,
          scrub: 1.2,

          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      cards.forEach((card, index) => {
        if (index === 0) {
          gsap.set(card, { y: 0, opacity: 1, scale: 1 });
        } else {
          tl.fromTo(
            card,
            {
              y: '120%',
              opacity: 0,
              scale: 0.9,
            },
            {
              y: '0%',
              opacity: 1,
              scale: 1,
              duration: 1,
              ease: 'power2.out',
            },
            `card-${index}`
          );
        }

        if (index > 0 && cards[index - 1]) {
          tl.to(
            cards[index - 1],
            {
              scale: 0.96,
              opacity: 0.35,
              duration: 0.8,
              ease: 'power2.inOut',
            },
            `card-${index}`
          );
        }
      });
    }, sectionRef);

    ScrollTrigger.refresh();

    return () => {
      ctx.revert();
    };
  }, [filter, projects]);

  return (
    <section id="projects" ref={sectionRef} className="py-8 max-w-6xl mx-auto px-6 scroll-mt-20 relative">
      {/* Viewport Screen-Fitted Pinned Container */}
      <div ref={pinContainerRef} className="w-full flex flex-col gap-6 min-h-[calc(100vh-100px)] justify-center py-4">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-border-subtle pb-4 relative z-30 bg-black/90 backdrop-blur-md shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-px w-6 bg-brand-crimson" />
              <span className="text-xs font-semibold text-brand-crimson tracking-[0.15em] uppercase flex items-center gap-1.5">
                <Sparkles className="size-3.5" /> FEATURED PROJECTS
              </span>
              <span className="h-px w-6 bg-brand-crimson" />
            </div>
            <h2 className="font-display font-black text-2xl md:text-3xl text-white uppercase tracking-wider">
              WHAT I BUILD
            </h2>
          </div>

          {/* Tech Filter Pills */}
          <div className="flex flex-wrap gap-1.5 select-none">
            {categories.slice(0, 8).map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-3 py-1 rounded-full text-[9px] font-mono font-bold tracking-wider uppercase border cursor-pointer transition-all duration-300 ${
                  filter === cat
                    ? 'bg-brand-crimson/20 text-brand-crimson border-brand-crimson shadow-[0_0_15px_rgba(255,0,27,0.35)]'
                    : 'bg-white/5 text-text-secondary border-border-subtle hover:text-white hover:border-border-active'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Pinned Cards Viewport-Fitted Stack */}
        {filteredProjects.length === 0 ? (
          <div className="text-center text-text-muted py-16 border border-dashed border-border-subtle rounded-2xl relative z-10">
            No projects available matching this filter.
          </div>
        ) : (
          <div ref={cardsRef} className="relative w-full flex-1 min-h-[520px] flex items-center justify-center">
            {filteredProjects.map((project, index) => {
              const projectId = project.id || project._id || `proj-${index}`;
              const techStack = project.techStack || project.tech_stack || [];
              const githubUrl = project.githubUrl || project.github_url;
              const demoUrl = project.demoUrl || project.demo_url;
              const descriptionText = project.longDescription || project.long_description || project.description;
              const thumbnailSrc = getMediaUrl(project.thumbnail);
              const videoSrc = getMediaUrl(project.videoUrl || project.video_url);

              return (
                <div
                  key={projectId}
                  style={{ zIndex: 10 + index }}
                  className="project-card absolute top-0 left-0 w-full bg-surface-card border border-border-subtle hover:border-brand-crimson/50 rounded-2xl overflow-hidden flex flex-col lg:flex-row shadow-2xl transition-colors duration-500 group"
                >
                  {/* Crimson Focus Glow Frame */}
                  <div className="absolute inset-0 border border-brand-crimson/0 group-hover:border-brand-crimson/40 rounded-2xl pointer-events-none transition-all duration-500 shadow-[0_0_35px_rgba(255,0,27,0.14)]" />

                  {/* 16:9 Primary Screenshot / Media Container */}
                  <div className="w-full lg:w-7/12 bg-black/90 relative overflow-hidden flex items-center justify-center border-b lg:border-b-0 lg:border-r border-border-subtle shrink-0 p-3 lg:p-4">
                    <div className="w-full aspect-video rounded-xl overflow-hidden bg-black/80 border border-border-subtle/60 relative flex items-center justify-center group-hover:border-brand-crimson/30 transition-colors">
                      {videoSrc ? (
                        <video
                          src={videoSrc}
                          controls
                          autoPlay
                          muted
                          loop
                          className="w-full h-full object-contain"
                        />
                      ) : thumbnailSrc ? (
                        <img
                          src={thumbnailSrc}
                          alt={project.title}
                          className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-2 text-text-muted p-6 text-center">
                          <span className="text-4xl font-display font-black text-brand-crimson/30 tracking-widest uppercase leading-none">
                            {project.title ? project.title.slice(0, 2) : 'PR'}
                          </span>
                          <span className="text-[10px] font-mono uppercase tracking-widest text-text-muted">
                            NO SCREENSHOT MEDIA
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* High Priority Overview & Info Panel */}
                  <div className="flex-1 p-6 lg:p-7 flex flex-col justify-between gap-5 relative z-10 bg-surface-card/95 backdrop-blur-sm overflow-y-auto">
                    <div className="flex flex-col gap-3">
                      {/* Top Bar: Title & Primary Actions */}
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          {project.featured && (
                            <span className="text-[9px] font-mono tracking-widest text-brand-crimson font-bold uppercase mb-1 block">
                              ★ FEATURED PROJECT
                            </span>
                          )}
                          <h3 className="font-display font-black text-xl lg:text-2xl text-white uppercase tracking-wide group-hover:text-brand-crimson transition-colors duration-300">
                            {project.title}
                          </h3>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 shrink-0">
                          {githubUrl && (
                            <a
                              href={githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-lg bg-white/5 border border-border-subtle text-text-secondary hover:text-white hover:border-brand-crimson hover:bg-brand-crimson-subtle/20 transition-all duration-300"
                              title="GitHub Repository"
                            >
                              <Github className="size-4" />
                            </a>
                          )}
                          {demoUrl && (
                            <a
                              href={demoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-lg bg-white/5 border border-border-subtle text-text-secondary hover:text-white hover:border-brand-crimson hover:bg-brand-crimson-subtle/20 transition-all duration-300"
                              title="Live Demo"
                            >
                              <ExternalLink className="size-4" />
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Primary Project Overview */}
                      <p className="text-text-secondary text-sm leading-relaxed font-body font-normal">
                        {descriptionText}
                      </p>
                    </div>

                    {/* Secondary Compact Tech Stack Badges */}
                    {techStack.length > 0 && (
                      <div className="pt-4 border-t border-border-subtle/80 flex flex-col gap-2">
                        <span className="text-[9px] font-mono text-text-muted uppercase tracking-widest font-semibold">
                          TECHNOLOGY STACK
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {techStack.map((tech: string, i: number) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className="text-[9px] font-mono border-border-subtle/60 text-text-muted px-2 py-0.5 rounded bg-white/5"
                            >
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

