import React from 'react';
import { 
  Code, 
  Cpu, 
  Terminal, 
  Database, 
  Server, 
  Layers, 
  Globe, 
  Workflow, 
  Zap, 
  Box, 
  Lock, 
  Video, 
  Sparkles,
  Cloud,
  FileCode
} from 'lucide-react';

export function getTechIcon(name: string, className: string = 'size-5'): React.ReactNode {
  const n = (name || '').toLowerCase().trim();

  // 1. React
  if (n.includes('react')) {
    return (
      <svg viewBox="-11.5 -10.23174 23 20.46348" className={className} fill="currentColor">
        <circle cx="0" cy="0" r="2.05" fill="#61dafb" />
        <g stroke="#61dafb" strokeWidth="1" fill="none">
          <ellipse rx="11" ry="4.2" />
          <ellipse rx="11" ry="4.2" transform="rotate(60)" />
          <ellipse rx="11" ry="4.2" transform="rotate(120)" />
        </g>
      </svg>
    );
  }

  // 2. TypeScript
  if (n.includes('typescript') || n === 'ts') {
    return (
      <svg viewBox="0 0 128 128" className={className} fill="currentColor">
        <path fill="#3178c6" d="M1.5 1.5h125v125H1.5z"/>
        <path fill="#fff" d="M98.6 111.4c-4.4 2.8-10.2 4.4-17.4 4.4-15.6 0-25.2-7.8-25.2-24.6V63.6H42V49h14V27.4l20-4.8V49h22v14.6H76v27.2c0 6.6 3.4 9.8 8.8 9.8 3.8 0 6.8-.8 9.2-2.2l4.6 12.8z"/>
      </svg>
    );
  }

  // 3. JavaScript
  if (n.includes('javascript') || n === 'js') {
    return (
      <svg viewBox="0 0 128 128" className={className}>
        <path fill="#f7df1e" d="M1.5 1.5h125v125H1.5z"/>
        <path fill="#000" d="M67.3 100c3.2 5.5 7.6 9.4 15.3 9.4 6.5 0 10.7-3.2 10.7-7.6 0-5.3-4.3-7.4-11.4-10.5l-3.9-1.7c-11.3-4.8-18.8-10.8-18.8-23.4 0-11.6 8.9-20.4 22.8-20.4 9.9 0 16.9 3.4 21.6 11.6l-10 6.4c-2.7-4.4-6-6.2-11.5-6.2-5 0-8.3 2.6-8.3 6.2 0 4.2 2.6 6.1 9.4 9.1l3.9 1.7c13.3 5.7 20.9 11.4 20.9 24.3 0 13.9-10.8 21.8-26.3 21.8-14.7 0-23.7-7.2-28-15.8l9.6-5.3zm-39.7 1c2.5 4.5 5.8 8.3 11.9 8.3 5.3 0 8.7-2.6 8.7-12.7V46.6h14.5v50.2c0 18.2-10.7 25.8-25.7 25.8-12.4 0-20.4-6.3-24.4-14.7l15-6.9z"/>
      </svg>
    );
  }

  // 4. Node.js
  if (n.includes('node')) {
    return (
      <svg viewBox="0 0 128 128" className={className}>
        <path fill="#539e43" d="M64 12.8L13 42.3v59.1l51 29.5 51-29.5V42.3L64 12.8zm36.5 80.7L64 114.6 27.5 93.5V51.3L64 30.2l36.5 21.1v42.2z"/>
      </svg>
    );
  }

  // 5. Express
  if (n.includes('express')) {
    return <Server className={`${className} text-neutral-300`} />;
  }

  // 6. Next.js
  if (n.includes('next')) {
    return (
      <svg viewBox="0 0 128 128" className={className} fill="currentColor">
        <path fill="#fff" d="M64 0C28.7 0 0 28.7 0 64s28.7 64 64 64 64-28.7 64-64S99.3 0 64 0zm27.4 93.8L46.6 38h-8v52h8.3V52.7l38.2 47.9c-6.2 4.4-13.8 7.2-22.1 7.2-20.4 0-37-16.6-37-37s16.6-37 37-37 37 16.6 37 37c0 8.3-2.8 15.9-7.6 22zm-7.4-4.8V38h8.3v51h-8.3z"/>
      </svg>
    );
  }

  // 7. Tailwind CSS
  if (n.includes('tailwind')) {
    return (
      <svg viewBox="0 0 128 128" className={className}>
        <path fill="#38bdf8" d="M64 25.6c-17.1 0-27.7 8.5-32 25.6 6.4-8.5 13.9-11.7 22.4-9.6 4.9 1.2 8.4 4.8 12.3 8.8 6.3 6.4 13.6 13.8 29.3 13.8 17.1 0 27.7-8.5 32-25.6-6.4 8.5-13.9 11.7-22.4 9.6-4.9-1.2-8.4-4.8-12.3-8.8-6.3-6.4-13.6-13.8-29.3-13.8zM32 64c-17.1 0-27.7 8.5-32 25.6 6.4-8.5 13.9-11.7 22.4-9.6 4.9 1.2 8.4 4.8 12.3 8.8 6.3 6.4 13.6 13.8 29.3 13.8 17.1 0 27.7-8.5 32-25.6-6.4 8.5-13.9 11.7-22.4 9.6-4.9-1.2-8.4-4.8-12.3-8.8-6.3-6.4-13.6-13.8-29.3-13.8z"/>
      </svg>
    );
  }

  // 8. PostgreSQL
  if (n.includes('postgres') || n.includes('pg')) {
    return <Database className={`${className} text-sky-400`} />;
  }

  // 9. MongoDB
  if (n.includes('mongo')) {
    return <Database className={`${className} text-emerald-500`} />;
  }

  // 10. Docker
  if (n.includes('docker')) {
    return <Box className={`${className} text-sky-400`} />;
  }

  // 11. AWS / Amazon
  if (n.includes('aws') || n.includes('amazon')) {
    return <Cloud className={`${className} text-amber-500`} />;
  }

  // 12. Python
  if (n.includes('python')) {
    return (
      <svg viewBox="0 0 128 128" className={className}>
        <path fill="#3776ab" d="M63.5 8c-29.4 0-27.6 12.8-27.6 12.8l.1 13.2h28.1v4H24.3S8 36.2 8 65.8s14.2 28.6 14.2 28.6h8.5V81.3s-.5-15.6 15.3-15.6h26.4s14.8.2 14.8-14.3V23s2.2-15-25.7-15zM48 24.3c-3 0-5.4-2.4-5.4-5.4s2.4-5.4 5.4-5.4 5.4 2.4 5.4 5.4-2.4 5.4-5.4 5.4z"/>
        <path fill="#ffd43b" d="M64.5 120c29.4 0 27.6-12.8 27.6-12.8l-.1-13.2H63.9v-4h39.8s16.3 1.8 16.3-27.8-14.2-28.6-14.2-28.6h-8.5v13.1s.5 15.6-15.3 15.6H55.6s-14.8-.2-14.8 14.3V105s-2.2 15 23.7 15zm15.5-16.3c3 0 5.4 2.4 5.4 5.4s-2.4 5.4-5.4 5.4-5.4-2.4-5.4-5.4 2.4-5.4 5.4-5.4z"/>
      </svg>
    );
  }

  // 13. OpenAI / AI / LLM
  if (n.includes('openai') || n.includes('ai') || n.includes('llm') || n.includes('prompt')) {
    return <Sparkles className={`${className} text-brand-crimson`} />;
  }

  // 14. Git / GitHub
  if (n.includes('git')) {
    return <Workflow className={`${className} text-orange-500`} />;
  }

  // 15. Figma
  if (n.includes('figma')) {
    return <Layers className={`${className} text-purple-400`} />;
  }

  // 16. GSAP / GreenSock
  if (n.includes('gsap') || n.includes('greensock')) {
    return <Zap className={`${className} text-emerald-400`} />;
  }

  // 17. Framer Motion / Framer
  if (n.includes('framer')) {
    return <Layers className={`${className} text-cyan-400`} />;
  }

  // 18. Vite
  if (n.includes('vite')) {
    return <Zap className={`${className} text-yellow-400`} />;
  }

  // 19. C++ / C
  if (n.includes('cplusplus') || n.includes('c++')) {
    return <Code className={`${className} text-blue-500`} />;
  }

  // 20. GraphQL
  if (n.includes('graphql')) {
    return <Globe className={`${className} text-pink-500`} />;
  }

  // 21. HTML5 / CSS3
  if (n.includes('html') || n.includes('css')) {
    return <FileCode className={`${className} text-orange-400`} />;
  }

  // 22. Android / Java
  if (n.includes('android') || n.includes('java')) {
    return <Terminal className={`${className} text-emerald-400`} />;
  }

  // 23. Flutter
  if (n.includes('flutter')) {
    return <Layers className={`${className} text-sky-400`} />;
  }

  // 24. Inngest
  if (n.includes('inngest')) {
    return <Server className={`${className} text-cyan-400`} />;
  }

  // 25. Clerk
  if (n.includes('clerk')) {
    return <Lock className={`${className} text-indigo-400`} />;
  }

  // 26. Convex
  if (n.includes('convex')) {
    return <Database className={`${className} text-amber-400`} />;
  }

  // 27. Remotion
  if (n.includes('remotion')) {
    return <Video className={`${className} text-blue-400`} />;
  }

  // Generic Fallback Category Matching
  if (n.includes('db') || n.includes('sql')) {
    return <Database className={`${className} text-neutral-400`} />;
  }

  if (n.includes('api') || n.includes('server') || n.includes('backend')) {
    return <Server className={`${className} text-neutral-400`} />;
  }

  if (n.includes('system') || n.includes('arch') || n.includes('design')) {
    return <Cpu className={`${className} text-brand-crimson`} />;
  }

  // Default Code Icon
  return <Code className={`${className} text-neutral-300`} />;
}
