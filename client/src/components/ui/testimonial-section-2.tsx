import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  image: string;
  quote: string;
}

const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Sarah Chen",
    role: "CEO of DataFlow",
    image:
      "/profile.png",
    quote:
      "SolaceUI transformed our design workflow. What used to take weeks now takes days.",
  },
  {
    id: "2",
    name: "Marcus Rodriguez",
    role: "Product Lead",
    image:
      "/profile.png",
    quote:
      "The best investment we've made for our frontend architecture in years.",
  },
  {
    id: "3",
    name: "Olivia Koe",
    role: "Design Director",
    image:
      "/profile.png",
    quote:
      "Simply beautiful components that are easy to customize and integrate.",
  },
  {
    id: "4",
    name: "David Kim",
    role: "Founder",
    image:
      "/profile.png",
    quote: "Our development velocity has doubled since adopting SolaceUI.",
  },
  {
    id: "5",
    name: "Amara Okonkwo",
    role: "CTO",
    image:
      "/profile.png",
    quote:
      "Accessibility and performance out of the box. Truly impressive work.",
  },
  {
    id: "6",
    name: "James Mitchell",
    role: "Frontend Dev",
    image:
      "/profile.png",
    quote: "The documentation is clear and the components just work. Love it.",
  },
  {
    id: "7",
    name: "Elena Rodriguez",
    role: "Product Manager",
    image:
      "/profile.png",
    quote:
      "It looks premium and feels premium. Our users noticed the difference immediately.",
  },
  {
    id: "8",
    name: "Michael Chang",
    role: "Tech Lead",
    image:
      "/profile.png",
    quote:
      "Clean abstractions and great TypeScript support. A joy to work with.",
  },
  {
    id: "9",
    name: "Sofia Weber",
    role: "Designer",
    image:
      "/profile.png",
    quote:
      "Finally a library that respects design constraints while offering flexibility.",
  },
];

export default function Testimonial2() {
  const [selected, setSelected] = useState<Testimonial | null>(null);

  // Split testimonials into 3 rows for visual variance
  const row1 = testimonials.slice(0, 3);
  const row2 = testimonials.slice(3, 6);
  const row3 = testimonials.slice(6, 9);

  return (
    <div className="relative w-full py-20 overflow-hidden [--color-primary:#FF001B] bg-background-alt text-white border-y border-border-subtle">
      {/* Eyebrow and Header */}
      <div className="max-w-7xl mx-auto px-6 text-center mb-12">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="h-px w-6 bg-brand-crimson"></span>
          <span className="text-xs font-semibold text-brand-crimson tracking-[0.15em] uppercase">
            TESTIMONIALS
          </span>
          <span className="h-px w-6 bg-brand-crimson"></span>
        </div>
        <h2 className="font-display font-black text-3xl md:text-5xl text-white uppercase tracking-tight">
          TRUSTED BY THE BEST PEOPLE
        </h2>
      </div>

      {/* Main Container acting as the viewport for background and fades */}
      <div className="relative w-full">
        {/* Shaded Background - Matches the height of this container exactly */}
        <div className="absolute inset-0 z-0 opacity-10 bg-[repeating-linear-gradient(315deg,currentColor_0,currentColor_1px,transparent_0,transparent_50%)] bg-[length:10px_10px] border-y border-border-subtle pointer-events-none"></div>

        {/* Fades - Match the height of this container exactly */}
        <div className="absolute left-0 top-0 bottom-0 w-40 bg-gradient-to-r from-black to-transparent z-20 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-40 bg-gradient-to-l from-black to-transparent z-20 pointer-events-none"></div>

        {/* Content Rows */}
        <div className="relative z-10 flex flex-col gap-8 py-12 items-center justify-center overflow-hidden">
          {[row1, row2, row3].map((row, rowIndex) => (
            <motion.div
              key={rowIndex}
              className="flex items-center gap-6 min-w-max"
              animate={{
                x: rowIndex % 2 === 0 ? ["0%", "-25%"] : ["-25%", "0%"],
              }}
              transition={{
                duration: 40,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              {[...row, ...row, ...row, ...row].map((testimonial, i) => (
                <Capsule
                  key={`${testimonial.id}-${i}`}
                  testimonial={testimonial}
                  onClick={() => setSelected(testimonial)}
                />
              ))}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{
                opacity: 0,
                scale: 0.95,
                y: 10,
                transition: { duration: 0.15 },
              }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative w-full max-w-lg bg-surface-card border border-brand-crimson/50 text-white p-8 md:p-12 rounded-2xl shadow-2xl z-50"
            >
              <button
                onClick={() => setSelected(null)}
                className="absolute top-4 right-4 p-2 text-text-muted hover:text-white transition-colors"
              >
                <X size={20} />
              </button>

              <div className="flex flex-col items-center text-center">
                <p className="text-xl md:text-2xl font-medium leading-relaxed mb-8">
                  &ldquo;{selected.quote}&rdquo;
                </p>

                <div className="flex items-center gap-4">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-brand-crimson">
                    <img
                      src={selected.image}
                      alt={selected.name}
                      className="absolute inset-0 w-full h-full object-cover object-top"
                    />
                  </div>
                  <div className="text-left">
                    <h4 className="font-bold text-base text-white">
                      {selected.name}
                    </h4>
                    <p className="text-sm text-text-secondary">
                      {selected.role}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Capsule({
  testimonial,
  onClick,
}: {
  testimonial: Testimonial;
  onClick: () => void;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="group flex items-center gap-4 p-2 pr-8 rounded-full bg-surface-card border border-border-subtle hover:border-brand-crimson hover:border-dashed cursor-pointer transition-all shadow-sm hover:shadow-md"
    >
      <div className="relative w-14 h-14 rounded-full overflow-hidden border border-black group-hover:border-brand-crimson transition-colors">
        <img
          src={testimonial.image}
          alt={testimonial.name}
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
      </div>
      <div className="flex flex-col items-start leading-tight">
        <span className="text-sm font-bold text-white">
          {testimonial.name}
        </span>
        <span className="text-xs text-text-secondary">
          {testimonial.role}
        </span>
      </div>
    </motion.div>
  );
}
