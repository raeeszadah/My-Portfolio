import { motion } from 'motion/react';
import { getTechIcon } from '../../lib/techIcons';

interface TechCapsuleProps {
  name: string;
}

function TechCapsule({ name }: TechCapsuleProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="group flex items-center gap-3.5 p-2 pr-6 rounded-full bg-surface-card border border-border-subtle hover:border-brand-crimson hover:border-dashed cursor-pointer transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
    >
      <div className="size-11 rounded-full flex items-center justify-center bg-surface-overlay border border-border-subtle group-hover:border-brand-crimson transition-colors shrink-0">
        {getTechIcon(name, "size-5 object-contain")}
      </div>
      <span className="text-xs font-bold text-white uppercase font-mono tracking-wider transition-colors group-hover:text-brand-crimson">
        {name}
      </span>
    </motion.div>
  );
}

export default function Marquee() {
  const row1Techs = [
    { name: 'React' },
    { name: 'TypeScript' },
    { name: 'Node.js' },
    { name: 'MongoDB' },
    { name: 'Tailwind CSS' },
    { name: 'GSAP' },
    { name: 'Next.js' },
    { name: 'Express.js' },
  ];

  const row2Techs = [
    { name: 'Docker' },
    { name: 'AWS Cloud' },
    { name: 'GraphQL' },
    { name: 'Python' },
    { name: 'PostgreSQL' },
    { name: 'Framer Motion' },
    { name: 'Git & GitHub' },
    { name: 'Vite' },
  ];

  return (
    <div className="relative w-full py-12 overflow-hidden bg-background-alt text-white border-y border-border-subtle select-none">
      {/* Edge Fades */}
      <div className="absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-background-alt to-transparent z-20 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-40 bg-gradient-to-l from-background-alt to-transparent z-20 pointer-events-none" />

      {/* Content Rows */}
      <div className="relative z-10 flex flex-col gap-6 py-4 items-center justify-center overflow-hidden">
        {[row1Techs, row2Techs].map((row, rowIndex) => (
          <motion.div
            key={rowIndex}
            className="flex items-center gap-6 min-w-max"
            animate={{
              x: rowIndex % 2 === 0 ? ["0%", "-25%"] : ["-25%", "0%"],
            }}
            transition={{
              duration: 35,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {[...row, ...row, ...row, ...row].map((tech, i) => (
              <TechCapsule
                key={`${tech.name}-${i}`}
                name={tech.name}
              />
            ))}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
