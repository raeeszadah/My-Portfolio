# Project Roadmap

This roadmap lists the phases, targets, and tracks of the TECORITHAM Portfolio project.

---

## Phase 1: Planning & Scaffold Setup
**Status:** Completed
**Goal:** Establish GSD planning files, mono-repo structure, root configs, and initialize client/server modules.

- [x] Create GSD planning folder and core files (`PROJECT.md`, `REQUIREMENTS.md`, `ROADMAP.md`, `STATE.md`)
- [x] Set up root configurations (`package.json`, `.gitignore`, `.env.example`, `.env`)
- [x] Initialize Express backend in `server/` with TypeScript configuration
- [x] Initialize React + Vite + TypeScript frontend in `client/`
- [x] Configure Tailwind CSS v4 in the client
- [x] Setup shadcn/ui and configure component JSON
- [x] Install GSAP and create test animations

---

## Phase 2: Database & Backend API Implementation
**Status:** Completed
**Goal:** Build database models, controllers, route routing, authentication (JWT + Google OAuth), and CRUD APIs.

- [x] Connect Mongoose to MongoDB
- [x] Create Database models: `User`, `Project`, `Skill`, `Experience`, `Education`, `Certification`, `Achievement`, `Message`, `SocialLink`
- [x] Implement Auth Controller & Middleware (JWT validation, bcrypt password hashing, Google OAuth)
- [x] Implement CRUD APIs for all portfolio dynamic data
- [x] Implement Contact Message API with rate limiting
- [x] Implement File Upload Router (Profile image, Resume PDF, Certificate assets)

---

## Phase 3: Frontend Design System & Theme Layout
**Status:** Planned
**Goal:** Code the brand colors, layout grids, components, and GSAP cursor.

- [ ] Set up Tailwind CSS v4 custom theme matching `DESIGN.md` (colors, typography, radii, spacing)
- [ ] Build global layout components: Sticky Navigation, Mobile Hamburger Menu, Footer (with lock icon)
- [ ] Configure global custom GSAP cursor and basic custom scroll triggers
- [ ] Scaffold empty public pages and routing (`/`, `/admin/login`, `/admin/dashboard`)

---

## Phase 4: Frontend Public Sections
**Status:** Planned
**Goal:** Complete the public portfolio page containing all requirements.

- [ ] Build Hero Section with floating/orbiting tech SVG icons (GSAP floating timeline)
- [ ] Build Tech Marquee component with dual-direction continuous slide (GSAP timeline)
- [ ] Build About Section
- [ ] Build Skills Section with category filter tabs
- [ ] Build Projects Grid with featured projects and standard project cards
- [ ] Build Timeline Section (Experience and Education combined or stacked)
- [ ] Build Certifications Section with Lightbox preview modal
- [ ] Build Achievements Grid
- [ ] Build Contact Form with validation alerts and submit integration

---

## Phase 5: Admin Dashboard CMS
**Status:** Planned
**Goal:** Implement admin authentication views, message inbox, and CRUD panels.

- [ ] Build `/admin/login` page (handling email/password and Google OAuth redirect)
- [ ] Build Dashboard Shell (collapsible sidebar, topbar, mobile drawer)
- [ ] Build Dashboard Overview (count stats, recent messages)
- [ ] Build Content CRUD Panels (Forms with validation and file uploads)
- [ ] Build Message Center (table display, search/filters, mark read, delete)
- [ ] Build Resume Manager (upload/replace active resume PDF)

---

## Phase 6: Verification, SEO & Production Preparation
**Status:** Planned
**Goal:** Auditing, optimizations, and deploying.

- [ ] Implement full SEO metadata, sitemap.xml, robots.txt, and canonical URLs
- [ ] Run Lighthouse audits for performance, accessibility, and SEO
- [ ] Optimize assets and apply lazy loading to off-screen elements
- [ ] Prepare production builds (`npm run build`) for client and server
