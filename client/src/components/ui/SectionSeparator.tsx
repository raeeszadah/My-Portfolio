export default function SectionSeparator() {
  return (
    <div className="w-full flex items-center justify-center my-4 py-2 select-none pointer-events-none relative z-20">
      <div className="w-full max-w-5xl px-6 flex items-center justify-center">
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-brand-crimson/50 to-transparent shadow-[0_0_8px_rgba(255,0,27,0.35)] relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-1.5 rounded-full bg-brand-crimson shadow-[0_0_8px_rgba(255,0,27,0.8)]" />
        </div>
      </div>
    </div>
  );
}
