# Requirements Mappings

This document translates the requirements from `PRD.md` and `DESIGN.md` into granular, verifiable requirement tags.

## 1. Functional Requirements

### 1.1 Authentication & Authorization
- **[REQ-AUTH-01]** Admin login via email and password (hashed with bcrypt).
- **[REQ-AUTH-02]** Admin login via Google OAuth (authorized emails only; whitelist approach).
- **[REQ-AUTH-03]** JWT token session management stored in secure HttpOnly cookies.
- **[REQ-AUTH-04]** No public registration or sign-up interfaces.
- **[REQ-AUTH-05]** Server-side route validation and authorization on all admin API calls.

### 1.2 Access & Entry Point
- **[REQ-ACCESS-01]** No visible admin links in main public navigation, mobile menu, or hero section.
- **[REQ-ACCESS-02]** Access to the login page (`/admin/login`) is only through a discreet 16px lock/shield icon in the footer bottom bar (right-aligned).

### 1.3 Public Portfolio Content Sections
- **[REQ-PORT-01]** **Hero Section:** Displays name, roles (rotator), bio, CTAs, social links, profile image, and orbiting technology SVGs.
- **[REQ-PORT-02]** **About Section:** Rich text paragraphs describing the owner's profile.
- **[REQ-PORT-03]** **Skills Section:** Displays categorised technical skills with level indicators, category filtering, and visibility toggles.
- **[REQ-PORT-04]** **Projects Section:** Displays featured projects (high visual weight) and standard projects, filtered by category.
- **[REQ-PORT-05]** **Education & Experience:** Timeline-based (vertical) displays on desktop, collapsing to flat card stacks on mobile.
- **[REQ-PORT-06]** **Certifications:** Certificate cards with images, verification links, and a lightbox preview modal.
- **[REQ-PORT-07]** **Achievements:** Section showing publications, awards, open-source highlights.
- **[REQ-PORT-08]** **Resume:** View/download action of the active uploaded resume PDF.
- **[REQ-PORT-09]** **Social Links:** Dynamic social icons representing active platforms (supporting multiple accounts per platform).

### 1.4 Contact System
- **[REQ-CONT-01]** Contact form collecting Name, Email, Subject, and Message, with full validation.
- **[REQ-CONT-02]** Spam protection and rate limiting on the submit endpoint.
- **[REQ-CONT-03]** Submissions stored securely in MongoDB and accessible via the admin dashboard.

### 1.5 Admin Management (CRUD)
- **[REQ-CMS-01]** Edit hero text, bio, social profiles, and upload profile image.
- **[REQ-CMS-02]** Projects CRUD (create, read, update, delete, reorder, feature, publish).
- **[REQ-CMS-03]** Skills & Tech Stack CRUD (categories, levels, reordering).
- **[REQ-CMS-04]** Experience & Education CRUD.
- **[REQ-CMS-05]** Certifications & Achievements CRUD.
- **[REQ-CMS-06]** Resume upload & activation panel.
- **[REQ-CMS-07]** Message Center (view, search, filter, delete, mark read/unread).

---

## 2. Non-Functional & Design Requirements

### 2.1 Visual & UI (DESIGN.md)
- **[REQ-DSN-01]** **Canvas:** Pitch-black background `#000000`.
- **[REQ-DSN-02]** **Accent:** Electric Crimson `#FF001B` used exclusively as highlights, borders, active status, hover glows, and branding.
- **[REQ-DSN-03]** **Fonts:** Orbitron (Display/Headers), Inter (Body/UI), JetBrains Mono (Code/Mono badges).
- **[REQ-DSN-04]** **Depth:** Glow box-shadows (e.g. `rgba(255, 0, 27, 0.12)`) instead of grey drop shadows.
- **[REQ-DSN-05]** **Responsive Layout:** Must support viewports from 320px to 1920px+ without horizontal overflow or overlapping texts.

### 2.2 Performance
- **[REQ-PERF-01]** Fast load times with LCP < 2.5s on Desktop and < 3.5s on Mobile.
- **[REQ-PERF-02]** Core web vitals targeted (Lighthouse Performance > 85).
- **[REQ-PERF-03]** Image optimizations, lazy-loading, and skeleton layout shimmers for all dynamic items.

### 2.3 Security
- **[REQ-SEC-01]** Backend credentials and MongoDB connection strings must remain server-side.
- **[REQ-SEC-02]** Helmet middleware enabled for secure HTTP headers.
- **[REQ-SEC-03]** CORS restricted to verified production client domains.
- **[REQ-SEC-04]** File upload validations (mimetype, size limit of ~5MB).

### 2.4 SEO & Analytics
- **[REQ-SEO-01]** Unique title/meta per route, structured schema markup, sitemap.xml, robots.txt.
- **[REQ-SEO-02]** Google Analytics, Clarity, and Search Console integrations.
- **[REQ-SEO-03]** Exclusion of admin dashboard traffic from public analytics pageviews.
