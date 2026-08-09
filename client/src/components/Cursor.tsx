import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function Cursor() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    // Smooth position interpolation
    const xTo = gsap.quickTo(cursor, 'x', { duration: 0.15, ease: 'power2.out' });
    const yTo = gsap.quickTo(cursor, 'y', { duration: 0.15, ease: 'power2.out' });

    const onMouseMove = (e: MouseEvent) => {
      xTo(e.clientX - 10);
      yTo(e.clientY - 10);
    };

    const onMouseEnter = () => {
      gsap.to(cursor, { scale: 2.0, backgroundColor: 'rgba(255, 0, 27, 0.2)', duration: 0.2 });
    };

    const onMouseLeave = () => {
      gsap.to(cursor, { scale: 1.0, backgroundColor: 'rgba(255, 0, 27, 0.45)', duration: 0.2 });
    };

    window.addEventListener('mousemove', onMouseMove);

    const interactives = document.querySelectorAll('button, a, input, textarea, select');
    interactives.forEach((el) => {
      el.addEventListener('mouseenter', onMouseEnter);
      el.addEventListener('mouseleave', onMouseLeave);
    });

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      interactives.forEach((el) => {
        el.removeEventListener('mouseenter', onMouseEnter);
        el.removeEventListener('mouseleave', onMouseLeave);
      });
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className="hidden md:block fixed top-0 left-0 size-5 rounded-full bg-brand-crimson/45 shadow-[0_0_15px_rgba(255,0,27,0.8)] pointer-events-none z-50"
    />
  );
}
