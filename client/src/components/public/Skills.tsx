import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Code, Cpu, Terminal, Database, Server } from 'lucide-react';

interface SkillsProps {
  skills: any[];
}

function getSkillLogoUrl(name: string, colorHex: string = 'fff') {
  const n = name.toLowerCase().trim();

  // ── simpleicons.org slug map with strict precedence ──────────────────────
  const siMap: [RegExp, string][] = [
    // 1. Frameworks & Libraries (Must evaluate BEFORE generic JavaScript)
    [/node|\bnodedotjs\b/,                    'nodedotjs'],
    [/express/,                               'express'],
    [/gsap|greensock/,                        'greensock'],
    [/next/,                                  'nextdotjs'],
    [/react/,                                 'react'],
    [/typescript|\bts\b/,                     'typescript'],
    [/tailwind/,                              'tailwindcss'],
    [/framer|motion/,                         'framer'],
    [/remotion/,                              'remotion'],
    [/socket/,                                'socketdotio'],
    [/graphql/,                               'graphql'],

    // 2. Pure Languages & Web Standards
    [/javascript|\bvanilla js\b|\bjs\b/,     'javascript'],
    [/python/,                                'python'],
    [/c\+\+/,                                 'cplusplus'],
    [/html/,                                  'html5'],
    [/css/,                                   'css3'],

    // 3. Databases & ORMs
    [/mongodb/,                               'mongodb'],
    [/postgresql|postgres/,                   'postgresql'],
    [/mysql/,                                 'mysql'],
    [/redis/,                                 'redis'],
    [/supabase/,                              'supabase'],
    [/firebase/,                              'firebase'],
    [/prisma/,                                'prisma'],
    [/convex/,                                'convex'],

    // 4. Cloud, DevOps & Source Control
    [/aws|amazon web/,                        'amazonwebservices'],
    [/docker/,                                'docker'],
    [/vercel/,                                'vercel'],
    [/github/,                                'github'],
    [/git(?!hub)/,                            'git'],

    // 5. Tools, Auth & AI
    [/clerk/,                                 'clerk'],
    [/inngest/,                               'inngest'],
    [/figma/,                                 'figma'],
    [/postman|rest api/,                      'postman'],
    [/jwt|json web/,                          'jsonwebtokens'],
    [/openai|prompt engineer|gen(erative)? ai/, 'openai'],
    [/hugging|llm|rag/,                       'huggingface'],
    [/razorpay/,                              'razorpay'],

    // 6. System Architecture & Fundamentals
    [/system design|scalable/,                'diagramsdotnet'],
    [/dsa|data structure/,                    'cplusplus'],
  ];

  for (const [pattern, slug] of siMap) {
    if (pattern.test(n)) {
      return `https://cdn.simpleicons.org/${slug}/${colorHex}`;
    }
  }

  return '';
}


// A smart icon component that loads simpleicon, but falls back to a nice Lucide icon if it fails or doesn't exist
function SkillIcon({ name, logoUrl, className }: { name: string; logoUrl: string; className?: string }) {
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
  }, [logoUrl]);

  if (error || !logoUrl) {
    const n = name.toLowerCase();
    if (n.includes('design') || n.includes('system')) {
      return <Cpu className={className} />;
    }
    if (n.includes('db') || n.includes('mongo') || n.includes('sql') || n.includes('postgres') || n.includes('convex')) {
      return <Database className={className} />;
    }
    if (n.includes('node') || n.includes('express') || n.includes('api') || n.includes('backend') || n.includes('inngest')) {
      return <Server className={className} />;
    }
    if (n.includes('clerk') || n.includes('auth') || n.includes('jwt')) {
      return <Terminal className={className} />;
    }
    return <Code className={className} />;
  }

  return (
    <img
      src={logoUrl}
      alt={name}
      className={className}
      onError={() => setError(true)}
    />
  );
}

