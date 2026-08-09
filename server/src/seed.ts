/**
 * Seed script — Mohammad Raees portfolio data for Supabase DB
 * Run: npx ts-node src/seed.ts
 */
import dotenv from 'dotenv';
import path from 'path';
import { supabaseServer } from './config/supabase';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

async function seed() {
  console.log('🚀 Seeding Supabase database (txmbbpvkmmzjgyjiefgh)...');

  // 1. Profile
  const { error: profileErr } = await supabaseServer.from('profiles').upsert([
    {
      name: 'MOHAMMAD RAEES',
      roles: ['Full Stack Developer', 'AI Software Engineer', 'Systems Builder'],
      bio: 'Final-year B.Tech student (Electronics & Computer Engineering, MIT-ADT University) and practising Full Stack Developer with 4+ shipped products and a 4-month internship. Experienced in building AI-powered SaaS platforms, REST APIs, and responsive frontends using MERN Stack, Next.js, TypeScript, and Generative AI. Actively exploring System Design, LLMs, and RAG.',
      availability: 'Available for Full-Time Roles & Internships',
    },
  ]);
  if (profileErr) console.error('Profile seed warning:', profileErr.message);
  else console.log('✅ Profile seeded');

  // 2. Social Links
  const { error: socialErr } = await supabaseServer.from('social_links').upsert([
    { platform: 'LinkedIn', url: 'https://linkedin.com/in/raeeszaadah', username: 'raeeszaadah', published: true, display_order: 1 },
    { platform: 'GitHub', url: 'https://github.com/raeeszadah', username: 'raeeszadah', published: true, display_order: 2 },
    { platform: 'Email', url: 'mailto:mearaees@gmail.com', username: 'mearaees@gmail.com', published: true, display_order: 3 },
    { platform: 'YouTube', url: 'https://youtube.com/@tecoritham', username: 'Tecoritham', published: true, display_order: 4 },
  ]);
  if (socialErr) console.error('Social links seed warning:', socialErr.message);
  else console.log('✅ Social links seeded');

  console.log('\n🎉 Supabase database seed verification complete!');
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
