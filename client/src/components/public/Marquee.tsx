import { motion } from 'motion/react';

interface TechCapsuleProps {
  name: string;
  logo: string;
}

function TechCapsule({ name, logo }: TechCapsuleProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="group flex items-center gap-3.5 p-2 pr-6 rounded-full bg-surface-card border border-border-subtle hover:border-brand-crimson hover:border-dashed cursor-pointer transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
    >
      <div className="size-11 rounded-full flex items-center justify-center bg-black border border-border-subtle group-hover:border-brand-crimson transition-colors shrink-0">
        <img className="size-5 object-contain" src={logo} alt={name} />
      </div>
      <span className="text-xs font-bold text-white uppercase font-mono tracking-wider transition-colors group-hover:text-brand-crimson">
        {name}
      </span>
    </motion.div>
  );
}

export default function Marquee() {
  const row1Techs = [
    { name: 'React', logo: 'https://cdn.simpleicons.org/react' },
    { name: 'TypeScript', logo: 'https://cdn.simpleicons.org/typescript' },
    { name: 'Node.js', logo: 'https://cdn.simpleicons.org/nodedotjs' },
    { name: 'MongoDB', logo: 'https://cdn.simpleicons.org/mongodb' },
    { name: 'Tailwind CSS', logo: 'https://cdn.simpleicons.org/tailwindcss' },
    { name: 'GSAP', logo: 'https://cdn.simpleicons.org/greensock' },
    { name: 'Next.js', logo: 'https://cdn.simpleicons.org/nextdotjs' },
    { name: 'Express.js', logo: 'https://cdn.simpleicons.org/express' },
  ];

  const row2Techs = [
    { name: 'Docker', logo: 'https://cdn.simpleicons.org/docker' },
    { name: 'AWS Cloud', logo: 'https://cdn.simpleicons.org/amazonwebservices' },
    { name: 'GraphQL', logo: 'https://cdn.simpleicons.org/graphql' },
    { name: 'Python', logo: 'https://cdn.simpleicons.org/python' },
    { name: 'PostgreSQL', logo: 'https://cdn.simpleicons.org/postgresql' },
    { name: 'Framer Motion', logo: 'https://cdn.simpleicons.org/framermotion' },
    { name: 'Git & GitHub', logo: 'https://cdn.simpleicons.org/git' },
    { name: 'Vite', logo: 'https://cdn.simpleicons.org/vite' },
  ];

  return (
    <div className="relative w-full py-12 overflow-hidden bg-black text-white border-y border-border-subtle select-none">
      {/* Edge Fades */}
      <div className="absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-black to-transparent z-20 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-40 bg-gradient-to-l from-black to-transparent z-20 pointer-events-none" />

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
                logo={tech.logo}
              />
            ))}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
