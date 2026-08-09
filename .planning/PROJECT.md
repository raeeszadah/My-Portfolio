# Project: TECORITHAM Portfolio (v1.0)

## Overview
**TECORITHAM Portfolio** is a premium, professional personal portfolio + private admin CMS. It separates stable premium visual design and GSAP animation from dynamic content managed in a secure backend.

## Tech Stack
- **Frontend:** React, Vite, TypeScript, Tailwind CSS v4, shadcn/ui, GSAP, Framer Motion
- **Backend:** Node.js, Express, TypeScript, Mongoose/MongoDB
- **Database:** MongoDB
- **Authentication:** Email/Password & Google OAuth, managed via JWT in HttpOnly cookies
- **File Uploads:** Local uploads or cloud-hosted with validation (PDFs, Images)

## Visual Constraints (per DESIGN.md)
- **Canvas:** Pitch-black background (`#000000`)
- **Accent:** Electric Crimson (`#FF001B`), used sparingly (hover states, brand mark, glow effects)
- **Secondary Text:** Graphite/Grey (`#A0A0A0` / `#555555`)
- **Primary Text:** White (`#FFFFFF`)
- **Typography:** Orbitron (headings), Inter (body, UI), JetBrains Mono (code/mono labels)
- **Glow System:** Replaces traditional drop shadows (e.g. `0 0 20px rgba(255, 0, 27, 0.12)`)

## Folder Structure
```
/
├── .planning/                  # GSD planning directory
│   ├── PROJECT.md              # Project details & stack (this file)
│   ├── REQUIREMENTS.md         # Granular project requirements
│   ├── ROADMAP.md              # Phased milestones & tracks
│   └── STATE.md                # Living status and session tracker
├── client/                     # Vite React Frontend
│   ├── src/
│   │   ├── components/         # Reusable shadcn/custom components
│   │   ├── styles/             # Tailwind global style rules
│   │   ├── hooks/              # Custom hooks (GSAP, viewport, etc.)
│   │   └── main.tsx
│   ├── tailwind.config.js
│   └── tsconfig.json
├── server/                     # Node.js Express Backend
│   ├── src/
│   │   ├── config/             # DB & Passport config
│   │   ├── controllers/        # Request controllers
│   │   ├── middleware/         # Auth, validation, rate-limiting
│   │   ├── models/             # Mongoose schemas
│   │   └── index.ts
│   └── tsconfig.json
├── .gitignore
├── .env.example
└── package.json                # Root workspaces package.json
```
