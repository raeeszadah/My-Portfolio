import { useState, useEffect, useRef } from 'react';
import { Send, CheckCircle, AlertTriangle, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiFetch } from '@/lib/api';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    profession: 'Recruiter / Hiring Manager',
    subject: '',
    message: '',
  });

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const sectionRef = useRef<HTMLElement>(null);

  // ── GSAP ScrollTrigger Down-to-Up Reveal Animation ────────────────────────
  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      const items = sectionRef.current?.querySelectorAll<HTMLElement>('.contact-reveal-item');
      if (!items || items.length === 0) return;

      items.forEach((item) => {
        gsap.fromTo(
          item,
          {
            opacity: 0,
            y: 80,
            scale: 0.96,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: item,
              start: 'top 92%',
              end: 'top 50%',
              scrub: 0.5,
              toggleActions: 'play reverse play reverse',
            },
          }
        );
      });
    }, sectionRef);

    return () => {
      ctx.revert();
    };
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setStatus('error');
      setErrorMessage('Please fill out all required fields.');
      return;
    }

    setStatus('loading');
    try {
      const res = await apiFetch('contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setFormData({
          name: '',
          email: '',
          profession: 'Recruiter / Hiring Manager',
          subject: '',
          message: '',
        });
      } else {
        setStatus('error');
        setErrorMessage(data.error || 'Failed to submit message.');
      }
    } catch (err) {
      setStatus('error');
      setErrorMessage('Unable to connect to server. Please try again later.');
    }
  };

  return (
    <section id="contact" ref={sectionRef} className="py-24 max-w-4xl mx-auto px-6 scroll-mt-20">
      {/* Eyebrow and Header */}
      <div className="contact-reveal-item flex items-center gap-2 mb-2">
        <span className="h-px w-6 bg-brand-crimson"></span>
        <span className="text-xs font-semibold text-brand-crimson tracking-[0.15em] uppercase">
          CONTACT
        </span>
        <span className="h-px w-6 bg-brand-crimson"></span>
      </div>

      <h2 className="contact-reveal-item font-display font-black text-3xl md:text-4xl text-white uppercase mb-12">
        GET IN TOUCH
      </h2>

      {/* Grid: Info + Form */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
        {/* Info Column */}
        <div className="contact-reveal-item md:col-span-2 flex flex-col gap-6 text-text-secondary bg-surface-card border border-border-subtle p-6 rounded-2xl h-fit shadow-2xl">
          <p className="text-xs leading-relaxed font-body">
            Interested in collaborating, hiring, or discussing technical projects? Drop a message and let's start the dialogue.
          </p>

          <div className="flex flex-col gap-4 text-xs font-mono pt-4 border-t border-border-subtle">
            <div>
              <span className="text-brand-crimson font-bold block uppercase mb-1">LOCATION</span>
              <span className="text-white uppercase">Remote / Worldwide</span>
            </div>
            <div>
              <span className="text-brand-crimson font-bold block uppercase mb-1">EMAIL</span>
              <a
                href="mailto:mearaees@gmail.com"
                className="text-white hover:text-brand-crimson transition-colors flex items-center gap-2 font-semibold"
              >
                <Mail className="size-3.5 text-brand-crimson shrink-0" />
                mearaees@gmail.com
              </a>
            </div>
          </div>
        </div>

        {/* Form Column */}
        <form
          onSubmit={handleSubmit}
          className="contact-reveal-item md:col-span-3 flex flex-col gap-5 select-none bg-surface-card border border-border-subtle p-6 lg:p-8 rounded-2xl shadow-2xl relative group"
        >
          <div className="absolute inset-0 border border-brand-crimson/0 group-hover:border-brand-crimson/30 rounded-2xl pointer-events-none transition-all duration-500 shadow-[0_0_30px_rgba(255,0,27,0.1)]" />

          {status === 'success' && (
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-500 text-xs flex items-center gap-2">
              <CheckCircle className="size-4 shrink-0" />
              <span>Message submitted successfully! I'll get back to you soon.</span>
            </div>
          )}

          {status === 'error' && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-xs flex items-center gap-2">
              <AlertTriangle className="size-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-xs font-medium text-text-secondary">
                NAME
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={status === 'loading'}
                className="w-full bg-surface-elevated border border-border-subtle hover:border-border-active focus:border-brand-crimson text-white placeholder-text-muted rounded-lg px-4 py-3 text-sm focus:outline-none transition-colors duration-200"
                placeholder="John Doe"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-xs font-medium text-text-secondary">
                EMAIL
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={status === 'loading'}
                className="w-full bg-surface-elevated border border-border-subtle hover:border-border-active focus:border-brand-crimson text-white placeholder-text-muted rounded-lg px-4 py-3 text-sm focus:outline-none transition-colors duration-200"
                placeholder="john@example.com"
              />
            </div>
          </div>

          {/* Visitor Profession / Role Dropbox */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="profession" className="text-xs font-medium text-text-secondary">
              YOUR PROFESSION / ROLE
            </label>
            <select
              id="profession"
              name="profession"
              value={formData.profession}
              onChange={handleChange}
              disabled={status === 'loading'}
              className="w-full bg-surface-elevated border border-border-subtle hover:border-border-active focus:border-brand-crimson text-white rounded-lg px-4 py-3 text-sm focus:outline-none transition-colors duration-200 cursor-pointer"
            >
              <option value="Recruiter / Hiring Manager" className="bg-surface-elevated text-white">Recruiter / Hiring Manager</option>
              <option value="Startup Founder / CEO" className="bg-surface-elevated text-white">Startup Founder / CEO</option>
              <option value="Client / Product Owner" className="bg-surface-elevated text-white">Client / Product Owner</option>
              <option value="Software Engineer / Peer" className="bg-surface-elevated text-white">Software Engineer / Peer</option>
              <option value="Student / Researcher" className="bg-surface-elevated text-white">Student / Researcher</option>
              <option value="Other Visitor" className="bg-surface-elevated text-white">Other</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="subject" className="text-xs font-medium text-text-secondary">
              SUBJECT
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              disabled={status === 'loading'}
              className="w-full bg-surface-elevated border border-border-subtle hover:border-border-active focus:border-brand-crimson text-white placeholder-text-muted rounded-lg px-4 py-3 text-sm focus:outline-none transition-colors duration-200"
              placeholder="Project Collaboration"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="message" className="text-xs font-medium text-text-secondary">
              MESSAGE
            </label>
            <textarea
              id="message"
              name="message"
              rows={4}
              value={formData.message}
              onChange={handleChange}
              disabled={status === 'loading'}
              className="w-full bg-surface-elevated border border-border-subtle hover:border-border-active focus:border-brand-crimson text-white placeholder-text-muted rounded-lg px-4 py-3 text-sm focus:outline-none resize-none transition-colors duration-200"
              placeholder="Hi Mohammad, I would love to discuss an engineering project with you..."
            />
          </div>

          <Button
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-brand-crimson text-white hover:bg-brand-crimson-dim py-5 rounded-xl uppercase font-semibold text-xs tracking-wider transition-all duration-300 shadow-[0_0_20px_rgba(255,0,27,0.25)] hover:shadow-[0_0_30px_rgba(255,0,27,0.45)] cursor-pointer flex items-center justify-center gap-2"
          >
            {status === 'loading' ? (
              <span>SENDING...</span>
            ) : (
              <>
                <span>SEND MESSAGE</span>
                <Send className="size-3.5" />
              </>
            )}
          </Button>
        </form>
      </div>
    </section>
  );
}
