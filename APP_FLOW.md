# APP_FLOW.md — TECORITHAM Portfolio Application Flow

**Document Version:** 1.0
**Product:** TECORITHAM Portfolio
**Scope:** User flows, navigation structure, page-level interactions, admin workflows, form flows, error flows, and route map
**Companion Documents:** `PRD.md` · `DESIGN.md` · `MOTION_DESIGN_SYSTEM.md` · `ARCHITECTURE.md`

> This document defines **how users move through the product** — what they see, what they can do, and what happens next at every step. It does not define visual styling (see `DESIGN.md`) or animation behaviour (see `MOTION_DESIGN_SYSTEM.md`).

---

## Table of Contents

1. [Route Map](#1-route-map)
2. [Public Website Flow](#2-public-website-flow)
3. [Section Navigation Flow](#3-section-navigation-flow)
4. [Hero Section Flow](#4-hero-section-flow)
5. [Projects Flow](#5-projects-flow)
6. [Certifications Flow](#6-certifications-flow)
7. [Contact Form Flow](#7-contact-form-flow)
8. [Resume Flow](#8-resume-flow)
9. [Social Links Flow](#9-social-links-flow)
10. [Mobile Navigation Flow](#10-mobile-navigation-flow)
11. [Admin Entry Flow](#11-admin-entry-flow)
12. [Admin Authentication Flow](#12-admin-authentication-flow)
13. [Admin Dashboard Flow](#13-admin-dashboard-flow)
14. [Admin Content Management Flows](#14-admin-content-management-flows)
15. [Admin File Upload Flow](#15-admin-file-upload-flow)
16. [Admin Session Flow](#16-admin-session-flow)
17. [Error and Edge Case Flows](#17-error-and-edge-case-flows)
18. [Flow Transition Rules](#18-flow-transition-rules)

---

## 1. Route Map

### 1.1 Public Routes

```
/                       → Portfolio home (all sections, single-page scroll)
/projects               → Full projects listing (if paginated beyond home)
/projects/:id           → Individual project detail page
```

> All primary portfolio content (Hero, About, Skills, Projects preview,
> Education, Certifications, Experience, Achievements, Contact) lives on
> the root `/` route as a single scrollable page.
> Individual project detail is the only public sub-route.

### 1.2 Admin Routes

```
/admin/login            → Admin login page
/admin/dashboard        → Admin overview dashboard
/admin/profile          → Manage profile information
/admin/projects         → Projects list management
/admin/projects/new     → Create new project
/admin/projects/:id     → Edit existing project
/admin/skills           → Skills management
/admin/technologies     → Tech stack management
/admin/education        → Education management
/admin/certifications   → Certifications management
/admin/experience       → Experience management
/admin/achievements     → Achievements management
/admin/resume           → Resume management
/admin/social-links     → Social links management
/admin/gallery          → Gallery management
/admin/messages         → Contact messages inbox
/admin/settings         → Website settings
```

### 1.3 Route Protection Rules

| Route Pattern | Access | Auth Required | Redirect if Unauth |
|---|---|---|---|
| `/` | Public | No | — |
| `/projects/:id` | Public | No | — |
| `/admin/login` | Public | No | `/admin/dashboard` if already authed |
| `/admin/*` | Private | Yes | `/admin/login` |

---

## 2. Public Website Flow

### 2.1 First-Time Visitor Entry

```
Visitor arrives at /
        │
        ▼
Page loads → API fetches portfolio data
        │
        ├─ Success → Render sections with content from DB
        │
        └─ Failure → Render sections with graceful error/empty states
                     (never crash entire page)
        │
        ▼
Hero section visible immediately (above fold)
        │
        ▼
Visitor scrolls → Scroll-triggered section reveals
        │
        ▼
Visitor interacts with:
  ├── Navigation links  → Smooth scroll to section
  ├── CTA buttons       → Action (see Hero Flow)
  ├── Project cards     → Project interaction (see Projects Flow)
  ├── Social icons      → New tab external link
  ├── Contact form      → Form submission (see Contact Flow)
  ├── Resume button     → Resume action (see Resume Flow)
  └── Footer admin icon → Admin entry (see Admin Entry Flow)
```

### 2.2 Returning Visitor Entry

Same as first-time. The portfolio is stateless for public visitors. No session, no cookies, no login required.

### 2.3 Section Loading Order

Sections are loaded and rendered in this priority order:

```
Priority 1 (above fold, immediate):
  → Navigation
  → Hero section

Priority 2 (near fold, preloaded):
  → Technology Marquee
  → About section

Priority 3 (below fold, lazy):
  → Skills
  → Projects
  → Education
  → Certifications
  → Experience
  → Achievements
  → Contact
  → Footer
```

Each section renders its own skeleton state independently while its data loads. No section blocks another section from rendering.

---

## 3. Section Navigation Flow

### 3.1 Desktop Navigation

```
Visitor clicks nav link (e.g. "Projects")
        │
        ▼
Smooth scroll to #projects anchor
        │
        ▼
Active nav link updates (crimson underline on "Projects")
        │
        ▼
Scroll-triggered animation fires if not yet played
```

### 3.2 Scroll-Based Active Link Update

As the visitor scrolls, the navigation active state updates automatically:

```
Visitor scrolls down the page
        │
        ▼
IntersectionObserver detects which section is in viewport
        │
        ▼
Active nav link updates to match visible section
        │
        ▼
No page reload — pure scroll position tracking
```

Active section detection uses the section with the greatest viewport coverage, or the topmost visible section if multiple are partially in view.

### 3.3 Back to Top

```
Visitor scrolls past Hero section
        │
        ▼
Back-to-top button appears (bottom-right corner, fixed)
        │
        ▼
Visitor clicks → smooth scroll to top of page
        │
        ▼
Button disappears when Hero is back in view
```

---

## 4. Hero Section Flow

### 4.1 CTA Interactions

```
"View My Work" (Primary CTA)
        │
        ▼
Smooth scroll to #projects section

"Contact Me" (Secondary CTA)
        │
        ▼
Smooth scroll to #contact section

"Download Resume" (if shown in Hero)
        │
        ▼
See Resume Flow → Section 8
```

### 4.2 Role Rotator

```
Page loads
        │
        ▼
Role 1 fades/types in (e.g. "Full Stack Engineer")
        │
        ▼
Role 1 displays for ~2500ms
        │
        ▼
Role 1 fades/slides out
        │
        ▼
Role 2 fades/slides in (e.g. "AI Engineer")
        │
        ▼
Cycle repeats indefinitely
        │
        ▼
prefers-reduced-motion → show single static role, no animation
```

Roles are fetched from the profile API. The rotation cycle pauses if the tab loses focus (page visibility API) to avoid unnecessary processing.

### 4.3 Profile Image

```
Page loads
        │
        ▼
Skeleton placeholder shown (circular, matching image size)
        │
        ▼
Image loads → fade in with floating animation begins
        │
        ▼
On hover → subtle glow intensifies (see Motion Design System)
```

### 4.4 Stats Row

```
Stats row comes into viewport (IntersectionObserver)
        │
        ▼
Count-up animation fires once per page load
        │
        ▼
Numbers count from 0 to target value
        │
        ▼
prefers-reduced-motion → show final number immediately, no count-up
```

Stats data (e.g. projects count, years experience) is fetched from the profile API or derived from content collections.

---

## 5. Projects Flow

### 5.1 Projects Section on Home Page

```
Visitor scrolls to Projects section
        │
        ▼
API fetches published projects (featured first, then by order)
        │
        ├─ Loading → Skeleton cards in grid layout
        ├─ Empty   → "No projects published yet."
        └─ Error   → Error state with retry option
        │
        ▼
Projects render as cards
        │
        ▼
Featured projects shown at top (larger or highlighted card)
Remaining projects in standard grid below
        │
        ▼
If more projects than displayed limit:
  → "View All Projects" button shown
  → Click → navigate to /projects (full listing)
```

### 5.2 Project Card Interaction

```
Visitor hovers project card
        │
        ▼
Card: border crimson glow, translateY(-2px)
Image: scale 1.03x
Overlay: subtle crimson gradient
Action buttons: visible (GitHub, Live Demo)
        │
        ▼
Visitor clicks project card (non-button area)
        │
        ▼
Navigate to /projects/:id (project detail page)

Visitor clicks "GitHub" button
        │
        ▼
Open GitHub URL in new tab (if URL exists)
Button hidden if no GitHub URL provided

Visitor clicks "Live Demo" button
        │
        ▼
Open live URL in new tab (if URL exists)
Button hidden if no live URL provided
```

### 5.3 Project Detail Page — /projects/:id

```
Visitor arrives at /projects/:id
        │
        ▼
API fetches project by ID
        │
        ├─ Loading  → Full-page skeleton
        ├─ Not found → 404 state with "Back to Portfolio" CTA
        ├─ Unpublished → 404 state (treat as not found)
        └─ Success  → Render project detail
        │
        ▼
Project detail shows:
  → Title
  → Status badge
  → Technology badges
  → Full description
  → Image gallery/carousel
  → GitHub link (if available)
  → Live Demo link (if available)
  → Start / completion dates
  → Back to Portfolio link
```

### 5.4 Project Image Gallery

```
Multiple images available
        │
        ▼
Thumbnail strip or pagination dots below main image
        │
        ▼
Visitor clicks thumbnail → main image updates
Visitor clicks main image → lightbox opens (full screen)
        │
        ▼
Lightbox:
  → Previous / Next navigation (keyboard and click)
  → Click outside or press Escape → lightbox closes
  → Swipe on mobile → navigate images
```

---

## 6. Certifications Flow

### 6.1 Certification Card Interaction

```
Visitor sees certification card
        │
        ▼
Card shows:
  → Certificate thumbnail image
  → Certificate name
  → Issuing organisation
  → Issue date
  → "Verify" link (if credential URL exists)
        │
        ▼
Visitor clicks certificate image or card
        │
        ▼
Lightbox opens showing full certificate image or PDF preview
        │
        ▼
Escape or outside click → lightbox closes

Visitor clicks "Verify" link
        │
        ▼
Open credential URL in new tab
Link hidden if no credential URL provided
```

---

## 7. Contact Form Flow

### 7.1 Standard Submission Flow

```
Visitor fills contact form:
  → Name (required)
  → Email (required, validated format)
  → Subject (required)
  → Message (required, min length)
        │
        ▼
Visitor clicks "Send Message"
        │
        ▼
Client-side validation runs
        │
        ├─ Invalid → Inline field errors shown
        │            Form does not submit
        │            Focus moves to first error field
        │
        └─ Valid → Submit button shows loading state ("Sending...")
                   Form fields disabled during submission
        │
        ▼
POST /api/contact
        │
        ├─ Success (201)
        │     → Form clears
        │     → Success message shown inline:
        │       "Message sent. I'll get back to you soon."
        │     → Submit button returns to default state
        │
        ├─ Rate limited (429)
        │     → Error message: "Too many messages. Please try again later."
        │     → Button returns to default state
        │
        └─ Server error (500)
              → Error message: "Something went wrong. Please try again."
              → Form data preserved (not cleared)
              → Button returns to default state
```

### 7.2 Field Validation Rules

| Field | Required | Validation |
|---|---|---|
| Name | Yes | 2–100 characters, no special characters only |
| Email | Yes | Valid email format (RFC 5321) |
| Subject | Yes | 2–200 characters |
| Message | Yes | 10–5000 characters |

Validation fires:
- On field blur (leave field) — show error if invalid
- On submit — validate all fields before sending
- On correction — clear error as user types valid input

### 7.3 Spam Protection

```
Rate limiting: max 3 submissions per IP per hour
Server-side: all fields validated and sanitised
Honeypot field (hidden): if filled → reject silently
```

---

## 8. Resume Flow

### 8.1 Resume Available

```
Visitor clicks "Download Resume" / "View Resume" button
        │
        ▼
API checks active resume status
        │
        ├─ Resume exists → Serve file
        │     → Download: trigger browser file download
        │     → View: open PDF in new browser tab
        │
        └─ No active resume → Button hidden or disabled
                              Tooltip: "Resume not available"
```

The resume action type (download vs view) is configurable in admin settings. The button label must match the configured action.

### 8.2 Resume Not Available

```
No active resume set in admin
        │
        ▼
Resume button is either:
  → Hidden entirely, or
  → Shown as disabled with tooltip "Coming soon"
(Configurable via website settings)
```

---

## 9. Social Links Flow

```
Visitor clicks any social icon
        │
        ▼
Open platform URL in new tab
rel="noopener noreferrer" applied to all external links
        │
        ▼
Multiple accounts on same platform:
  → If 2+ accounts: show platform label with account type
    (e.g. "Instagram — Personal", "Instagram — Professional")
  → Displayed as separate link items, not grouped under one icon
```

Only active social links are rendered publicly. Inactive links are completely absent from the DOM — not hidden via CSS.

---

## 10. Mobile Navigation Flow

### 10.1 Opening the Menu

```
Visitor taps hamburger icon
        │
        ▼
Hamburger icon morphs to X
Body scroll locks (overflow: hidden on body)
Full-screen overlay slides/fades in
Nav links stagger-animate into view
        │
        ▼
Menu is open
```

### 10.2 Closing the Menu

The menu can be closed in four ways:

```
Way 1: Tap X (close button)
        │
        ▼
Overlay animates out → body scroll unlocks

Way 2: Tap any navigation link
        │
        ▼
Menu closes → body scroll unlocks → smooth scroll to section

Way 3: Tap outside overlay content area
        │
        ▼
Overlay animates out → body scroll unlocks

Way 4: Press Escape key
        │
        ▼
Overlay animates out → body scroll unlocks → focus returns to hamburger
```

### 10.3 Menu State Rules

```
✅ Body scroll must always be locked when menu is open
✅ Focus must be trapped inside the overlay while open
✅ Escape key must always close the menu
✅ Opening/closing must never cause layout shift
✅ Background content must not be interactable while menu is open
✅ Menu state resets on navigation (never leave menu open after route change)
```

---

## 11. Admin Entry Flow

### 11.1 Locating Admin Access

```
Public visitor is on portfolio
        │
        ▼
Scrolls to footer
        │
        ▼
Notices small Admin icon (lock/shield) — bottom-right of footer
No label by default
Hover → subtle tooltip "Admin" appears
        │
        ▼
Clicks Admin icon
        │
        ▼
Navigate to /admin/login
```

The admin icon must:
- Be visually subtle — not draw attention from public visitors
- Never appear in the main navigation
- Never appear in the Hero section
- Never appear in the mobile menu

---

## 12. Admin Authentication Flow

### 12.1 Login Page Entry

```
User arrives at /admin/login
        │
        ├─ Already authenticated (valid JWT cookie)
        │     → Redirect to /admin/dashboard immediately
        │
        └─ Not authenticated
              → Show login page
              → Two login methods: Email/Password · Google
```

### 12.2 Email / Password Login Flow

```
Admin enters email + password
        │
        ▼
Clicks "Sign In"
        │
        ▼
Client-side validation:
  → Email format check
  → Password not empty
        │
        ├─ Invalid → Inline field errors shown
        │
        └─ Valid → Button: loading state ("Signing in...")
                   Fields: disabled
        │
        ▼
POST /api/auth/login
        │
        ├─ Success (200)
        │     → JWT set as HTTP-only cookie (server)
        │     → Redirect to /admin/dashboard
        │
        ├─ Invalid credentials (401)
        │     → Error: "Invalid email or password."
        │     → Fields re-enabled, button resets
        │     → Password field cleared, email retained
        │
        ├─ Account not authorised (403)
        │     → Error: "This account is not authorised."
        │     → Fields re-enabled, button resets
        │
        └─ Server error (500)
              → Error: "Something went wrong. Please try again."
              → Fields re-enabled, button resets
```

### 12.3 Google OAuth Login Flow

```
Admin clicks "Continue with Google"
        │
        ▼
Google OAuth consent screen opens
        │
        ├─ Admin cancels
        │     → Return to /admin/login, no error shown
        │
        └─ Admin authorises
              │
              ▼
              Google redirects to /api/auth/google/callback
              │
              ▼
              Server checks: is Google email in ADMIN_EMAILS list?
              │
              ├─ Authorised email
              │     → JWT set as HTTP-only cookie
              │     → Redirect to /admin/dashboard
              │
              └─ Unauthorised email
                    → Redirect to /admin/login
                      ?error=unauthorized
                    → Login page shows:
                      "This Google account is not authorised."
```

### 12.4 Login Page Error States

| Scenario | Message Shown |
|---|---|
| Wrong email/password | "Invalid email or password." |
| Unauthorised account | "This account is not authorised." |
| Google — unauthorised email | "This Google account is not authorised." |
| Network/server failure | "Something went wrong. Please try again." |
| Too many attempts | "Too many attempts. Please wait before trying again." |

Error messages appear inline below the form, not in a browser alert. They are not vague.

---

## 13. Admin Dashboard Flow

### 13.1 Dashboard Entry

```
Authenticated admin arrives at /admin/dashboard
        │
        ▼
Dashboard overview loads:
  → Stat cards (total projects, certs, skills, messages)
  → Recent activity feed
  → Resume status card
  → Quick action buttons
        │
        ▼
Admin navigates via sidebar to any management section
```

### 13.2 Sidebar Navigation

```
Admin clicks sidebar item (e.g. "Projects")
        │
        ▼
Navigate to /admin/projects
Active sidebar item highlights
        │
        ▼
Projects management page loads
```

### 13.3 Dashboard Overview Cards

Each stat card is a live count fetched on load:

| Card | Data Source |
|---|---|
| Total Projects | Count of all projects |
| Published Projects | Count of published only |
| Total Certificates | Count of all certificates |
| Unread Messages | Count of unread contact messages |
| Resume Status | Active / Not set |
| Last Updated | Timestamp of most recent content update |

---

## 14. Admin Content Management Flows

All content management sections follow the same base CRUD pattern. Section-specific variations are noted below.

### 14.1 Base CRUD Flow

#### List View

```
Admin navigates to management section (e.g. /admin/projects)
        │
        ▼
Table/list loads with all records
  → Columns: Title, Status, Order, Date, Actions
  → Actions per row: Edit | Delete | Toggle visibility
        │
        ├─ Loading → Table skeleton
        ├─ Empty   → "No [items] yet. Create your first one."
        │             + "Add [Item]" button
        └─ Error   → "Failed to load. Try again."
```

#### Create Flow

```
Admin clicks "Add [Item]" button
        │
        ▼
Navigate to /admin/[section]/new
        OR
Open drawer/modal (for simpler forms)
        │
        ▼
Admin fills form
        │
        ▼
Admin clicks "Save" / "Create"
        │
        ▼
Client-side validation runs
        │
        ├─ Invalid → Inline field errors, scroll to first error
        │
        └─ Valid → Submit (loading state on button)
        │
        ▼
POST /api/admin/[section]
        │
        ├─ Success → Toast: "[Item] created."
        │            Redirect to list view
        │            New item appears in list
        │
        └─ Error   → Toast: "Failed to create. Try again."
                     Form data preserved
                     Admin stays on form
```

#### Edit Flow

```
Admin clicks "Edit" on a list row
        │
        ▼
Navigate to /admin/[section]/:id
        OR
Open edit drawer/modal
        │
        ▼
Form pre-populated with existing data
        │
        ▼
Admin makes changes
        │
        ▼
Admin clicks "Save Changes"
        │
        ▼
PUT /api/admin/[section]/:id
        │
        ├─ Success → Toast: "Changes saved."
        │            Return to list
        │
        └─ Error   → Toast: "Failed to save. Try again."
                     Form data preserved
```

#### Delete Flow

```
Admin clicks "Delete" on a list row
        │
        ▼
Confirmation dialog appears:
  "Delete [Item Name]? This cannot be undone."
  [Cancel] [Delete]
        │
        ├─ Cancel → Dialog closes, nothing happens
        │
        └─ Confirm → DELETE /api/admin/[section]/:id
                │
                ├─ Success → Toast: "[Item] deleted."
                │            Row removed from list
                │
                └─ Error   → Toast: "Failed to delete. Try again."
                             Item remains in list
```

#### Visibility Toggle (Publish / Unpublish)

```
Admin clicks toggle on list row
        │
        ▼
Optimistic UI update (toggle flips immediately)
        │
        ▼
PATCH /api/admin/[section]/:id/visibility
        │
        ├─ Success → Toast: "[Item] published." or "[Item] unpublished."
        │
        └─ Error   → Revert toggle to previous state
                     Toast: "Failed to update. Try again."
```

---

### 14.2 Projects — Specific Flow

Additional fields and interactions beyond base CRUD:

```
"Featured" toggle:
  → Marks project as featured
  → Featured projects appear at top of public Projects section
  → Only 1–3 projects should be featured (soft limit, admin controlled)

"Display Order":
  → Drag-and-drop reorder in list view
  → Order persists to public site

"Publish / Unpublish":
  → Unpublished projects are invisible to public visitors
  → URL /projects/:id returns 404 for unpublished

Multiple image upload:
  → See File Upload Flow → Section 15
```

---

### 14.3 Resume — Specific Flow

```
Admin navigates to /admin/resume
        │
        ▼
Current resume status shown:
  → Active resume: filename, upload date, file size, preview link
  → No resume: "No resume uploaded."
        │
        ▼
Upload new resume:
  → Click "Upload Resume"
  → File picker opens (PDF only, max 5MB)
  → File selected → upload begins
  → Progress indicator shown
  → On success: new resume shown as active
  → Old resume replaced

Remove resume:
  → Click "Remove Resume"
  → Confirmation: "Remove resume? Visitors will no longer see a resume action."
  → Confirm → resume deleted → status shows "No resume uploaded."
```

---

### 14.4 Social Links — Specific Flow

```
Admin navigates to /admin/social-links
        │
        ▼
All social links listed with:
  → Platform icon + name
  → Username
  → Account type (Personal / Professional / etc.)
  → Active toggle
  → Drag handle for reorder
  → Edit / Delete actions
        │
        ▼
Add new social link:
  → Click "Add Social Link"
  → Select platform (dropdown with icons)
  → Enter username
  → Enter URL
  → Select account type
  → Toggle active
  → Save
        │
        ▼
Multiple accounts per platform:
  → Same platform can appear multiple times in list
  → Each treated as independent record
  → Both can be active simultaneously
        │
        ▼
Reorder:
  → Drag-and-drop list
  → Order reflects display order on public site
```

---

### 14.5 Contact Messages — Specific Flow

```
Admin navigates to /admin/messages
        │
        ▼
Message inbox loads:
  → List of messages (newest first)
  → Columns: Name, Email, Subject, Date, Status (Read/Unread)
  → Unread count badge in sidebar nav item
        │
        ▼
Admin clicks message row
        │
        ▼
Message detail view (inline expand or modal):
  → Full name, email, subject, message body, timestamp
  → Message automatically marked as "read" on open
        │
        ▼
Admin actions per message:
  → Mark unread: toggle back to unread state
  → Delete: confirmation → delete
        │
        ▼
Search messages:
  → Search bar at top of inbox
  → Filters by name, email, or subject
  → Results update as admin types

Filter messages:
  → All | Unread | Read
  → Filter persists during session
```

---

### 14.6 Skills — Specific Flow

```
Admin navigates to /admin/skills
        │
        ▼
Skills shown grouped by category
  OR flat list with category column
        │
        ▼
Each skill has:
  → Icon picker / icon URL
  → Name
  → Category (dropdown)
  → Proficiency indicator
  → Display order (drag in category group)
  → Visibility toggle
        │
        ▼
Category management:
  → Admin can rename categories
  → Admin can assign skills to categories
  → Empty categories are hidden on public site
```

---

### 14.7 Gallery — Specific Flow

```
Admin navigates to /admin/gallery
        │
        ▼
Gallery grid shows all uploaded images
  → Thumbnail
  → Title
  → Published status
  → Edit / Delete / Reorder actions
        │
        ▼
Upload image:
  → Click "Upload Image"
  → File picker (image files only, max 5MB)
  → Add title (required) and description (optional)
  → Toggle published
  → Save
        │
        ▼
Reorder:
  → Drag-and-drop grid or list
  → Order reflects display on public site
```

---

## 15. Admin File Upload Flow

This flow applies to: profile image, resume, certificate images/PDFs, project images, gallery images.

### 15.1 Standard File Upload

```
Admin triggers file upload (button click or drag-drop zone)
        │
        ▼
File picker opens (OS native)
        │
        ▼
Admin selects file
        │
        ▼
Client-side pre-validation:
  → File type check (MIME + extension)
  → File size check (per-type limit)
        │
        ├─ Invalid type  → Error: "Only [allowed types] files are accepted."
        │                  No upload initiated
        │
        ├─ Too large     → Error: "File must be under [limit]. Yours is [size]."
        │                  No upload initiated
        │
        └─ Valid → Upload begins
        │
        ▼
Upload progress shown:
  → Progress bar or spinner
  → "Uploading... X%"
  → Cancel button available during upload
        │
        ▼
POST /api/admin/upload (multipart/form-data)
        │
        ├─ Success → Preview shown immediately
        │            Toast: "File uploaded."
        │            File reference saved with record
        │
        ├─ Server validation fail → Toast: "Invalid file."
        │                           Upload removed, previous state restored
        │
        └─ Network error → Toast: "Upload failed. Try again."
                           Upload removed, previous state restored
```

### 15.2 File Type Limits

| File Type | Allowed Formats | Max Size |
|---|---|---|
| Profile image | JPG, PNG, WebP | 2MB |
| Resume | PDF | 5MB |
| Certificate image | JPG, PNG, WebP | 2MB |
| Certificate PDF | PDF | 10MB |
| Project images | JPG, PNG, WebP | 2MB each |
| Gallery images | JPG, PNG, WebP | 2MB |

### 15.3 File Replace Flow

```
Existing file already uploaded for a record
        │
        ▼
Admin clicks "Replace" or uploads a new file to the same slot
        │
        ▼
New file validated → uploaded
        │
        ▼
New file replaces old file
Old file deleted from storage
        │
        ▼
Preview updates to new file
Toast: "File replaced."
```

---

## 16. Admin Session Flow

### 16.1 Active Session

```
Admin is authenticated (valid JWT in HTTP-only cookie)
        │
        ▼
All /admin/* routes accessible
All /api/admin/* endpoints return data
Session persists until:
  → JWT expires
  → Admin logs out manually
  → Cookie is cleared
```

### 16.2 Session Expiry

```
Admin JWT expires during active session
        │
        ▼
Admin attempts any protected action (API call)
        │
        ▼
API returns 401 Unauthorized
        │
        ▼
Frontend detects 401
        │
        ▼
Redirect to /admin/login
Query param: ?session=expired
        │
        ▼
Login page shows notice:
"Your session expired. Please sign in again."
```

### 16.3 Manual Logout

```
Admin clicks "Logout" (top-right of admin header)
        │
        ▼
POST /api/auth/logout
        │
        ▼
Server clears HTTP-only cookie
        │
        ▼
Redirect to /admin/login
No session expiry message shown
```

### 16.4 Unauthorised Direct Access

```
Unauthenticated user manually types /admin/dashboard
        │
        ▼
Frontend route guard: no auth token detected
        │
        ▼
Redirect to /admin/login immediately
No flash of admin dashboard content
```

---

## 17. Error and Edge Case Flows

### 17.1 Public API Failure — Section Level

```
Section data fails to load (network error / server error)
        │
        ▼
That section shows its own error state:
  → Error icon + "Something went wrong."
  → "Try again" button (retries the section's API call)
        │
        ▼
All other sections continue working normally
Page does not crash
```

### 17.2 Project Not Found — /projects/:id

```
Visitor visits /projects/:id where ID does not exist
OR project is unpublished
        │
        ▼
API returns 404
        │
        ▼
Page shows 404 state:
  → "Project not found."
  → "Back to Portfolio" button → navigate to /
```

### 17.3 Admin 404 — Unknown Admin Route

```
Admin visits /admin/nonexistent
        │
        ▼
Admin 404 page:
  → "Page not found."
  → "Go to Dashboard" button → /admin/dashboard
```

### 17.4 Public 404 — Unknown Public Route

```
Visitor visits any unknown URL
        │
        ▼
Public 404 page:
  → TECORITHAM branding
  → "Page not found."
  → "Go Home" button → /
```

### 17.5 Unsaved Changes Warning — Admin Forms

```
Admin has unsaved changes in a form
        │
        ▼
Admin attempts to navigate away
  → Click sidebar link
  → Click browser back
  → Close tab
        │
        ▼
Browser confirmation dialog:
"You have unsaved changes. Leave without saving?"
[Stay] [Leave]
        │
        ├─ Stay  → Dialog closes, admin remains on form
        └─ Leave → Navigate away, changes lost
```

### 17.6 Delete Confirmation — Required

No destructive action (delete, remove, replace) may execute without an explicit confirmation step. This applies to:
- Deleting any content record
- Removing the active resume
- Deleting a contact message
- Removing a gallery image

Confirmation must name the specific item being deleted when possible.

---

## 18. Flow Transition Rules

These rules govern how all flows behave during navigation and state changes.

### 18.1 Page Transitions

| Transition Type | Behaviour |
|---|---|
| Public scroll-to-section | Smooth scroll, 400ms – 600ms |
| Public route change (/ → /projects/:id) | Fade out → fade in |
| Admin route change | Instant (no animation delay for productivity) |
| Admin redirect (unauth → login) | Instant, no flash |
| Login → dashboard | Brief fade, no delay |

### 18.2 Loading State Rules

```
✅ Every data-dependent UI must show a skeleton or spinner while loading
✅ Skeletons must match the exact dimensions of the content they replace
✅ Loading states must never block the entire page for a section-level request
✅ Buttons must show loading state during async actions (disabled + spinner)
✅ Loading state must never exceed 10 seconds without a timeout error
```

### 18.3 Toast Notification Rules

```
✅ Every mutating action (create, update, delete, upload) must show a toast
✅ Toast duration: 3000ms for success, 5000ms for errors
✅ Maximum 1 toast visible at a time (queue additional ones)
✅ Toast position: fixed, bottom-right (desktop) | bottom-center (mobile)
✅ Toast must not block form interaction
✅ Errors must describe what failed, not just "Error"
```

### 18.4 Focus Management Rules

```
✅ When a modal opens → focus moves to the modal's first interactive element
✅ When a modal closes → focus returns to the element that opened it
✅ When navigating to a new admin page → focus moves to page heading or first field
✅ When a form error occurs → focus moves to first error field
✅ Escape key always closes: modals, drawers, lightboxes, mobile nav
```

### 18.5 Scroll Rules

```
✅ Body scroll locks when: mobile nav open, lightbox open, modal open
✅ Body scroll restores when: all overlays are closed
✅ Scroll position preserves when returning to list view from detail/edit
✅ Admin dashboard does not interfere with public scroll behaviour
```

---

## Document Relationships

| Document | Covers |
|---|---|
| `PRD.md` | What the product must do |
| `DESIGN.md` | How the product must look |
| `MOTION_DESIGN_SYSTEM.md` | How the product must move and animate |
| **`APP_FLOW.md`** ← this document | How users navigate and interact |
| `ARCHITECTURE.md` | How the product is built technically |
| `API_DOCUMENTATION.md` | REST endpoint contracts |
| `DATABASE.md` | Data schema and storage |

---

*APP_FLOW.md — TECORITHAM Portfolio v1.0 · Owned by TECORITHAM*
