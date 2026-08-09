# DESIGN.md — TECORITHAM Portfolio Visual Design Specification

**Document Version:** 1.0
**Product:** TECORITHAM Portfolio
**Scope:** Visual identity, design tokens, typography, layout, component specifications, responsive behaviour, spacing system, iconography
**Companion Documents:** `MOTION_DESIGN_SYSTEM.md` · `APP_FLOW.md` · `PRD.md`

> This document defines **how the product looks**. It does not define how it moves (see `MOTION_DESIGN_SYSTEM.md`) or how users navigate it (see `APP_FLOW.md`).

---

## Table of Contents

1. [Brand Identity](#1-brand-identity)
2. [Design Principles](#2-design-principles)
3. [Color System](#3-color-system)
4. [Typography System](#4-typography-system)
5. [Spacing System](#5-spacing-system)
6. [Layout System](#6-layout-system)
7. [Elevation and Depth](#7-elevation-and-depth)
8. [Border and Radius System](#8-border-and-radius-system)
9. [Iconography](#9-iconography)
10. [Imagery and Media](#10-imagery-and-media)
11. [Component Specifications](#11-component-specifications)
12. [Section-by-Section Layout](#12-section-by-section-layout)
13. [Responsive Design System](#13-responsive-design-system)
14. [State Design](#14-state-design)
15. [Admin Dashboard Design](#15-admin-dashboard-design)
16. [Accessibility Design](#16-accessibility-design)
17. [Design Anti-Patterns](#17-design-anti-patterns)

---

## 1. Brand Identity

### 1.1 Brand Name

```
TECORITHAM
```

Always written in full uppercase. Never written as:
- Tecoritham ❌
- tecoritham ❌
- TecOrItham ❌

### 1.2 Brand Personality

| Dimension | Expression |
|---|---|
| Archetype | Engineer. Builder. Technologist. |
| Tone | Precise, confident, understated premium |
| Aesthetic | Cyber-dark, editorial, technical |
| NOT | Playful, casual, corporate blue, generic SaaS |

### 1.3 Visual Identity Summary

The TECORITHAM visual language is built on four pillars:

1. **Pitch-black ground** — everything lives in true darkness, creating maximum contrast
2. **Electric Crimson accent** — a single vivid colour used with extreme restraint
3. **White editorial typography** — clean, hierarchical, intentional
4. **Graphite secondary layer** — subtle, supporting, never competing with primary content

The design should feel like a premium engineering interface — not a marketing website.

---

## 2. Design Principles

### 2.1 Darkness is the canvas

The background is not simply dark. It is `#000000` — true black. Every element floats on it. This creates the high-contrast, premium feel that defines the brand.

### 2.2 Crimson is spent carefully

`#FF001B` is used only where it matters:
- Brand mark
- Active/hover states
- Primary CTA
- Accent underlines
- Glow effects

It must never be used as a background fill on large surfaces. Never as body text. Never decoratively on secondary elements.

### 2.3 Content over decoration

Every visual element must earn its place. If removing an element doesn't change what the user understands, it should be removed.

### 2.4 Hierarchy through contrast

Hierarchy is communicated through:
- Font size and weight
- Colour contrast (white → graphite → dark)
- Spatial separation
- Opacity

Never communicate hierarchy through colour alone.

### 2.5 Responsive means adaptive, not hidden

Features must adapt to smaller screens. Removing functionality to solve a responsive layout problem is not an acceptable solution.

---

## 3. Color System

### 3.1 Core Palette

| Token | Hex | Usage |
|---|---|---|
| `color-background` | `#000000` | Page background, deepest layer |
| `color-surface-card` | `#0D0D0D` | Card backgrounds |
| `color-surface-elevated` | `#141414` | Elevated surfaces, modals, dropdowns |
| `color-surface-overlay` | `#1A1A1A` | Hover states on surfaces |
| `color-brand-crimson` | `#FF001B` | Primary brand accent |
| `color-brand-crimson-dim` | `#CC0016` | Pressed/active crimson state |
| `color-brand-crimson-glow` | `rgba(255, 0, 27, 0.15)` | Glow halos, hover auras |
| `color-brand-crimson-subtle` | `rgba(255, 0, 27, 0.08)` | Faint background tints |
| `color-text-primary` | `#FFFFFF` | Primary headings and body |
| `color-text-secondary` | `#A0A0A0` | Supporting text, captions, metadata |
| `color-text-muted` | `#555555` | Disabled, placeholder text |
| `color-border-subtle` | `#1F1F1F` | Card borders, dividers |
| `color-border-active` | `#FF001B` | Focused or active element borders |
| `color-border-dim` | `#2A2A2A` | Mid-level borders on elevated surfaces |

### 3.2 Semantic Colour Tokens

| Token | Value | Usage |
|---|---|---|
| `color-success` | `#22C55E` | Success states, upload confirmations |
| `color-warning` | `#F59E0B` | Warnings, draft status |
| `color-error` | `#EF4444` | Errors, validation failures |
| `color-info` | `#3B82F6` | Informational messages |

### 3.3 Colour Usage Rules

```
✅ Background fill:       color-background, color-surface-card, color-surface-elevated
✅ Accent highlights:     color-brand-crimson (borders, underlines, icons, CTAs)
✅ Glow effects:          color-brand-crimson-glow (box-shadow, drop-shadow)
✅ Primary text:          color-text-primary
✅ Supporting text:       color-text-secondary
✅ Borders:               color-border-subtle, color-border-dim
✅ Status feedback:       color-success, color-warning, color-error

❌ Never fill large surfaces with color-brand-crimson
❌ Never use crimson as body text colour
❌ Never introduce off-brand colours (blues, purples, yellows) for decorative use
❌ Never use white as a background colour
❌ Never use pure grey backgrounds (#333, #444, etc.)
```

### 3.4 Contrast Ratios

| Pair | Ratio | WCAG Grade |
|---|---|---|
| `#FFFFFF` on `#000000` | 21:1 | AAA |
| `#FFFFFF` on `#0D0D0D` | 18.9:1 | AAA |
| `#A0A0A0` on `#000000` | 5.9:1 | AA |
| `#FF001B` on `#000000` | 3.8:1 | AA Large |
| `#FFFFFF` on `#FF001B` | 5.5:1 | AA |

> Crimson used for body text requires white text on top to meet AA. Crimson must not be used alone as small body text on dark backgrounds.

---

## 4. Typography System

### 4.1 Typeface Roles

| Role | Family | Weights | Usage |
|---|---|---|---|
| **Display** | Orbitron | 700, 900 | TECORITHAM wordmark, section hero headings, hero name |
| **Heading** | Orbitron | 600, 700 | Section titles, card titles, dashboard headings |
| **Body** | Inter | 400, 500 | Body text, descriptions, form fields, metadata |
| **UI / Label** | Inter | 500, 600 | Buttons, navigation, badges, tags, labels |
| **Mono / Code** | JetBrains Mono | 400, 500 | Technology tags, credential IDs, code snippets |

> Both Orbitron and Inter are available via Google Fonts. JetBrains Mono is available via Google Fonts or self-hosted.

### 4.2 Type Scale

All values in `rem`. Base: `1rem = 16px`.

| Token | rem | px | Usage |
|---|---|---|---|
| `text-xs` | `0.75rem` | 12px | Micro labels, timestamps, captions |
| `text-sm` | `0.875rem` | 14px | Secondary body, metadata, tags |
| `text-base` | `1rem` | 16px | Primary body text |
| `text-lg` | `1.125rem` | 18px | Lead paragraphs, card introductions |
| `text-xl` | `1.25rem` | 20px | Sub-headings, card titles |
| `text-2xl` | `1.5rem` | 24px | Section sub-titles |
| `text-3xl` | `1.875rem` | 30px | Section titles (mobile) |
| `text-4xl` | `2.25rem` | 36px | Section titles (desktop) |
| `text-5xl` | `3rem` | 48px | Hero sub-headings |
| `text-6xl` | `3.75rem` | 60px | Hero name (desktop) |
| `text-7xl` | `4.5rem` | 72px | Hero name (large desktop) |

### 4.3 Line Height

| Context | Value |
|---|---|
| Display/headings | `1.1` – `1.2` |
| Body text | `1.6` – `1.75` |
| UI labels/buttons | `1.0` – `1.2` |
| Code/mono | `1.5` |

### 4.4 Letter Spacing

| Context | Value |
|---|---|
| Orbitron headings | `0.02em` – `0.05em` |
| Section eyebrow labels | `0.08em` – `0.15em` (uppercase) |
| Body text | `0` (default) |
| Button labels | `0.02em` |
| Monospace tags | `0` (default) |

### 4.5 Typography Rules

```
✅ Orbitron for all display headings, brand wordmark, hero name
✅ Inter for all body, descriptions, UI elements, forms
✅ JetBrains Mono for technology tags, IDs, code
✅ Sentence case for body and UI text
✅ Uppercase for eyebrow labels and section markers only
✅ Font weights used intentionally, not for decoration

❌ Never use Orbitron at small sizes (below text-xl) for body or descriptions
❌ Never introduce a third display typeface
❌ Never use ALL CAPS for body paragraphs
❌ Never mix Inter and another sans-serif for body text
```

### 4.6 Responsive Type Adjustments

| Breakpoint | Hero Name | Section Title | Body |
|---|---|---|---|
| `≥ 1440px` | `text-7xl` | `text-4xl` | `text-base` |
| `≥ 1280px` | `text-6xl` | `text-4xl` | `text-base` |
| `≥ 1024px` | `text-5xl` | `text-3xl` | `text-base` |
| `≥ 768px` | `text-4xl` | `text-3xl` | `text-sm` to `text-base` |
| `< 768px` | `text-3xl` | `text-2xl` | `text-sm` |
| `< 430px` | `text-2xl` | `text-xl` | `text-sm` |

---

## 5. Spacing System

TECORITHAM uses an **8px base grid**. All spacing values are multiples of 4px, stepping at 8px intervals beyond `space-2`.

| Token | px | rem | Usage |
|---|---|---|---|
| `space-1` | 4px | 0.25rem | Micro gaps (icon to label) |
| `space-2` | 8px | 0.5rem | Tight component padding |
| `space-3` | 12px | 0.75rem | Badge padding, tag padding |
| `space-4` | 16px | 1rem | Component padding (small) |
| `space-5` | 20px | 1.25rem | — |
| `space-6` | 24px | 1.5rem | Component padding (standard) |
| `space-8` | 32px | 2rem | Card internal padding |
| `space-10` | 40px | 2.5rem | Between related content groups |
| `space-12` | 48px | 3rem | Between content blocks |
| `space-16` | 64px | 4rem | Section internal spacing |
| `space-20` | 80px | 5rem | Section vertical padding (mobile) |
| `space-24` | 96px | 6rem | Section vertical padding (desktop) |
| `space-32` | 128px | 8rem | Large section separators |

### 5.1 Section Vertical Rhythm

| Element | Mobile | Desktop |
|---|---|---|
| Section top padding | `80px` | `96px` – `128px` |
| Section bottom padding | `80px` | `96px` – `128px` |
| Between section title and content | `40px` | `48px` – `64px` |
| Between cards in a grid | `24px` | `32px` |
| Between eyebrow and section title | `12px` | `16px` |
| Between section title and description | `16px` | `20px` |

---

## 6. Layout System

### 6.1 Content Container

| Breakpoint | Max Width | Horizontal Padding |
|---|---|---|
| `< 640px` | 100% | `16px` each side |
| `640px – 767px` | 100% | `24px` each side |
| `768px – 1023px` | 100% | `32px` each side |
| `1024px – 1279px` | `960px` | `40px` each side |
| `1280px – 1439px` | `1200px` | `48px` each side |
| `≥ 1440px` | `1280px` | auto centred |

### 6.2 Grid

| Context | Columns | Gap |
|---|---|---|
| Mobile (< 768px) | 1 column | 24px |
| Tablet (768px – 1023px) | 2 columns | 24px |
| Desktop (≥ 1024px) | 3 columns | 32px |
| Projects featured | 2 columns | 32px |
| Skills grid | 3–4 columns | 24px |
| Education cards | 1 column | 24px |

### 6.3 Hero Layout

```
Desktop (≥ 1024px):
┌─────────────────────────────────────────────┐
│  [LEFT: 50%]              [RIGHT: 50%]      │
│                                             │
│  TECORITHAM               ┌──────────────┐  │
│  Full Name                │              │  │
│  Role Rotator             │  Profile     │  │
│  Description              │  Image       │  │
│  [CTA] [CTA]              │              │  │
│  Social Links             └──────────────┘  │
│  Stats                                      │
└─────────────────────────────────────────────┘

Mobile (< 768px):
┌────────────────────────┐
│  TECORITHAM            │
│  Full Name             │
│  Role Rotator          │
│  Description           │
│  [CTA] [CTA]           │
│  Social Links          │
│  ┌──────────────────┐  │
│  │   Profile Image  │  │
│  └──────────────────┘  │
│  Stats                 │
└────────────────────────┘
```

### 6.4 Section Layout Pattern

Every content section follows this structural pattern:

```
┌──────────────────────────────────────────┐
│  [EYEBROW LABEL]                         │
│  Section Title                           │
│  Optional short description paragraph    │
│                                          │
│  ┌──────┐  ┌──────┐  ┌──────┐           │
│  │      │  │      │  │      │  ← Cards  │
│  └──────┘  └──────┘  └──────┘           │
└──────────────────────────────────────────┘
```

**Eyebrow label:** Uppercase, `text-xs`, `color-brand-crimson`, `letter-spacing: 0.12em`

---

## 7. Elevation and Depth

TECORITHAM uses a layered depth model. Higher layers have lighter backgrounds and more visible borders.

| Layer | Background | Border | Use Case |
|---|---|---|---|
| Layer 0 — Ground | `#000000` | none | Page background |
| Layer 1 — Card | `#0D0D0D` | `1px solid #1F1F1F` | Default cards |
| Layer 2 — Elevated | `#141414` | `1px solid #2A2A2A` | Hovered cards, panels |
| Layer 3 — Overlay | `#1A1A1A` | `1px solid #333333` | Modals, dropdowns, drawers |
| Layer 4 — Toast | `#222222` | `1px solid #404040` | Notifications, tooltips |

### 7.1 Glow System

Glow effects replace traditional drop shadows in the TECORITHAM design language.

| Type | CSS Value | Usage |
|---|---|---|
| Crimson card glow | `0 0 20px rgba(255, 0, 27, 0.12)` | Card hover |
| Crimson strong glow | `0 0 40px rgba(255, 0, 27, 0.20)` | CTA hover, featured card |
| Crimson border glow | `0 0 0 1px rgba(255, 0, 27, 0.4)` | Focus rings, active states |
| Subtle card shadow | `0 4px 24px rgba(0, 0, 0, 0.4)` | Cards floating above ground |
| Profile image glow | `0 0 60px rgba(255, 0, 27, 0.18)` | Hero profile image ambient |

---

## 8. Border and Radius System

### 8.1 Border Widths

| Token | Value | Usage |
|---|---|---|
| `border-thin` | `1px` | Default card borders, dividers |
| `border-medium` | `2px` | Active states, focus rings |
| `border-accent` | `2px solid #FF001B` | Selected states, active cards |

### 8.2 Border Radius

| Token | Value | Usage |
|---|---|---|
| `radius-sm` | `4px` | Tags, badges, small chips |
| `radius-md` | `8px` | Buttons, inputs, small cards |
| `radius-lg` | `12px` | Standard cards |
| `radius-xl` | `16px` | Large cards, featured cards |
| `radius-2xl` | `24px` | Profile image, large panels |
| `radius-full` | `9999px` | Pills, avatar rings, social icons |

---

## 9. Iconography

### 9.1 Technology Icons

Technology icons must use official SVG assets wherever available.

**Preferred source order:**
1. Official brand SVG (e.g. `devicons`, `simple-icons`)
2. Official brand PNG at `64×64` minimum
3. Custom SVG that matches brand colours

**Technology icon specifications:**

| Context | Size | Colour Treatment |
|---|---|---|
| Floating hero icons | `32px – 48px` | Full colour SVG |
| Marquee row | `28px – 36px` | Full colour SVG |
| Skill card icon | `24px – 32px` | Full colour SVG |
| Tech badge on project | `16px – 20px` | Monochrome or reduced |
| Admin icon picker | `24px` | Full colour SVG |

### 9.2 UI Icons

Use a consistent icon library for all UI chrome (navigation, buttons, actions, status).

**Recommended:** `lucide-react`

| Usage | Icon Examples |
|---|---|
| Navigation close | `X` |
| External link | `ExternalLink` |
| GitHub | `Github` |
| Download | `Download` |
| Edit | `Pencil` |
| Delete | `Trash2` |
| Upload | `Upload` |
| Settings | `Settings` |
| Dashboard | `LayoutDashboard` |
| View | `Eye` / `EyeOff` |
| Add | `Plus` |
| Back | `ChevronLeft` |
| Admin lock | `Lock` or `ShieldCheck` |
| Read/Unread | `Mail` / `MailOpen` |

### 9.3 Icon Sizing

| Context | Size |
|---|---|
| In-line with text | Match `font-size` (`1em`) |
| Button icon | `16px – 18px` |
| Navigation icon | `20px` |
| Section decorative | `24px – 32px` |
| Admin sidebar | `20px` |
| Empty state | `48px – 64px`, `color-text-muted` |

---

## 10. Imagery and Media

### 10.1 Profile Image

| Property | Specification |
|---|---|
| Shape | Circular, `border-radius: 9999px` |
| Border | `2px solid #1F1F1F`, hover: `2px solid #FF001B` |
| Ring | Animated crimson ring (see Motion Design System) |
| Glow | `0 0 60px rgba(255, 0, 27, 0.18)` ambient |
| Desktop size | `320px – 400px` diameter |
| Tablet size | `260px – 300px` diameter |
| Mobile size | `180px – 220px` diameter |
| Object fit | `cover` |
| Loading | Skeleton → fade-in reveal |

### 10.2 Project Thumbnails

| Property | Specification |
|---|---|
| Aspect ratio | `16:9` |
| Object fit | `cover` |
| Border radius | `radius-lg` (12px) on image within card |
| Hover | Scale `1.03x`, `transition: transform 400ms ease` |
| Overlay | Semi-transparent crimson gradient on hover |
| Loading | Skeleton placeholder matching exact dimensions |

### 10.3 Certificate Images

| Property | Specification |
|---|---|
| Aspect ratio | `4:3` or actual certificate ratio |
| Object fit | `contain` with padded background |
| Background | `color-surface-card` |
| Border | `1px solid #1F1F1F` |
| Preview | Modal/lightbox on click |

### 10.4 Company and Institution Logos

| Property | Specification |
|---|---|
| Size | `40px – 48px` height |
| Format | SVG preferred, PNG fallback |
| Treatment | Full colour, no forced monochrome |
| Background | Padded container, `color-surface-elevated` |
| Border radius | `radius-md` |

### 10.5 Image Quality Rules

```
✅ Always specify width and height attributes to prevent layout shift
✅ Use lazy loading on all below-fold images
✅ Provide explicit placeholder dimensions matching the loaded image
✅ Use WebP where supported, JPEG/PNG fallback
✅ Profile image: minimum 400×400px source
✅ Project thumbnail: minimum 800×450px source

❌ Never show broken image icons — always show a skeleton or fallback
❌ Never allow images to overflow their containers
❌ Never allow images to cause cumulative layout shift (CLS)
```

---

## 11. Component Specifications

### 11.1 Buttons

#### Primary Button

```
Background:     #FF001B
Text:           #FFFFFF
Font:           Inter 600, text-sm, letter-spacing 0.02em, uppercase
Padding:        12px 28px
Border radius:  radius-md (8px)
Border:         none

Hover:
  Background:   #CC0016
  Box-shadow:   0 0 20px rgba(255, 0, 27, 0.35)
  Transform:    translateY(-1px)

Active:
  Transform:    translateY(0)
  Box-shadow:   none

Focus:
  Outline:      2px solid #FF001B
  Offset:       2px
```

#### Secondary / Outline Button

```
Background:     transparent
Text:           #FFFFFF
Border:         1px solid #2A2A2A
Font:           Inter 500, text-sm
Padding:        12px 28px
Border radius:  radius-md

Hover:
  Border:       1px solid #FF001B
  Text:         #FF001B
  Background:   rgba(255, 0, 27, 0.05)

Focus:
  Outline:      2px solid #FF001B
  Offset:       2px
```

#### Ghost Button (Icon + Text)

```
Background:     transparent
Text:           #A0A0A0
Font:           Inter 500, text-sm
Padding:        8px 16px
Border radius:  radius-md

Hover:
  Text:         #FFFFFF
  Background:   rgba(255,255,255,0.05)
```

#### Destructive Button

```
Background:     transparent
Text:           #EF4444
Border:         1px solid rgba(239, 68, 68, 0.3)
Font:           Inter 500, text-sm
Padding:        10px 20px

Hover:
  Background:   rgba(239, 68, 68, 0.08)
  Border:       1px solid #EF4444
```

---

### 11.2 Cards

#### Standard Card

```
Background:     #0D0D0D
Border:         1px solid #1F1F1F
Border radius:  radius-lg (12px)
Padding:        24px – 32px
Transition:     border-color 300ms, box-shadow 300ms, transform 300ms

Hover:
  Border:       1px solid rgba(255, 0, 27, 0.3)
  Box-shadow:   0 0 24px rgba(255, 0, 27, 0.10)
  Transform:    translateY(-2px)
```

#### Featured / Hero Card

```
Background:     #0D0D0D
Border:         1px solid rgba(255, 0, 27, 0.2)
Border radius:  radius-xl (16px)
Box-shadow:     0 0 40px rgba(255, 0, 27, 0.08)
Padding:        32px – 40px
```

#### Project Card

```
Background:     #0D0D0D
Border:         1px solid #1F1F1F
Border radius:  radius-xl (16px)
Overflow:       hidden

Image area:
  Aspect ratio:  16:9
  Overflow:      hidden
  Border radius: 0 (clipped by card)

Content area:
  Padding:       24px

Hover (image):
  Transform:     scale(1.03)
  Transition:    transform 400ms ease

Hover (card):
  Border:        1px solid rgba(255, 0, 27, 0.25)
  Box-shadow:    0 0 28px rgba(255, 0, 27, 0.12)
```

---

### 11.3 Badges and Tags

#### Technology Badge

```
Background:     rgba(255, 255, 255, 0.05)
Text:           #A0A0A0
Font:           JetBrains Mono 400, text-xs
Padding:        4px 10px
Border:         1px solid #1F1F1F
Border radius:  radius-sm (4px)

Hover (interactive):
  Background:   rgba(255, 0, 27, 0.08)
  Text:         #FFFFFF
  Border:       1px solid rgba(255, 0, 27, 0.2)
```

#### Status Badge

```
Published:
  Background:   rgba(34, 197, 94, 0.10)
  Text:         #22C55E
  Border:       1px solid rgba(34, 197, 94, 0.2)

Draft:
  Background:   rgba(245, 158, 11, 0.10)
  Text:         #F59E0B
  Border:       1px solid rgba(245, 158, 11, 0.2)

Featured:
  Background:   rgba(255, 0, 27, 0.10)
  Text:         #FF001B
  Border:       1px solid rgba(255, 0, 27, 0.2)

Font:           Inter 500, text-xs, letter-spacing 0.04em, UPPERCASE
Padding:        3px 8px
Border radius:  radius-full
```

---

### 11.4 Form Elements

#### Input Field

```
Background:     #0D0D0D
Border:         1px solid #2A2A2A
Border radius:  radius-md (8px)
Text:           #FFFFFF
Placeholder:    #555555
Font:           Inter 400, text-base
Padding:        12px 16px
Transition:     border-color 200ms

Focus:
  Border:       1px solid #FF001B
  Box-shadow:   0 0 0 3px rgba(255, 0, 27, 0.12)
  Outline:      none

Error:
  Border:       1px solid #EF4444
  Box-shadow:   0 0 0 3px rgba(239, 68, 68, 0.10)

Valid:
  Border:       1px solid rgba(34, 197, 94, 0.4)
```

#### Textarea

Same as Input Field. Min-height: `120px`. Resize: `vertical` only.

#### Label

```
Font:           Inter 500, text-sm
Color:          #A0A0A0
Margin-bottom:  6px
Display:        block
```

#### Error Message

```
Font:           Inter 400, text-xs
Color:          #EF4444
Margin-top:     4px
Display:        flex
Align-items:    center
Gap:            4px (icon + text)
```

---

### 11.5 Navigation

#### Desktop Navigation Bar

```
Background:     rgba(0, 0, 0, 0.85)
Backdrop blur:  blur(12px)
Border-bottom:  1px solid #1F1F1F
Height:         64px – 72px
Position:       sticky, top: 0
Z-index:        100

Logo:
  Font:         Orbitron 700, text-xl
  Color:        #FFFFFF
  Hover:        color-brand-crimson

Nav Links:
  Font:         Inter 500, text-sm
  Color:        #A0A0A0
  Hover:        #FFFFFF
  Active:       #FF001B + underline (2px, crimson)
  Transition:   color 200ms, border-color 200ms

CTA Button (if present):
  Use Primary Button spec
```

#### Mobile Navigation (Hamburger)

```
Trigger icon:   Hamburger → X morph animation
Overlay:
  Position:     fixed, full screen
  Background:   #000000
  Z-index:      200

Menu links:
  Font:         Orbitron 600, text-2xl – text-3xl
  Color:        #FFFFFF
  Active:       #FF001B
  Spacing:      40px – 48px between items
  Animation:    stagger fade-up (see Motion Design System)

Close:
  Position:     top-right
  Icon:         X (lucide), 24px
  Color:        #A0A0A0 → #FFFFFF on hover
```

---

### 11.6 Social Link Icons

```
Container:
  Size:         40px × 40px
  Background:   rgba(255, 255, 255, 0.05)
  Border:       1px solid #1F1F1F
  Border radius: radius-full (circle)

Icon:
  Size:         18px – 20px
  Color:        #A0A0A0

Hover:
  Background:   rgba(255, 0, 27, 0.08)
  Border:       1px solid rgba(255, 0, 27, 0.3)
  Icon color:   #FF001B
  Transform:    translateY(-2px)
  Transition:   all 250ms ease
```

---

### 11.7 Skill Cards

```
Layout:         Grid (3–4 cols desktop, 2 cols tablet, 2 cols mobile)
Card:           Standard Card spec
Icon:           32px, centered or left-aligned
Name:           Inter 600, text-base, color-text-primary
Category:       Inter 400, text-xs, color-text-secondary
Level:          Visual indicator (dots, bar, or label) — consistent across all skills
```

---

### 11.8 Experience and Education Cards

Use a **vertical timeline** layout on desktop (left timeline bar + right card content) and a **flat card stack** on mobile.

```
Timeline bar:
  Color:        #1F1F1F
  Width:        2px
  Left offset:  24px

Timeline dot:
  Size:         12px
  Background:   #FF001B
  Border:       3px solid #000000
  Position:     Centered on bar

Card:
  Use Standard Card spec
  Company/Institution logo: 40px–48px, left-aligned
  Role/Degree: Inter 700, text-lg
  Company: Inter 500, text-base, color-text-secondary
  Dates: Inter 400, text-sm, color-text-muted, monospace preferred
  Description: Inter 400, text-base, color-text-secondary
  Tech badges: Technology Badge spec
```

---

### 11.9 Section Eyebrow Pattern

Every section uses this eyebrow pattern above the title:

```
┌─────────────────────────────────────┐
│  ── PROJECTS ──                     │
│  What I've Built                    │
│  Short supporting description text  │
└─────────────────────────────────────┘

Eyebrow:
  Font:         Inter 600, text-xs, UPPERCASE
  Color:        #FF001B
  Letter spacing: 0.12em
  Display:      flex, align-items: center, gap: 8px
  Decorators:   thin horizontal lines (1px, #FF001B, width ~20px) either side

Section Title:
  Font:         Orbitron 700, text-3xl – text-4xl
  Color:        #FFFFFF

Description:
  Font:         Inter 400, text-base – text-lg
  Color:        #A0A0A0
  Max-width:    600px – 640px (centered or left-aligned)
```

---

## 12. Section-by-Section Layout

### 12.1 Hero Section

```
Background:     #000000 with subtle radial crimson glow behind profile
Content left:   Eyebrow (TECORITHAM brand tag) → Name → Role rotator →
                Description → CTA group → Social links → Stats row
Content right:  Profile image (circular, floating)
Floating icons: 8–10 technology SVGs orbiting/floating in viewport
Padding:        min-height 100vh, vertically centered
```

### 12.2 Technology Marquee

```
Position:       Immediately below hero or as hero transition
Rows:           2 – 3 alternating directions
Row 1:          Left → Right
Row 2:          Right → Left
Row 3:          Left → Right (if used)
Item:           Logo + Name, spaced 40px – 64px apart
Fade edges:     Linear gradient mask, left and right (transparent → background)
Speed:          Consistent, never jarring
Background:     Subtle separator from hero
```

### 12.3 About Section

```
Layout:         Single column, max-width 720px, centered or left-aligned
Content:        2–4 paragraphs
Typography:     Inter 400–500, text-base – text-lg, color-text-secondary
Accent:         Optional crimson highlight on key phrases (use sparingly)
```

### 12.4 Skills Section

```
Layout:         Category tabs or filtered grid
Grid:           3–4 columns desktop, 2 columns tablet, 2 columns mobile
Categories:     Tab or filter pills (use Tag/Badge component)
Cards:          Skill Card spec
```

### 12.5 Projects Section

```
Featured:       1–2 full-width or 2-column featured cards at top
Grid:           3 columns desktop, 2 columns tablet, 1 column mobile
Card:           Project Card spec
Filter:         Category filter pills above grid (optional)
CTA:            "View All Projects" below grid if truncated
```

### 12.6 Education and Experience Sections

```
Desktop:        Vertical timeline layout
Mobile:         Flat stacked cards
Cards:          Education/Experience Card spec
```

### 12.7 Certifications Section

```
Layout:         3 columns desktop, 2 columns tablet, 1 column mobile
Card:           Standard Card with certificate image, org logo, name, date, verify link
Preview:        Click → modal lightbox for certificate image/PDF
```

### 12.8 Achievements Section

```
Layout:         2–3 columns desktop, 1–2 columns mobile
Card:           Standard Card with category badge, image, title, org, date, verify link
```

### 12.9 Contact Section

```
Layout:         2 columns desktop (info left, form right) · 1 column mobile
Form:           Name, Email, Subject, Message, Submit button
Info:           Social links, email (if shown), availability note
```

### 12.10 Footer

```
Layout:         3–4 column grid desktop, stacked mobile
Columns:        Logo + tagline | Navigation links | Social links | (optional: newsletter)
Bottom bar:     Copyright · Admin access icon (subtle, right-aligned)
Admin icon:     Lock or shield, text-muted, 16px, no label
                On hover: color-text-secondary
                Tooltip: "Admin" (optional)
```

---

## 13. Responsive Design System

### 13.1 Breakpoints

| Name | Width | Target Device |
|---|---|---|
| `xs` | `320px` | Smallest mobile |
| `sm` | `390px – 430px` | Modern mobile |
| `md` | `768px` | Tablet |
| `lg` | `1024px` | Small laptop |
| `xl` | `1280px` | Standard desktop |
| `2xl` | `1440px` | Large desktop |
| `3xl` | `1920px` | Wide monitor |

### 13.2 Floating Technology Icons — Responsive

Do NOT simply hide floating icons on small screens. Adapt them.

| Breakpoint | Count | Size | Orbit Radius |
|---|---|---|---|
| `≥ 1440px` | 10 icons | `40px – 48px` | Full range |
| `≥ 1280px` | 8 – 10 icons | `36px – 44px` | Full range |
| `≥ 1024px` | 6 – 8 icons | `32px – 40px` | Reduced |
| `≥ 768px` | 5 – 6 icons | `28px – 36px` | Reduced |
| `< 768px` | 3 – 4 icons | `24px – 32px` | Tight, peripheral |

Icons on mobile must:
- Never overlap the hero heading
- Never overlap the profile image
- Never overlap the CTA buttons
- Stay in viewport periphery

### 13.3 Navigation — Responsive

| Breakpoint | Pattern |
|---|---|
| `≥ 1024px` | Full horizontal nav bar |
| `768px – 1023px` | Nav bar with fewer items or hamburger |
| `< 768px` | Hamburger only — full-screen overlay menu |

### 13.4 Mandatory Responsive Rules

```
✅ No horizontal scroll at any viewport width
✅ No text clipping or truncation on critical content
✅ All buttons and interactive areas minimum 44px touch target
✅ All form fields minimum 44px height on mobile
✅ Card grids collapse to single column below 640px
✅ Images never overflow their containers
✅ Section padding scales with viewport
```

---

## 14. State Design

### 14.1 Loading States

Every dynamic section must show a skeleton loading state.

```
Skeleton:
  Background:   #0D0D0D
  Shimmer:      Linear gradient animation (left to right)
  Shimmer color: rgba(255, 255, 255, 0.04) → rgba(255, 255, 255, 0.08) → rgba(255, 255, 255, 0.04)
  Border radius: Match the content shape exactly
  Duration:     1.5s, infinite
```

Skeleton blocks must match the exact dimensions and layout of the content they replace.

### 14.2 Empty States

```
Container:      Centered, padding: 64px 24px
Icon:           48px – 64px, color-text-muted (lucide icon)
Title:          Inter 600, text-lg, color-text-primary
Description:    Inter 400, text-sm, color-text-secondary, max-width: 320px

Examples:
  "No projects published yet."
  "No certifications added."
  "No messages received."
```

### 14.3 Error States

```
Container:      Centered, padding 48px
Icon:           AlertCircle (lucide), 40px, #EF4444
Title:          Inter 600, text-base, #EF4444
Description:    Inter 400, text-sm, color-text-secondary
Action:         Optional — Ghost button ("Try again")
```

A single section's API error must never crash the rest of the page.

### 14.4 Success States (Admin)

```
Toast notification:
  Position:     Fixed, bottom-right, z-index: 300
  Background:   #141414
  Border:       1px solid rgba(34, 197, 94, 0.3)
  Border radius: radius-md
  Padding:      12px 16px
  Icon:         CheckCircle (lucide), 16px, #22C55E
  Text:         Inter 500, text-sm, #FFFFFF
  Duration:     3000ms → fade out
  Entry:        Slide up + fade in
```

### 14.5 Focus States

All interactive elements must have visible focus rings.

```
Default focus ring:
  Outline:      2px solid #FF001B
  Offset:       2px
  Border radius: Match element border radius

For dark surfaces where crimson is hard to see:
  Outline:      2px solid #FFFFFF
  Offset:       3px
```

Never use `outline: none` without a custom focus replacement.

---

## 15. Admin Dashboard Design

### 15.1 Admin Layout

```
┌──────────────────────────────────────────────────┐
│  TECORITHAM Admin      [Avatar] [Logout]          │← Top bar
├────────────┬─────────────────────────────────────┤
│            │                                      │
│  Sidebar   │   Main Content Area                  │
│  Nav       │                                      │
│            │                                      │
│            │                                      │
└────────────┴─────────────────────────────────────┘

Desktop:  Sidebar 240px fixed | Main: fluid
Tablet:   Sidebar collapsible (icon-only mode)
Mobile:   Sidebar as drawer (hamburger trigger)
```

### 15.2 Admin Color Adjustments

The admin dashboard uses the same design tokens but with slightly elevated surfaces:

| Element | Value |
|---|---|
| App background | `#000000` |
| Sidebar background | `#0A0A0A` |
| Sidebar border | `1px solid #1F1F1F` |
| Content background | `#000000` |
| Cards/panels | `#0D0D0D` |
| Top bar background | `#0A0A0A` |
| Top bar border | `1px solid #1F1F1F` |

### 15.3 Admin Sidebar Navigation

```
Logo area:      TECORITHAM wordmark + "Admin" label
                Orbitron 700, text-base
                Color: #FFFFFF

Nav items:
  Font:         Inter 500, text-sm
  Color:        #A0A0A0
  Padding:      10px 16px
  Border radius: radius-md
  Icon:         lucide icon, 18px, left-aligned

Active:
  Background:   rgba(255, 0, 27, 0.08)
  Text:         #FFFFFF
  Left border:  2px solid #FF001B
  Icon color:   #FF001B

Hover:
  Background:   rgba(255, 255, 255, 0.04)
  Text:         #FFFFFF
```

### 15.4 Admin Data Tables

```
Background:     #0D0D0D
Border:         1px solid #1F1F1F
Border radius:  radius-lg

Header row:
  Background:   #141414
  Text:         Inter 600, text-xs, UPPERCASE, #A0A0A0, letter-spacing: 0.06em
  Padding:      12px 16px

Data rows:
  Padding:      14px 16px
  Border-bottom: 1px solid #1A1A1A
  Text:         Inter 400, text-sm, #FFFFFF

Hover row:
  Background:   rgba(255, 255, 255, 0.02)

Actions:
  Right-aligned
  Ghost icon buttons (Edit, Delete, View)
```

---

## 16. Accessibility Design

### 16.1 Colour and Contrast

All text must meet WCAG AA minimum ratios:
- Normal text (< 18px): `4.5:1`
- Large text (≥ 18px bold or ≥ 24px): `3:1`

Do not rely on colour alone to convey state. Always pair with:
- Icon
- Label change
- Border change
- Pattern

### 16.2 Motion and Animation

```
@media (prefers-reduced-motion: reduce) {
  /* All transitions: maximum 100ms */
  /* No floating/orbit animations */
  /* No marquee scroll */
  /* No stagger reveals */
  /* Fade in still permitted at 100ms */
  /* Functional transitions permitted */
}
```

### 16.3 Interactive Element Sizing

All tap targets: minimum `44px × 44px`.

Icon-only buttons must include:
- `aria-label` with descriptive text
- Visible tooltip on hover (desktop)

### 16.4 Semantic Hierarchy

```
<h1>  — Owner name (Hero) — one per page
<h2>  — Section titles (About, Skills, Projects, etc.)
<h3>  — Card titles, sub-section headings
<h4>  — Within-card sub-headings if needed
```

Never skip heading levels for visual styling purposes. Use CSS to change visual appearance without altering semantic level.

---

## 17. Design Anti-Patterns

The following are explicitly prohibited.

| Anti-Pattern | Reason |
|---|---|
| Gradient backgrounds on large sections | Conflicts with the pitch-black brand ground |
| Off-brand colours (blue, purple, green as accents) | Breaks TECORITHAM brand identity |
| Multiple accent colours | Dilutes the crimson's intentional scarcity |
| Card borders thicker than 2px | Visually heavy, conflicts with the design language |
| Shadows using black (not glow) | Glows are the TECORITHAM depth language |
| Fully hiding features on mobile | Adaptive is required, not removal |
| Generic stock photography | Not applicable to a personal portfolio — use real assets |
| White or light-mode backgrounds | Contrary to the brand's core identity |
| Orbitron below `text-lg` for body paragraphs | Reduces readability significantly |
| Colour-only state indicators | Accessibility violation |
| Multiple typeface families (3+) | Breaks typographic coherence |
| Uncontrolled animation on every element | Creates visual noise, harms performance |
| `outline: none` without replacement | Removes keyboard accessibility |
| Placeholder as label | Hides context on focus/entry |
| Inline styles for design tokens | Bypasses the design system |

---

## Document Relationships

| Document | Covers |
|---|---|
| `PRD.md` | What the product must do |
| **`DESIGN.md`** ← this document | How the product must look |
| `MOTION_DESIGN_SYSTEM.md` | How the product must move and animate |
| `APP_FLOW.md` | How users navigate and interact |
| `ARCHITECTURE.md` | How the product is built technically |

---

*DESIGN.md — TECORITHAM Portfolio v1.0 · Owned by TECORITHAM*
