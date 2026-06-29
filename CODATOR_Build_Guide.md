# CODATOR — Website & Admin Platform Build Guide

**Assumptions made in this doc (change anything that doesn't fit):**
- Stack: Next.js (App Router) + TypeScript + Tailwind CSS, since you already work in React daily for client projects — this keeps the codebase familiar.
- Backend: Supabase (Postgres + Auth + Storage + Edge Functions + Row Level Security). You've already used Firebase for CIRO, so that's a perfectly fine swap if you'd rather stay in tools you know — the schema in this doc maps to either.
- Email: Resend + React Email for transactional mail (congratulations email, pass delivery). Nodemailer + Gmail SMTP is a fine free fallback if you don't want another account.
- ID format and pass design are recommendations, not hard requirements — placeholders are marked so you can swap them for CODATOR's real identity.

---

## Table of Contents
1. [What CODATOR Is](#1-what-codator-is)
2. [Tech Stack](#2-tech-stack)
3. [Sitemap](#3-sitemap)
4. [Design System](#4-design-system)
5. [Page-by-Page Spec](#5-page-by-page-spec)
6. [Membership & CODATOR ID System](#6-membership--codator-id-system)
7. [Virtual Event Pass](#7-virtual-event-pass)
8. [Email Automation](#8-email-automation)
9. [Admin Dashboard Spec](#9-admin-dashboard-spec)
10. [Data Model](#10-data-model)
11. [Folder Structure](#11-folder-structure)
12. [Security Notes](#12-security-notes)
13. [Content Authenticity Checklist](#13-content-authenticity-checklist)
14. [Build Roadmap — Phases 0 to 8](#14-build-roadmap--phases-0-to-8)
15. [How to Feed This to Antigravity](#15-how-to-feed-this-to-antigravity)

---

## 1. What CODATOR Is

CODATOR is a university Computer Science / Computer Engineering society. The site has two faces:

- **Public-facing portfolio site** — what CODATOR is, what it does, its events, its team, and how to join.
- **A members-only system behind it** — students apply, you (the admin) review and approve, approved students get a unique CODATOR ID and a digital event pass, and you can publish events from the same dashboard.

Two user types exist:
- **Visitor / Applicant** — browses the public site, can submit a membership application.
- **Admin (you)** — reviews applications, manages members, publishes events, sends announcements.

A third role can be added later without much extra work:
- **Member** — once approved, can log in to a lightweight portal to see their ID, download their pass, and see their event history.

> Before building, write CODATOR's real one-paragraph mission and a one-line tagline. Don't let placeholder marketing copy ship — see [Section 13](#13-content-authenticity-checklist).

---

## 2. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 15 (App Router, TypeScript) | Server components for fast public pages, route handlers for API logic, one codebase for site + dashboard |
| Styling | Tailwind CSS + CSS variables for theme tokens | Fast to build, easy to keep the palette consistent and easy to override the "default Tailwind look" |
| Components | shadcn/ui, **restyled** with your own tokens (radius, shadows, fonts) — don't ship its default look | Accessible, unopinionated base you can make distinctly yours |
| Animation | Framer Motion (text reveals, page transitions) + a lightweight canvas/SVG layer for the hero's signature animation | Framer Motion alone is enough for 90% of this; no need for heavy 3D |
| Auth + DB | Supabase (Postgres, Auth, Storage, Edge Functions, Row Level Security) | Members/events/registrations are relational data — Postgres fits naturally, and RLS gives you admin-vs-member data separation almost for free |
| Email | Resend + React Email | Clean templating in JSX, good deliverability, generous free tier |
| QR / Pass generation | `qrcode` (npm) for QR codes, `@vercel/og` or `satori` for generating the pass image server-side | Keeps pass generation server-side and consistent |
| Image handling | `next/image` with Supabase Storage or Cloudinary as the asset host | You can upload 4K source images; Next.js will still serve responsive, optimized sizes — see [4.4](#44-imagery--4k-handling) |
| Hosting | Vercel (frontend + API routes) + Supabase (backend) | Free tiers cover a society site comfortably |
| Icons | Lucide icons | Clean single-weight line icons, not the rounded "AI gradient blob" icon style |

---

## 3. Sitemap

```
/                      Home
/about                 About CODATOR (mission, history, what we do)
/events                All events (filter: upcoming / past / category)
/events/[slug]         Single event detail + registration
/team                  Leadership / core team
/join                  Membership application form
/gallery               Project & event showcase
/contact               Contact / socials

/portal                Member portal (auth-gated)
/portal/id-card        View & download CODATOR ID + virtual pass
/portal/events         My registered events

/admin                 Admin dashboard (auth-gated, admin role only)
/admin/applications     Pending membership applications
/admin/members          All members (search, filter, manage)
/admin/events           Event CRUD
/admin/events/[id]/checkin   QR check-in tool for event entry
/admin/announcements    Email broadcast to members
/admin/settings         Admin users, ID format config
```

---

## 4. Design System

### 4.1 Color Palette

Light, minimal, with purple and blue carrying most of the weight and a small amount of warm red used only for emphasis — never as a base color.

| Name | Hex | Use |
|---|---|---|
| **Paper** | `#FAFAFC` | Page background (not pure white — slightly warmer, less clinical) |
| **Ink** | `#1C1B29` | Primary text (near-black, not pure black — softer on the eyes) |
| **Wisteria** (primary purple) | `#8B7FE8` | Primary brand color — buttons, links, headline accents |
| **Wisteria Tint** | `#EDEAFB` | Soft purple section backgrounds, hover states |
| **Skyline** (primary blue) | `#5B8DEF` | Secondary brand color — icons, secondary buttons, charts |
| **Skyline Tint** | `#E3EDFC` | Soft blue section backgrounds |
| **Ember** (accent red) | `#F2756B` | Sparingly: "live now" badges, deadlines, destructive actions, hackathon tags — never a section background |
| **Mist** | `#E8E7F0` | Borders, dividers |

Rule of thumb: any single screen should read as white space first, purple/blue second, and red as a single accent point at most — not a competing third color block.

### 4.2 Typography

Avoid the default "Inter everywhere" look — pair a distinct display face with a quieter body face, and use a mono face where it's thematically earned (CS society → IDs, code-like data look intentional, not decorative):

- **Display (headlines):** Clash Display or General Sans — geometric, confident, a little technical. Used at large sizes, restrained weight changes elsewhere.
- **Body:** Satoshi or IBM Plex Sans — clean, highly readable at small sizes.
- **Mono (utility):** JetBrains Mono — used specifically for CODATOR IDs, timestamps, and any code-styled snippet. This is a deliberate nod to the subject matter, not decoration.

Set a real type scale (e.g. 14 / 16 / 18 / 24 / 32 / 48 / 64px) and stick to it everywhere instead of ad-hoc sizes per component.

### 4.3 Iconography

Lucide icons throughout, single stroke weight, no fill, no drop shadows. Icons should always sit next to a text label in navigation — never icon-only nav items. Avoid 3D/gradient icon packs; they're a strong "AI template" tell.

### 4.4 Imagery & 4K Handling

- Source real photography: actual campus shots, actual event photos, actual member/team photos (with consent) — not generic "diverse students around a laptop" stock photography. This is the single biggest thing that makes a society site feel authentic instead of templated.
- It's fine to shoot/source images at 4K, but never ship a raw 4K file to the browser. Run everything through `next/image` (or your storage provider's transform API) so the browser only ever downloads the size it actually displays, in WebP/AVIF. "4K image" should mean *high-quality source*, not *4K bytes on the wire*.
- For abstract/decorative graphics (hero background, section dividers), prefer custom SVG/canvas work over stock illustration packs — this is also lighter than a 4K decorative image and animates better.

### 4.5 "Don't Look AI-Made" Checklist

Run every page against this before calling it done:
- [ ] No generic floating 3D gradient blobs behind every section
- [ ] No glassmorphism card on literally every element
- [ ] Not entirely one typeface (see 4.2)
- [ ] No "Unleash your potential" / "Empowering tomorrow's innovators" filler copy — real, specific sentences only
- [ ] No numbered `01 / 02 / 03` markers unless the content is a genuine sequence (e.g. the "how to join" steps below legitimately are one; a row of unrelated feature cards is not)
- [ ] No stock photography of generic laptops/handshakes
- [ ] One clear signature moment per page (see hero spec below) — not five competing animated elements

### 4.6 Hero Signature Element — "Constellation Reveal"

This is the one bold, memorable moment of the whole site; everything else stays quiet around it.

On load, a sparse network of small nodes and connecting lines draws itself across the hero background (light Wisteria/Skyline strokes, very low opacity, white space dominant) and converges into the CODATOR wordmark/monogram. Once it settles, it idles as a faint, slow ambient pulse — never distracting, always secondary to the text on top of it. The headline reveals word-by-word over it via a clip-path/stagger animation (Framer Motion), slightly delayed so the network "finishes building" just before the text lands. A single CTA ("Apply for Membership") fades in last.

This deliberately ties the brand (a society about building connected systems) to the one animated moment on the page, instead of scattering ambient motion across the whole site.

ASCII layout sketch:

```
┌──────────────────────────────────────────────┐
│  [logo]                  nav · nav · nav  [Join]│
│                                                │
│        · ─ ·                                  │
│      ·   ╲ │  ╲ ·        CODATOR              │
│        ·   ·╲ ·          Building <reveal>     │
│      ·  ╲ │ ╱  ·         the systems that      │
│        · ─ ·             run tomorrow.         │
│                                                │
│                       [Apply for Membership →] │
│                       [See Upcoming Events]    │
└──────────────────────────────────────────────┘
```

Below the hero, keep it calm: an upcoming-events strip, a short "what we do" section (3–4 real activities, not generic feature cards), and a membership CTA band before the footer.

---

## 5. Page-by-Page Spec

### 5.1 Home
- Hero (above)
- "What CODATOR does" — 3–4 real activities (hackathons, workshops, project showcases, peer mentorship — whatever you actually run), each with a real photo, not an icon-only card
- Upcoming events strip (pulls live from the events table, max 3, "See all events →")
- Membership CTA band: short copy + Apply button
- Footer: socials, contact, quick links

### 5.2 About
- Mission paragraph (your real one)
- What the society actually does, in plain terms
- Optional: timeline of milestones — only if it's a real timeline with real dates, not a filler "01/02/03" graphic

### 5.3 Events
- Filter: Upcoming / Past / category (Hackathon, Workshop, Seminar, Social)
- Each card: banner image, date, location, "Free for members" badge, capacity remaining
- `/events/[slug]`: full description, date/time, location (map embed if physical), register button (members get one-click registration using their stored profile; non-members are routed to `/join` or a guest-registration form, your call)

### 5.4 Team
- Real names, real photos, real roles. No filler bios.

### 5.5 Join CODATOR (Application Form)
Fields:
- Full name
- University roll number
- Department (CS / CE / etc.)
- Batch / semester
- University email (recommended: validate the domain matches your university's so only real students can apply)
- Phone (optional)
- Why do you want to join? (short text)
- Skills / interests (optional, multi-select: web dev, ML, security, competitive programming, design…)

On submit: row inserted with `status = pending`, applicant sees a "we'll review and email you" confirmation. No CODATOR ID is assigned yet — that only happens on approval (see Section 6).

### 5.6 Member Portal (`/portal`)
- Auth-gated, only visible once `status = active`
- `/portal/id-card`: shows their CODATOR ID, name, department, batch, and the virtual pass (with a Download button)
- `/portal/events`: events they've registered for, with check-in status

### 5.7 Gallery
- Real event/project photos. This is a good place for your authentic 4K photography to actually matter, since it's the section people zoom into.

### 5.8 Contact
- Real email, real socials, optionally a simple contact form that emails you directly (Resend again, or a `mailto:` if you want zero backend for this one page).

---

## 6. Membership & CODATOR ID System

### 6.1 Lifecycle
```
applicant submits form
        ↓
status: pending  ──(admin rejects)──→ status: rejected (notified by email, can reapply)
        ↓ (admin approves)
status: active  →  CODATOR ID generated  →  congratulations email + pass sent
        ↓ (admin can later)
status: suspended   (pass becomes invalid at check-in, doesn't delete history)
```

### 6.2 ID Format

Recommended: `CODATOR-<YY>-<SEQ>`
Example: `CODATOR-26-0143` → 143rd member approved in 2026.

Optional department-aware variant if you want department visible in the ID itself:
`CODATOR-<YY><DEPT>-<SEQ>` → `CODATOR-26CS-0143`

Generation logic (pseudocode):
```ts
async function generateCodatorId(member) {
  const year = new Date().getFullYear().toString().slice(-2);
  const count = await countApprovedMembersThisYear(year); // sequential, scoped per year
  const seq = String(count + 1).padStart(4, '0');
  return `CODATOR-${year}-${seq}`;
  // department variant: `CODATOR-${year}${member.deptCode}-${seq}`
}
```
Run this inside the same database transaction as the approval update, so two simultaneous approvals never collide on the same sequence number.

### 6.3 What Happens on Approval (single flow)
1. Admin clicks "Approve" on an application.
2. Server generates the CODATOR ID (6.2).
3. A signed pass token is generated (see Section 7).
4. Member row updated: `status = active`, `codator_id`, `approved_at`, `approved_by`.
5. Congratulations email is queued/sent with the ID and the generated pass image attached (Section 8).
6. Member can now log into `/portal`.

---

## 7. Virtual Event Pass

A single digital pass per member, reused for every event (re-issuing a new pass per event isn't necessary unless you want event-specific passes later).

### 7.1 What's On It
- CODATOR logo/wordmark
- Member's name
- CODATOR ID (mono font, large, the clear focal point of the card)
- Department + batch year
- A QR code
- A subtle "Verified Member" badge

### 7.2 Anti-Forgery
The QR code should encode a signed token, not just the raw ID — otherwise anyone could draw up a fake card with a made-up ID.

```ts
// server-side, on approval
const token = signHmac(`${member.id}|${member.codator_id}`, process.env.PASS_SECRET);
// QR encodes: https://yoursite.com/verify?id=<member.id>&token=<token>
```
At event check-in, scanning the QR hits a `/verify` endpoint that recomputes the HMAC and checks it matches, then checks the member's current `status` is `active` (so a suspended member's old pass stops working automatically, even though the QR code itself never changes).

### 7.3 Generating the Pass Image
Generate it server-side (e.g. with `satori`/`@vercel/og`, rendering a JSX template to PNG) rather than asking the user's browser to screenshot a DOM card — this keeps the design pixel-consistent and makes it trivial to attach the same image to the email.

### 7.4 Check-In Tool
`/admin/events/[id]/checkin` — opens the device camera, scans the QR, looks up the member, shows green "✓ Valid member — entry granted" or red "✗ Invalid / not a member" with the reason (not found, suspended, wrong event if you go event-specific later). Logs a `checked_in_at` timestamp against that event registration.

---

## 8. Email Automation

Trigger: member `status` changes to `active`.

Email contents:
- Warm, specific congratulations copy (not generic "Welcome aboard!" filler — name the society, name what they can now do: register for events free, etc.)
- Their CODATOR ID, set in the mono face so it visually matches the pass
- The pass image attached (and also a link to view/download it from `/portal/id-card`, in case the attachment gets stripped by their mail client)

Suggested stack: Resend + React Email — write the template as a JSX component so it's easy to keep visually consistent with the site itself, instead of an inline HTML string.

```ts
await resend.emails.send({
  from: 'CODATOR <noreply@yourdomain.com>',
  to: member.email,
  subject: 'Welcome to CODATOR — your membership is confirmed',
  react: WelcomeEmail({ member, passImageUrl }),
});
```

If you'd rather avoid a new email-provider account for now, Nodemailer + your university or personal Gmail (via an app password) works for a low-volume society and you can swap to Resend later without changing the rest of the system.

A rejection email should exist too — short, polite, and not a dead end (e.g. "you're welcome to apply again next semester").

---

## 9. Admin Dashboard Spec

Sidebar sections:

| Section | What it does |
|---|---|
| **Overview** | Pending applications count, total active members, upcoming events, a small members-by-department chart |
| **Applications** | List of `pending` applicants → view full submission → Approve / Reject (with optional note) |
| **Members** | Search/filter all members by status, department, batch; view profile; suspend/reinstate; manually resend pass email |
| **Events** | Create/edit/delete events (title, rich description, date/time, location, banner upload, category, capacity, "free for members" toggle, publish/draft) |
| **Check-In** | Per-event QR scanner tool (Section 7.4) |
| **Announcements** | Compose and send a broadcast email to all active members (or a filtered subset, e.g. only CS department) |
| **Settings** | Manage other admin accounts, configure ID format if you want it editable rather than hardcoded |

Approval screen specifically should show everything the applicant submitted plus quick context (department, batch) so you're not approving blind.

---

## 10. Data Model

```sql
-- members
id              uuid primary key default gen_random_uuid()
full_name       text not null
university_roll text not null
department      text not null
batch_year      text not null
email           text not null unique
phone           text
why_join        text
skills          text[]            -- optional multi-select
status          text not null default 'pending'  -- pending | active | rejected | suspended
codator_id      text unique       -- null until approved
pass_token      text              -- signed HMAC token for QR
role            text not null default 'member'   -- member | admin
applied_at      timestamptz default now()
approved_at     timestamptz
approved_by     uuid references members(id)

-- events
id              uuid primary key default gen_random_uuid()
title           text not null
slug            text unique not null
description     text not null
category        text not null      -- hackathon | workshop | seminar | social
date_start      timestamptz not null
date_end        timestamptz
location        text
banner_url      text
capacity        integer
free_for_members boolean default true
is_published    boolean default false
created_by      uuid references members(id)
created_at      timestamptz default now()

-- event_registrations
id              uuid primary key default gen_random_uuid()
event_id        uuid references events(id)
member_id       uuid references members(id)
registered_at   timestamptz default now()
checked_in_at   timestamptz
```

Row Level Security (Supabase): members can only read/update their own row; only `role = admin` can read the full `members` table, update `status`, or write to `events`. This means your admin/member data separation is enforced at the database level, not just hidden in the UI.

---

## 11. Folder Structure

```
codator/
├─ app/
│  ├─ (public)/
│  │  ├─ page.tsx                 → Home
│  │  ├─ about/page.tsx
│  │  ├─ events/page.tsx
│  │  ├─ events/[slug]/page.tsx
│  │  ├─ team/page.tsx
│  │  ├─ join/page.tsx
│  │  ├─ gallery/page.tsx
│  │  └─ contact/page.tsx
│  ├─ portal/
│  │  ├─ page.tsx
│  │  ├─ id-card/page.tsx
│  │  └─ events/page.tsx
│  ├─ admin/
│  │  ├─ page.tsx                 → overview
│  │  ├─ applications/page.tsx
│  │  ├─ members/page.tsx
│  │  ├─ events/page.tsx
│  │  ├─ events/[id]/checkin/page.tsx
│  │  ├─ announcements/page.tsx
│  │  └─ settings/page.tsx
│  └─ api/
│     ├─ applications/route.ts
│     ├─ members/[id]/approve/route.ts
│     ├─ members/[id]/reject/route.ts
│     ├─ verify/route.ts            → pass verification
│     └─ pass/[id]/route.ts         → server-generated pass image
├─ components/
│  ├─ ui/                          → restyled shadcn primitives
│  ├─ hero/constellation-reveal.tsx
│  ├─ pass-card.tsx
│  └─ ...
├─ emails/
│  ├─ welcome.tsx
│  └─ rejection.tsx
├─ lib/
│  ├─ supabase/
│  ├─ id-generator.ts
│  └─ pass-token.ts
└─ public/
```

---

## 12. Security Notes

- Validate the applicant's email domain against your university's domain at submission time, so the applications you review are at least plausibly real students.
- Rate-limit the `/join` submission endpoint (e.g. via middleware or Supabase Edge Function) to stop spam applications.
- Keep `PASS_SECRET`, the Resend API key, and the Supabase service-role key server-side only — never in client bundle env vars (no `NEXT_PUBLIC_` prefix on any of these).
- Admin routes (`/admin/**`) should check `role = admin` in middleware, not just hide the nav link — hiding a link in the UI is not access control.
- Sanitize all user-submitted text (application "why join" field, announcement composer) before rendering anywhere.

---

## 13. Content Authenticity Checklist

Before launch, make sure every one of these is real, not placeholder:
- [ ] Mission statement — your actual words, not generated filler
- [ ] Team photos and names — real people, real consent to publish
- [ ] Event photos — real CODATOR events, not stock
- [ ] Stats (member count, events run) — real numbers, updated, not invented round numbers
- [ ] Testimonials, if you use any — real quotes from real members, with their permission
- [ ] Contact info / socials — real and monitored

---

## 14. Build Roadmap — Phases 0 to 8

### Phase 0 — Setup
- Init Next.js + TypeScript + Tailwind project
- Set up Supabase project, define the three tables (Section 10), enable RLS
- Define Tailwind theme tokens from the color/type system in Section 4
- Set up the repo folder structure (Section 11)
- **Done when:** empty pages exist for every route in the sitemap, theme tokens are in place, Supabase connects successfully.

### Phase 1 — Static Pages & Design System
- Build Home (including the hero — this is the one page worth spending real animation time on), About, Team, Contact, Gallery as static/content pages
- Build the shared Navbar/Footer
- **Done when:** every public page looks finished with placeholder-free copy and real (or real-ish, swappable) imagery, fully responsive.

### Phase 2 — Membership Application
- Build `/join` form → inserts into `members` with `status = pending`
- Confirmation screen/email ("we'll review and get back to you")
- **Done when:** a test submission correctly lands in the database as `pending`.

### Phase 3 — Admin Auth & Applications Review
- Supabase Auth for admin login
- `/admin/applications`: list pending, view full submission, Approve/Reject
- **Done when:** you can log in as admin and see real submitted applications.

### Phase 4 — ID Generation + Approval Email + Pass
- Implement `generateCodatorId` (Section 6.2) inside the approval transaction
- Implement pass token signing + server-rendered pass image (Section 7)
- Wire up the welcome email with the pass attached (Section 8)
- **Done when:** approving a test application results in a real CODATOR ID, a generated pass image, and a received email — end to end.

### Phase 5 — Events Module
- `/admin/events`: create/edit/delete, banner upload, publish toggle
- Public `/events` and `/events/[slug]` pulling from the same table
- Registration flow (members one-click; decide your guest-registration approach)
- **Done when:** an event created in the dashboard appears correctly on the public site and can be registered for.

### Phase 6 — Member Portal
- `/portal/id-card`: shows ID + downloadable pass
- `/portal/events`: registration history
- **Done when:** a real approved member can log in and see their own ID and pass.

### Phase 7 — Check-In Tool
- `/admin/events/[id]/checkin`: camera-based QR scan → `/api/verify` → valid/invalid result, logs `checked_in_at`
- **Done when:** scanning a real generated pass at a test "event" correctly grants/denies entry and logs the timestamp.

### Phase 8 — Polish & Launch
- Full pass over the "Don't Look AI-Made" checklist (4.5) and the Content Authenticity checklist (13)
- Accessibility pass: keyboard focus visible everywhere, reduced-motion respected for the hero animation
- SEO basics (metadata, OpenGraph images per page)
- Real device testing (the check-in tool especially needs testing on the phone you'll actually use at events)
- Deploy

---