export default function Skills({ skills }: SkillsProps) {
  const [activeIdx, setActiveIdx] = useState(0);

  // Use all skills from the database for the dynamic cycler and sync bar
  const highlightedSkills = skills.map((skill) => ({
    name: skill.name,
    category: skill.category,
    level: `${skill.level}%`,
  }));

  // Cycle automatically every 2.5 seconds
  useEffect(() => {
    if (highlightedSkills.length === 0) return;
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % highlightedSkills.length);
    }, 2500);
    return () => clearInterval(timer);
  }, [highlightedSkills.length]);

  return (
    <section id="skills" className="w-full overflow-hidden py-12 max-w-7xl mx-auto px-6 scroll-mt-20 flex flex-col items-center">
      {/* Eyebrow and Header */}
      <div className="flex items-center gap-2 mb-2 self-start md:self-center">
        <span className="h-px w-6 bg-brand-crimson"></span>
        <span className="text-xs font-semibold text-brand-crimson tracking-[0.15em] uppercase">
          KNOWLEDGE
        </span>
        <span className="h-px w-6 bg-brand-crimson"></span>
      </div>

      <h2 className="font-display font-black text-3xl md:text-5xl text-white uppercase mb-1 self-start md:self-center tracking-wider">
        TECHNICAL SKILLS
      </h2>
      <p className="text-text-secondary text-sm tracking-widest uppercase mb-6 self-start md:self-center font-mono">
        Code • Create • Innovate
      </p>

      {/* 1. TOP DYNAMIC ICON SLOT (Super-sized) */}
      <div className="relative w-48 h-48 md:w-56 md:h-56 mb-4 flex items-center justify-center bg-surface-card border border-brand-crimson/40 rounded-3xl shadow-[0_0_50px_rgba(255,0,27,0.3)]">
        <AnimatePresence mode="wait">
          {highlightedSkills[activeIdx] && (
            <motion.div
              key={highlightedSkills[activeIdx].name}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.45, ease: [0.25, 1, 0.5, 1] as [number, number, number, number] }}
              className="w-24 h-24 md:w-28 md:h-28 flex items-center justify-center text-brand-crimson shrink-0"
            >
              <SkillIcon
                name={highlightedSkills[activeIdx].name}
                logoUrl={getSkillLogoUrl(highlightedSkills[activeIdx].name, 'ff001b')}
                className="w-full h-full object-contain text-brand-crimson"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Active Skill Indicator Label (Larger Hierarchy) */}
      <div className="text-center mb-8">
        <h3 className="text-2xl md:text-4xl font-black text-white tracking-wider font-display">
          {highlightedSkills[activeIdx]?.name}
        </h3>
        <span className="text-xs md:text-sm px-5 py-2 mt-2 inline-block rounded-full bg-surface-elevated text-brand-crimson border border-brand-crimson/30 font-mono uppercase tracking-widest">
          {highlightedSkills[activeIdx]?.category} • {highlightedSkills[activeIdx]?.level}
        </span>
      </div>

      {/* 2. SYNCHRONIZED LOGO/PILL BAR (Marquee Mode) */}
      <div className="relative w-full max-w-full md:max-w-4xl py-4 px-5 mb-2 bg-surface-card/60 border border-border-subtle rounded-full overflow-hidden select-none">
        {/* Edge Fades */}
        <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#0d0d0d] to-transparent z-20 pointer-events-none rounded-l-full" />
        <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#0d0d0d] to-transparent z-20 pointer-events-none rounded-r-full" />

        <div className="w-full overflow-hidden">
          <motion.div
            className="flex items-center gap-3 min-w-max"
            animate={{
              x: ["-25%", "0%"],
            }}
            transition={{
              duration: 35,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {[...highlightedSkills, ...highlightedSkills, ...highlightedSkills, ...highlightedSkills].map((skill, index) => {
              const originalIndex = index % highlightedSkills.length;
              const isActive = originalIndex === activeIdx;
              return (
                <motion.button
                  key={`${skill.name}-${index}`}
                  onClick={() => setActiveIdx(originalIndex)}
                  animate={{
                    opacity: isActive ? 1 : 0.4,
                    scale: isActive ? 1.08 : 1,
                  }}
                  transition={{ duration: 0.3 }}
                  className={`flex items-center gap-2.5 px-5 py-2.5 rounded-full cursor-pointer transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-surface-elevated border border-brand-crimson shadow-[0_0_15px_rgba(255,0,27,0.35)]'
                      : 'bg-[#141414]/40 border border-transparent hover:border-border-dim'
                  }`}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={isActive ? 'active' : 'inactive'}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.25 }}
                      className="flex items-center gap-2.5"
                    >
                      <SkillIcon
                        name={skill.name}
                        logoUrl={getSkillLogoUrl(skill.name, isActive ? 'ff001b' : 'a0a0a0')}
                        className={`w-5 h-5 object-contain transition-colors duration-300 ${
                          isActive ? 'text-brand-crimson' : 'text-text-secondary group-hover:text-white'
                        }`}
                      />
                      <span className={`text-xs font-bold font-mono tracking-wider ${isActive ? 'text-white' : 'text-text-secondary'}`}>
                        {skill.name.split(' ')[0]}
                      </span>
                    </motion.div>
                  </AnimatePresence>
                </motion.button>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
