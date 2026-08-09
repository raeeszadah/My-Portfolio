import { useState, useEffect, useRef } from 'react';
import { Award, ExternalLink, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getMediaUrl } from '@/lib/api';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';



gsap.registerPlugin(ScrollTrigger);

interface CertificationsProps {
  certifications: any[];
}

export default function Certifications({ certifications }: CertificationsProps) {
  const [activeCert, setActiveCert] = useState<any>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      const cards = sectionRef.current?.querySelectorAll<HTMLElement>('.cert-card');
      if (!cards || cards.length === 0) return;

      cards.forEach((card) => {
        gsap.fromTo(
          card,
          {
            opacity: 0,
            y: 80,
            scale: 0.94,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 92%',
              end: 'top 50%',
              scrub: 0.6,
              toggleActions: 'play reverse play reverse',
            },
          }
        );
      });
    }, sectionRef);

    return () => {
      ctx.revert();
    };
  }, [certifications]);

  return (
    <section
      id="certifications"
      ref={sectionRef}
      className="py-24 max-w-7xl mx-auto px-6 scroll-mt-20 w-full"
    >
      {/* Eyebrow and Header */}
      <div className="flex items-center gap-2 mb-2">
        <span className="h-px w-6 bg-brand-crimson"></span>
        <span className="text-xs font-semibold text-brand-crimson tracking-[0.15em] uppercase">
          CREDENTIALS
        </span>
        <span className="h-px w-6 bg-brand-crimson"></span>
      </div>

      <h2 className="font-display font-black text-3xl md:text-4xl text-white uppercase mb-12">
        CERTIFICATIONS
      </h2>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {certifications.map((cert, index) => {
          const certId = cert.id || cert._id || `cert-${index}`;
          const credentialId = cert.credentialId || cert.credential_id;
          const verificationUrl = cert.verificationUrl || cert.verification_url;
          const skillsList = Array.isArray(cert.skills)
            ? cert.skills
            : (typeof cert.skills === 'string' ? cert.skills.split(',').map((s: string) => s.trim()).filter(Boolean) : []);

          return (
            <div
              key={certId}
              className="cert-card bg-surface-card border border-border-subtle p-6 rounded-2xl hover:border-brand-crimson/40 transition-colors duration-500 flex flex-col justify-between gap-6 shadow-2xl relative group"
            >
              <div className="absolute inset-0 border border-brand-crimson/0 group-hover:border-brand-crimson/30 rounded-2xl pointer-events-none transition-all duration-500 shadow-[0_0_25px_rgba(255,0,27,0.1)]" />

              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 bg-brand-crimson-subtle/20 border border-brand-crimson/20 rounded-lg text-brand-crimson group-hover:bg-brand-crimson group-hover:text-white transition-colors duration-300">
                    <Award className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-base leading-snug uppercase group-hover:text-brand-crimson transition-colors duration-300">
                      {cert.title}
                    </h3>
                    <span className="text-xs text-text-secondary">{cert.issuer}</span>
                  </div>
                </div>

                {credentialId && (
                  <div className="text-[10px] font-mono text-text-muted mb-2 uppercase">
                    ID: {credentialId}
                  </div>
                )}

                <div className="text-xs font-mono text-text-secondary mb-3">{cert.date}</div>

                {/* Skills tags/chips */}
                {skillsList.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border-subtle">
                    {skillsList.map((skill: string, i: number) => (
                      <span
                        key={i}
                        className="text-[9px] font-mono border border-border-subtle text-text-secondary px-2 py-0.5 rounded bg-white/5"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 relative z-10 pt-2">
                {cert.thumbnail && (
                  <Button
                    onClick={() => setActiveCert(cert)}
                    size="sm"
                    variant="outline"
                    className="flex-1 border-border-subtle hover:border-brand-crimson hover:bg-brand-crimson-subtle text-xs gap-1.5 transition-colors duration-300 py-4 cursor-pointer"
                  >
                    <Eye className="size-3.5" />
                    PREVIEW
                  </Button>
                )}
                {verificationUrl && (
                  <a
                    href={verificationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center p-2.5 rounded bg-white/5 border border-border-subtle text-text-secondary hover:text-white hover:border-brand-crimson/30 transition-colors"
                    title="Verify credential"
                  >
                    <ExternalLink className="size-4" />
                  </a>
                )}
              </div>
            </div>
          );
        })}

        {certifications.length === 0 && (
          <div className="col-span-full py-16 text-center text-text-muted">
            No certifications added yet.
          </div>
        )}
      </div>

      {/* Lightbox Preview Modal */}
      {activeCert && (() => {
        const mediaUrl = getMediaUrl(activeCert.thumbnail);
        const isPdf = mediaUrl.toLowerCase().includes('.pdf');

        return (
          <div
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in"
            onClick={() => setActiveCert(null)}
          >
            <div
              className="bg-surface-card border border-border-subtle max-w-4xl w-full max-h-[85vh] rounded-2xl overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b border-border-subtle flex items-center justify-between">
                <div>
                  <h4 className="font-display font-bold text-lg text-white uppercase">
                    {activeCert.title}
                  </h4>
                  <span className="text-xs text-text-secondary">{activeCert.issuer}</span>
                </div>
                <button
                  onClick={() => setActiveCert(null)}
                  className="text-text-muted hover:text-white transition-colors cursor-pointer text-xs font-mono"
                >
                  Close (X)
                </button>
              </div>

              {/* Media Body (Image or PDF) */}
              <div className="flex-1 bg-black overflow-y-auto flex items-center justify-center p-6 min-h-[350px]">
                {isPdf ? (
                  <object
                    data={mediaUrl}
                    type="application/pdf"
                    className="w-full h-[60vh] rounded border border-border-subtle bg-white"
                  >
                    <iframe
                      src={mediaUrl}
                      title={activeCert.title}
                      className="w-full h-[60vh] rounded border border-border-subtle bg-white"
                    />
                  </object>
                ) : (
                  <img
                    src={mediaUrl}
                    alt={activeCert.title}
                    className="max-w-full max-h-[55vh] object-contain rounded"
                  />
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-border-subtle flex justify-between items-center">
                <a
                  href={mediaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-white underline font-mono"
                >
                  <ExternalLink className="size-3.5 text-brand-crimson" />
                  Open Hosted Media File Directly
                </a>

                {(activeCert.verificationUrl || activeCert.verification_url) && (
                  <a
                    href={activeCert.verificationUrl || activeCert.verification_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-bold text-brand-crimson border border-brand-crimson px-4 py-2 rounded hover:bg-brand-crimson hover:text-white transition-colors"
                  >
                    VERIFY ONLINE
                    <ExternalLink className="size-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        );
      })()}


    </section>
  );
}
