# PRD.md — TECORITHAM Portfolio Website

**Document Version:** 1.0
**Product Name:** TECORITHAM Portfolio
**Product Type:** Professional Personal Portfolio Website + Private Admin CMS
**Release:** Portfolio Only (v1.0)
**Status:** Production Development
**Last Updated:** 2026-08-08

---

## Table of Contents

1. [Product Vision](#1-product-vision)
2. [Problem Statement](#2-problem-statement)
3. [Target Users](#3-target-users)
4. [Core Features](#4-core-features)
5. [Out of Scope](#5-out-of-scope)
6. [Functional Requirements](#6-functional-requirements)
7. [Non-Functional Requirements](#7-non-functional-requirements)
8. [Success Metrics](#8-success-metrics)
9. [Acceptance Criteria](#9-acceptance-criteria)
10. [Future Roadmap](#10-future-roadmap)

---

## 1. Product Vision

> **TECORITHAM Portfolio** is a premium professional portfolio platform that lets the world know who you are, what you build, and how to reach you — without ever touching source code again.

The portfolio must function as a living professional identity: always current, always premium, always reflecting the real capabilities and achievements of the owner. It is not a static landing page. It is a content-managed, production-grade personal brand platform.

The visitor experience must communicate, in order:

```
Who I am → What I build → What I know → What I have achieved → How to contact me
```

The admin experience must allow the owner to update any piece of that story — project, skill, certificate, experience — from a private dashboard, with the design and animations remaining untouched.

---

## 2. Problem Statement

| Pain Point | Impact |
|---|---|
| Hardcoded portfolio content requires source-code edits for every update | Owner cannot update their own portfolio without technical intervention |
| Static portfolios go stale quickly | Recruiters and collaborators see outdated projects, missing skills, or old experience |
| No centralized admin system | Resume, certificates, and social links must be updated by hand across multiple files |
| Generic portfolio templates do not represent a strong personal brand | Professional identity is weakened when the portfolio looks like everyone else's |
| No contact message management | Visitor inquiries are lost or untracked |

**The solution** is a portfolio with a clean separation between dynamic content (managed by the admin) and the fixed premium design and animation system (controlled by code). Content updates should never break the visual experience.

---

## 3. Target Users

### 3.1 Primary User — Portfolio Owner (Admin)

The owner is the only administrator.

**Goals:**
- Present a professional identity to the world
- Keep portfolio content current without modifying source code
- Track and respond to visitor contact messages
- Control which projects, skills, and certifications are publicly visible

**Behaviors:**
- Logs in through a private footer admin icon
- Manages content through a dashboard
- Uploads resume, certificates, and project assets
- Controls display order and visibility of all content

---

### 3.2 Public Visitors

Public visitors do not require an account. They are read-only consumers of the portfolio.

| Visitor Type | Primary Goal |
|---|---|
| Recruiter / HR | Evaluate candidate's profile, skills, and experience |
| Software Engineer / Developer | Explore projects, tech stack, and open-source contributions |
| Founder / Company | Assess capability and fit for collaboration or hiring |
| Client | Understand services, past work, and how to make contact |
| Hackathon Organizer | Review achievements, skills, and project history |
| Student / Peer | Learn from the portfolio structure and project implementations |
| Professional Connection | Find social profiles and contact information |

**Public visitor capabilities:**
- Browse all published portfolio sections
- View projects, skills, education, certifications, experience, achievements
- View and download resume
- Submit a contact message
- Access social profiles

---

## 4. Core Features

### 4.1 Public Portfolio

| # | Feature | Description |
|---|---|---|
| F-01 | Hero Section | Owner name, professional role, introduction, CTA buttons, social links, profile image |
| F-02 | About Section | Professional summary, technical focus, engineering interests |
| F-03 | Skills Section | Categorised technical skills with icons, level, and visibility control |
| F-04 | Tech Stack Display | Dedicated technology representation with marquee/visual treatment |
| F-05 | Projects Section | Featured and all projects with descriptions, images, links, and technology badges |
| F-06 | Education Section | Academic history with institution, degree, dates, and milestones |
| F-07 | Certifications Section | Certificates with images, credential IDs, verification links |
| F-08 | Experience Section | Professional work history with role, company, responsibilities, technologies |
| F-09 | Achievements Section | Hackathons, awards, publications, open-source milestones |
| F-10 | Resume | Active resume download or view action |
| F-11 | Social Links | Dynamic multi-platform social profiles with multiple accounts per platform |
| F-12 | Contact Form | Visitor submission form with validation and spam protection |
| F-13 | Navigation | Sticky responsive navigation with mobile hamburger menu |
| F-14 | Footer | Brand footer with logo, links, social icons, and hidden admin access entry |

---

### 4.2 Private Admin Dashboard

| # | Feature | Description |
|---|---|---|
| A-01 | Admin Authentication | Email/password login + authorized Google OAuth only |
| A-02 | Dashboard Overview | Snapshot of total projects, messages, resume status, recent updates |
| A-03 | Profile Management | Edit owner name, bio, roles, profile image, introduction |
| A-04 | Project Management | Full CRUD, publish/unpublish, featured flag, display order |
| A-05 | Skills Management | Full CRUD, category, icon, visibility, display order |
| A-06 | Tech Stack Management | Manage displayed technologies independently of skills |
| A-07 | Education Management | Full CRUD with institution logo, milestones, dates |
| A-08 | Certification Management | Full CRUD with image/PDF upload, credential ID, verification URL |
| A-09 | Experience Management | Full CRUD with company logo, responsibilities, technologies |
| A-10 | Achievement Management | Full CRUD with category, image, verification URL |
| A-11 | Resume Management | Upload, replace, remove active resume; view upload date |
| A-12 | Social Links Management | Multi-platform, multi-account management with order and visibility |
| A-13 | Gallery Management | Upload, title, reorder, publish/unpublish gallery images |
| A-14 | Contact Messages | View, mark read/unread, delete, search, and filter messages |
| A-15 | Website Settings | Basic global configuration (site title, meta, toggles) |

---

### 4.3 Content Management Principle

> **Content is dynamic. Design is stable.**

This is the core architectural requirement of the product.

When an admin updates content:
- Text changes ✅
- Images change ✅
- Links update ✅
- Layouts remain intact ✅
- Animations remain intact ✅
- Brand identity remains intact ✅

No content update should ever alter, remove, or break the UI layer.

---

### 4.4 File Management

The system must support file uploads for:

| File Type | Used For |
|---|---|
| Profile image | Hero section, about section |
| Resume (PDF) | Public resume download/view |
| Certificate images | Certification cards |
| Certificate PDFs | Certification detail view |
| Project images | Project cards and detail |
| Gallery images | Gallery section |

All uploads must be validated for file type, extension, size, and upload permissions.

---

## 5. Out of Scope

The following must **not** be implemented in this release.

| Feature | Reason |
|---|---|
| Notes marketplace / selling | Future product module |
| Course selling platform | Future product module |
| Learning management system | Future product module |
| Student or instructor accounts | Future product module |
| Agency management system | Future product module |
| Client portal or dashboard | Future product module |
| E-commerce / payment gateway | Future product module |
| Subscription system | Future product module |
| Digital product marketplace | Future product module |
| Public user registration | Not applicable in current scope |
| Community or forum features | Future product module |

The architecture must remain extensible enough that these modules can be added later without a full rebuild.

---

## 6. Functional Requirements

### 6.1 Authentication and Authorization

| ID | Requirement |
|---|---|
| AUTH-01 | Admin login via email and password |
| AUTH-02 | Admin login via Google OAuth (authorized emails only) |
| AUTH-03 | Unauthorized Google accounts must be rejected |
| AUTH-04 | No public registration or signup |
| AUTH-05 | Sessions managed via JWT stored in HTTP-only cookies |
| AUTH-06 | JWT must expire and force re-authentication |
| AUTH-07 | Passwords must be hashed with bcrypt |
| AUTH-08 | All admin APIs must independently validate authorization server-side |
| AUTH-09 | Frontend route protection is supplementary, not the sole security layer |

---

### 6.2 Admin Access Entry Point

| ID | Requirement |
|---|---|
| ACCESS-01 | Admin login link must NOT appear in the public navigation |
| ACCESS-02 | Admin login link must NOT appear in the Hero section |
| ACCESS-03 | Admin login link must NOT appear in the mobile menu |
| ACCESS-04 | Admin access must be available only through a discreet icon in the footer |
| ACCESS-05 | Clicking the footer admin icon navigates to `/admin/login` |
| ACCESS-06 | The footer icon is an entry point only, not a security mechanism |

---

### 6.3 Contact Form

| ID | Requirement |
|---|---|
| CONTACT-01 | Visitors can submit name, email, subject, and message |
| CONTACT-02 | All fields must be validated before submission |
| CONTACT-03 | Invalid submissions must be rejected with clear feedback |
| CONTACT-04 | Valid submissions must be stored in the database |
| CONTACT-05 | Rate limiting must be applied to prevent spam |
| CONTACT-06 | Admin can view all messages in the dashboard |
| CONTACT-07 | Admin can mark messages read or unread |
| CONTACT-08 | Admin can delete messages |
| CONTACT-09 | Admin can search and filter messages |

---

### 6.4 Resume

| ID | Requirement |
|---|---|
| RESUME-01 | Admin can upload a resume file |
| RESUME-02 | Admin can replace the active resume |
| RESUME-03 | Admin can remove the resume |
| RESUME-04 | Admin can set which resume is active |
| RESUME-05 | Only the active resume is shown publicly |
| RESUME-06 | Public site provides a resume action (download or view) |
| RESUME-07 | Resume access behavior is configurable at the backend level |

---

### 6.5 Social Links

| ID | Requirement |
|---|---|
| SOCIAL-01 | Admin can add unlimited social platform accounts |
| SOCIAL-02 | Multiple accounts from the same platform are supported |
| SOCIAL-03 | Each account has platform name, username, URL, icon, type, and status |
| SOCIAL-04 | Only active accounts appear publicly |
| SOCIAL-05 | Display order is admin-controlled |
| SOCIAL-06 | New platforms can be added without modifying source code |

---

### 6.6 Navigation

| ID | Requirement |
|---|---|
| NAV-01 | Desktop navigation is sticky and always visible |
| NAV-02 | Mobile navigation uses a hamburger menu |
| NAV-03 | Mobile menu opens as a full-screen or controlled overlay |
| NAV-04 | Body scrolling is locked when mobile menu is open |
| NAV-05 | Mobile menu closes on: navigation click, outside click, Escape key, close button |
| NAV-06 | Background content is not visibly exposed behind open mobile menu |

---

## 7. Non-Functional Requirements

### 7.1 Performance

| ID | Requirement |
|---|---|
| PERF-01 | Website must load fast on desktop and mobile networks |
| PERF-02 | Animations must target 60 FPS where practical |
| PERF-03 | Images must be optimized and lazy-loaded where appropriate |
| PERF-04 | API calls must be minimized and efficient |
| PERF-05 | MongoDB queries must be indexed where beneficial |
| PERF-06 | Architecture must comfortably support ~5,000 concurrent visitors |
| PERF-07 | Code splitting must be applied where appropriate |

---

### 7.2 Security

| ID | Requirement |
|---|---|
| SEC-01 | Frontend must never directly connect to MongoDB |
| SEC-02 | All MongoDB credentials must remain server-side |
| SEC-03 | JWT secrets must never be exposed to the frontend |
| SEC-04 | Admin OAuth secrets must never be exposed to the frontend |
| SEC-05 | HTTP-only cookies must be used for session storage |
| SEC-06 | Secure cookies must be enabled in production |
| SEC-07 | CORS must be restricted to the production frontend origin |
| SEC-08 | Helmet must be used for HTTP security headers |
| SEC-09 | Rate limiting must be applied to public-facing APIs |
| SEC-10 | All user input must be validated and sanitized server-side |
| SEC-11 | Uploaded files must be validated for type, size, and extension |

---

### 7.3 Responsive Design

The public portfolio must be fully functional and visually intact at:

`320px · 360px · 375px · 390px · 430px · 768px · 1024px · 1280px · 1440px · 1920px`

| ID | Requirement |
|---|---|
| RES-01 | No horizontal overflow at any breakpoint |
| RES-02 | No overlapping elements at any breakpoint |
| RES-03 | No clipped or hidden critical content |
| RES-04 | Navigation must work correctly on all breakpoints |
| RES-05 | All interactive elements must be accessible on touch devices |
| RES-06 | Features must adapt for small screens, not be hidden entirely |

---

### 7.4 Accessibility

| ID | Requirement |
|---|---|
| ACC-01 | Target WCAG AA compliance principles |
| ACC-02 | All interactive elements must support keyboard navigation |
| ACC-03 | All images must include descriptive alt text |
| ACC-04 | Colour contrast must meet AA ratios |
| ACC-05 | ARIA labels must be applied where appropriate |
| ACC-06 | Decorative animations must not interfere with screen readers |
| ACC-07 | `prefers-reduced-motion` must be respected |
| ACC-08 | Contact form must be accessible and labelled correctly |

---

### 7.5 SEO

| ID | Requirement |
|---|---|
| SEO-01 | Unique page title per route |
| SEO-02 | Meta description |
| SEO-03 | Open Graph metadata for social sharing |
| SEO-04 | Twitter/X card metadata |
| SEO-05 | Canonical URL |
| SEO-06 | XML Sitemap |
| SEO-07 | Robots.txt |
| SEO-08 | Semantic HTML with correct heading hierarchy |
| SEO-09 | Alt text on all meaningful images |
| SEO-10 | Structured data for professional profile where appropriate |

---

### 7.6 Analytics

| ID | Requirement |
|---|---|
| ANLX-01 | Google Analytics integration supported |
| ANLX-02 | Google Search Console integration supported |
| ANLX-03 | Microsoft Clarity integration supported |
| ANLX-04 | Admin pages must not generate public analytics events |
| ANLX-05 | No unnecessary personal data must be collected |

---

### 7.7 Error Handling

| ID | Requirement |
|---|---|
| ERR-01 | API failures must not crash the entire page |
| ERR-02 | Each section must handle its own loading, empty, and error states |
| ERR-03 | Admin dashboard must display clear success and error feedback |
| ERR-04 | Form validation errors must be clearly communicated |
| ERR-05 | Empty content states must show friendly placeholder messages |

---

### 7.8 Production Deployment

| ID | Requirement |
|---|---|
| PROD-01 | Frontend and backend must be independently deployable |
| PROD-02 | Environment variables must be externally configurable |
| PROD-03 | HTTPS must be supported |
| PROD-04 | Secure cookies must be enabled in production |
| PROD-05 | Production CORS must restrict to the live frontend origin |
| PROD-06 | No secrets must be hardcoded in source code |
| PROD-07 | A `.env.example` file must be provided without real credentials |

---

## 8. Success Metrics

### 8.1 Product Health Metrics

| Metric | Target | Measurement Method |
|---|---|---|
| Page load time (desktop) | < 2.5s LCP | Google PageSpeed Insights |
| Page load time (mobile) | < 3.5s LCP | Google PageSpeed Insights |
| Performance score | > 85 (Lighthouse) | Lighthouse audit |
| Accessibility score | > 90 (Lighthouse) | Lighthouse audit |
| SEO score | > 90 (Lighthouse) | Lighthouse audit |
| Animation frame rate | ≥ 60 FPS on modern devices | Chrome DevTools |
| Build success | 100% clean builds | CI / local build |
| Critical runtime errors | 0 in production | Console / error monitoring |

---

### 8.2 Admin Experience Metrics

| Metric | Target |
|---|---|
| Time to update a project | < 3 minutes from login to publish |
| Time to upload a new certificate | < 2 minutes |
| Time to replace resume | < 1 minute |
| Admin dashboard usability | Owner can complete any content task without referencing documentation |
| Auth security | 0 unauthorized admin logins |
| Unauthorized API access | 0 successful unauthorized API calls |

---

### 8.3 Visitor Engagement Metrics

| Metric | Baseline Goal | Measurement |
|---|---|---|
| Contact form submissions | Track volume over time | Database / Analytics |
| Resume download / view interactions | Track per session | Analytics events |
| Project card interactions | Track clicks per project | Analytics events |
| Average session duration | > 1 minute 30 seconds | Google Analytics |
| Bounce rate | < 60% | Google Analytics |
| Social link click-throughs | Track per platform | Analytics events |
| Search impressions | Increase month-over-month | Google Search Console |

---

### 8.4 Operational Metrics

| Metric | Target |
|---|---|
| Uptime | ≥ 99.5% |
| API response time (median) | < 300ms |
| Admin CRUD success rate | 100% without data loss |
| File upload success rate | > 99% for valid files |
| Contact form delivery rate | > 99% of valid submissions stored |

---

## 9. Acceptance Criteria

The product is considered **done** when all of the following pass.

### 9.1 Public Website

- [ ] Portfolio loads without errors
- [ ] Hero, About, Skills, Projects, Education, Certifications, Experience, Achievements, Contact all render
- [ ] All content is served from the database, not hardcoded
- [ ] Resume action works correctly
- [ ] Social links open correct external profiles
- [ ] Contact form validates, submits, and confirms to the visitor
- [ ] Website is fully responsive at all defined breakpoints
- [ ] Existing animations and design are intact
- [ ] SEO metadata is present on the public route
- [ ] No horizontal overflow on any device
- [ ] No critical console errors

### 9.2 Admin Dashboard

- [ ] Admin login via email/password works
- [ ] Admin login via Google OAuth works for authorized email
- [ ] Unauthorized Google account is rejected
- [ ] Public signup/registration does not exist
- [ ] Footer admin icon navigates to `/admin/login`
- [ ] Manually visiting `/admin/dashboard` without auth redirects to login
- [ ] All CRUD operations work for: Projects, Skills, Education, Certifications, Experience, Achievements, Social Links, Gallery, Resume
- [ ] Resume can be uploaded, replaced, and removed
- [ ] Contact messages can be viewed, marked, and deleted
- [ ] Content updates reflect on the public site without breaking the UI

### 9.3 Security

- [ ] Unauthenticated API requests to admin endpoints return 401 or 403
- [ ] MongoDB URI is not accessible from the frontend
- [ ] JWT secret is not accessible from the frontend
- [ ] File uploads with invalid type or size are rejected
- [ ] Rate limiting is active on the contact endpoint

### 9.4 Production Build

- [ ] `npm run build` completes without errors
- [ ] Production build serves all public routes correctly
- [ ] Environment variables work correctly in production mode
- [ ] No secrets are hardcoded in the compiled output

---

## 10. Future Roadmap

The following modules are **planned for future releases** and are explicitly excluded from v1.0.

| Module | Description |
|---|---|
| Notes Platform | Sell and distribute study notes |
| Course Platform | Create and sell video courses |
| Learning Management System | Student accounts, progress tracking |
| Agency Services Module | Service listings, client inquiry flow |
| Client Portal | Private client dashboard |
| Digital Products Marketplace | Sell templates, tools, assets |
| Payment Gateway | Stripe or Razorpay integration |
| Subscription System | Recurring revenue for content |

The v1.0 architecture must not prevent these from being added. It must simply not implement them.

---

## Document Relationships

This PRD describes **what** the product must do.

The following companion documents describe **how** it is implemented:

| Document | Covers |
|---|---|
| `DESIGN.md` | Visual identity, color system, typography, component specs |
| `MOTION_DESIGN_SYSTEM.md` | Animation principles, Framer Motion and GSAP implementation |
| `APP_FLOW.md` | User flows, navigation structure, admin workflows |
| `ARCHITECTURE.md` | Tech stack decisions, folder structure, API design |
| `DATABASE.md` | MongoDB schema, collections, indexing strategy |
| `API_DOCUMENTATION.md` | REST endpoint reference, request/response contracts |
| `DEPLOYMENT.md` | Environment setup, deployment pipeline, hosting configuration |
| `SECURITY.md` | Security implementation details, auth flow |

---

*PRD.md — TECORITHAM Portfolio v1.0 · Owned by TECORITHAM*
