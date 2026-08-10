import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import Cursor from '@/components/Cursor';
import { apiFetch } from '@/lib/api';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Public view components
import Hero from '@/components/public/Hero';
import Marquee from '@/components/public/Marquee';
import About from '@/components/public/About';
import Skills from '@/components/public/Skills';
import Projects from '@/components/public/Projects';
import Contact from '@/components/public/Contact';
import Testimonial2 from '@/components/ui/testimonial-section-2';
import SectionSeparator from '@/components/ui/SectionSeparator';

// Admin view components
import Login from '@/components/admin/Login';
import DashboardShell from '@/components/admin/DashboardShell';

gsap.registerPlugin(ScrollTrigger);

function Home() {
  const [profile, setProfile] = useState<any>(null);
  const [skills, setSkills] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<any>({ experience: [], education: [] });
  const [certifications, setCertifications] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  // ── Global Lenis Smooth Scrolling Engine ────────────────────────────────
  useEffect(() => {
    const lenis = new Lenis({
      duration: 0.8,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -8 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.45,
      touchMultiplier: 0.6,
      infinite: false,
    });


    lenis.on('scroll', ScrollTrigger.update);

    const tickerCb = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tickerCb);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tickerCb);
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    // Parallel fetching public portfolio data
    Promise.all([
      apiFetch('profile'),
      apiFetch('skills'),
      apiFetch('projects'),
      apiFetch('timeline'),
      apiFetch('certifications'),
    ])
      .then(async ([pRes, sRes, prRes, tRes, cRes]) => {
        const pData = await pRes.json();
        const sData = await sRes.json();
        const prData = await prRes.json();
        const tData = await tRes.json();
        const cData = await cRes.json();

        if (pData.profile) setProfile(pData.profile);
        setSkills(sData);
        setProjects(prData);
        setTimeline(tData);
        setCertifications(cData);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching landing page data:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4 animate-pulse">
        <img src="/logo.png" alt="TECORITHAM" className="h-12 w-auto object-contain" />
        <span className="font-mono text-xs text-text-secondary uppercase tracking-widest">Loading Profile...</span>
      </div>
    );
  }

  return (
    <Layout>
      <Hero profile={profile} />
      <Marquee />
      <SectionSeparator />
      <About profile={profile} timeline={timeline} certifications={certifications} />
      <SectionSeparator />
      <Skills skills={skills} />
      <SectionSeparator />
      <Projects projects={projects} />
      <Testimonial2 />
      <SectionSeparator />
      <Contact />
    </Layout>
  );
}

function App() {
  return (
    <BrowserRouter>
      {/* Glow Cursor */}
      <Cursor />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />

        {/* Private Access Admin Routes */}
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin/dashboard/*" element={<DashboardShell />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

