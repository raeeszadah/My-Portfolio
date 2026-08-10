import { useMemo } from 'react';
import { motion } from 'motion/react';
import { getTechIcon } from '../../lib/techIcons';

export type DynamicCloudProps = {
  iconSlugs?: string[];
  iconNames?: string[];
};

const DEFAULT_TECHS = [
  "React", "TypeScript", "JavaScript", "Node.js", "Express",
  "Next.js", "PostgreSQL", "MongoDB", "Docker", "Git",
  "Figma", "Tailwind CSS", "GSAP", "Framer Motion", "AWS Cloud",
  "Vite", "Python", "GraphQL", "HTML5", "CSS3",
  "Android", "Java", "Flutter", "OpenAI"
];

export function IconCloud({ iconNames, iconSlugs }: DynamicCloudProps) {
  const techs = iconNames || iconSlugs || DEFAULT_TECHS;

  // Compute 3D Fibonacci sphere distribution coordinates
  const items = useMemo(() => {
    const total = techs.length;
    const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle
    return techs.map((name, i) => {
      const y = 1 - (i / Math.max(1, total - 1)) * 2;
      const radius = Math.sqrt(1 - y * y);
      const theta = phi * i;

      const x = Math.cos(theta) * radius;
      const z = Math.sin(theta) * radius;

      const sphereRadius = 180;
      return {
        name,
        x: x * sphereRadius,
        y: y * sphereRadius,
        z: z * sphereRadius,
      };
    });
  }, [techs]);

  return (
    <div className="relative w-[380px] h-[380px] md:w-[480px] md:h-[480px] flex items-center justify-center [perspective:1000px] select-none">
      <motion.div
        animate={{
          rotateY: [0, 360],
          rotateX: [10, -10, 10],
        }}
        transition={{
          duration: 40,
          repeat: Infinity,
          ease: "linear",
        }}
        className="relative w-full h-full [transform-style:preserve-3d]"
      >
        {items.map((item, index) => (
          <div
            key={`${item.name}-${index}`}
            style={{
              transform: `translate3d(${item.x}px, ${item.y}px, ${item.z}px)`,
            }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-2.5 rounded-full bg-surface-card/60 border border-brand-crimson/20 backdrop-blur-md shadow-[0_0_15px_rgba(255,0,27,0.15)] flex items-center justify-center group hover:scale-125 hover:border-brand-crimson transition-all duration-300 cursor-pointer"
            title={item.name}
          >
            {getTechIcon(item.name, "size-6 md:size-7 text-white group-hover:text-brand-crimson transition-colors")}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
