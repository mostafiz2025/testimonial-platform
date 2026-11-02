# Product Requirements Document (PRD)

**Product:** Praisely – Testimonial Collection & Wall of Love Platform
**Reference product:** Testimonial.to (same core idea)
**Version:** 1.0
**Status:** MVP implemented
**Stack:** NestJS + TypeORM + PostgreSQL (backend), Next.js + Tailwind + shadcn (frontend)

---

## 1. Overview

Praisely lets a business collect **text and video testimonials** from its customers through a single shareable link, choose the best ones, and display them on a **Wall of Love** that can be shared or embedded on any website.

Customers do not need an account. Business owners manage everything from a dashboard. A platform administrator oversees all accounts.

## 2. Problem Statement

- Businesses want social proof (testimonials) but chasing customers by e-mail is slow and manual.
- Customers will not create accounts or install apps just to leave a review.
- Video testimonials convert best, but collecting them usually needs technical tools.
- Showing testimonials on a website normally needs a developer.

## 3. Goals and Non-Goals

### 3.1 Goals
1. Let an owner create a collection page in under 2 minutes.
2. Let a customer submit a text or video testimonial in under 2 minutes, with no sign-up.
3. Let an owner curate testimonials (like, archive, delete) and publish a wall with one line of embed code.
4. Give the platform admin control over users, spaces and content.

### 3.2 Non-Goals (not in version 1.0)
- Paid plans, billing, usage limits
- Importing testimonials from social networks (Twitter/X, LinkedIn, Google)
- Team members / multi-user workspaces
- Custom domains for collection pages
- Video transcoding, captions, thumbnails
- AI features (summaries, tagging, sentiment)
- Native mobile apps

## 4. Target Users and Personas

| Persona | Description | Main needs |
|---|---|---|
| **Business Owner** (primary) | Founder, marketer or freelancer who sells a product or service | Collect testimonials fast, show them on the website |
| **Customer / Respondent** | Person who bought from the owner | Leave feedback quickly, without registering, from phone or laptop |
| **Website Visitor** | Prospect viewing the wall | Read credible, real testimonials |
| **Platform Admin** | Operator of the platform | Monitor usage, remove abusive users or content |

## 5. User Stories

### Business Owner
- As an owner, I can register and log in so my data is private.
- As an owner, I can create a **Space** for each project/product with its own link.
- As an owner, I can customise the collection page (logo, title, message, questions, button colour, which fields to ask, thank-you message) and see a live preview.
- As an owner, I can see every testimonial in an inbox and filter by All / Video / Text / Wall of Love / Archived, and search.
- As an owner, I can ❤️ a testimonial to put it on my wall, archive it, or delete it.
- As an owner, I can manually add a testimonial I received elsewhere.
- As an owner, I can choose the wall theme (light/dark) and layout (masonry/grid) and copy the embed code.
- As an owner, I can pause a space so it stops accepting testimonials.
- As an owner, I can see statistics (totals, video count, average rating, last 14 days).
- As an owner, I can edit my profile, photo and password.
- As an owner, I can receive an e-mail when a new testimonial arrives (optional).

### Customer
- As a customer, I can open the link on any device and write a testimonial.
- As a customer, I can record a video from my browser camera or upload a video file.
- As a customer, I can give a star rating, my name, e-mail, job title, company and photo (depending on what the owner enabled).
- As a customer, I must give permission before my testimonial can be used.
- As a customer, I see a thank-you page after sending.

### Website Visitor
- As a visitor, I can view the Wall of Love and play video testimonials.

### Admin
- As an admin, I can log in separately and view platform statistics.
- As an admin, I can ban/unban or delete users, delete spaces and delete testimonials.

## 5.1 Core User Flows

**Owner flow:** Register → Create space → Copy link → Share with customers → Review inbox → ❤️ best ones → Copy embed code → Paste on website.

**Customer flow:** Open link → Choose "Record a video" or "Send a text" → Fill form → Give consent → Send → Thank-you page.

**Admin flow:** Admin login → Overview → Manage users / spaces / testimonials.

## 6. Feature List and Priority

| # | Feature | Priority | Status |
|---|---|---|---|
| F1 | Owner registration / login (JWT) | Must | Done |
| F2 | Space CRUD with unique public URL | Must | Done |
| F3 | Customisable collection page + live preview | Must | Done |
| F4 | Public text testimonial submission | Must | Done |
| F5 | Public video testimonial (record in browser / upload) | Must | Done |
| F6 | Star rating, photo, job title, company, e-mail fields (toggleable) | Should | Done |
| F7 | Testimonial inbox with filters and search | Must | Done |
| F8 | Like (Wall of Love), archive, delete | Must | Done |
| F9 | Manual testimonial import | Should | Done |
| F10 | Public Wall of Love page | Must | Done |
| F11 | Embeddable wall (script + iframe, auto-resize) | Must | Done |
| F12 | Wall appearance settings (theme, layout, rating/date/branding) | Should | Done |
| F13 | Owner dashboard statistics | Should | Done |
| F14 | Profile, avatar, change password | Should | Done |
| F15 | Admin panel (stats, users, spaces, testimonials, ban) | Must | Done |
| F16 | E-mail notification on new testimonial | Could | Done (optional, needs SMTP) |
| F17 | Spam / brute-force rate limiting | Should | Done |
| F18 | Landing page | Should | Done |

## 7. Functional Requirements (summary)

Detailed, numbered requirements are in **SRS.md**. Key product rules:

1. A customer can submit without logging in.
2. A testimonial is **text** if no video file is attached, otherwise **video**.
3. Only testimonials that are **liked and not archived** appear on the public wall.
4. Archiving a testimonial automatically removes it from the wall.
5. Paused (inactive) spaces return "not found" on the public page and wall.
6. The public wall never exposes customer e-mail addresses.
7. Deleting a space or user deletes all related testimonials and uploaded files.
8. A banned user cannot log in and existing tokens stop working.

## 8. Non-Functional Requirements (summary)

- **Usability:** responsive on mobile, tablet and desktop; no training needed.
- **Security:** hashed passwords, JWT with roles, per-user data isolation, file type/size checks, rate limiting.
- **Performance:** pages load quickly; video served with range requests so playback starts without full download.
- **Reliability:** database constraints and cascades keep data consistent.
- **Maintainability:** separate backend/frontend, modular code (admin / user / space / testimonial).

## 9. Success Metrics

| Metric | Target |
|---|---|
| Time for a new owner to publish a collection page | ≤ 2 minutes |
| Time for a customer to submit a text testimonial | ≤ 2 minutes |
| Share of visitors who complete a submission | ≥ 30% |
| Share of testimonials that are video | ≥ 20% |
| Owners who embed a wall within first week | ≥ 40% |
| Failed submissions due to errors | < 2% |

## 10. Assumptions and Dependencies

- PostgreSQL 14+ is available.
- Node.js 20+ is available.
- Customers use a modern browser; camera recording needs HTTPS (or localhost) and camera/microphone permission.
- Optional e-mail alerts need an SMTP account (e.g. Gmail app password).
- Uploaded files are stored on the server disk (single-server deployment).

## 11. Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Spam or abusive submissions | Medium | Rate limit (8/min per IP), owner can archive/delete, admin can ban |
| Large video uploads fill disk | High | 100 MB limit, files deleted with their records; move to cloud storage later |
| Browser does not support recording (e.g. old Safari) | Medium | Fallback to "Upload a video" |
| Server restart loses uploads if disk is not persistent | High | Use a persistent volume or object storage in production |
| Weak admin password left as default | High | Documented; configurable via `.env` before first run |
| Fake testimonials | Medium | Consent checkbox, owner approval (only hearted items go public) |

## 12. Roadmap (after 1.0)

1. **1.1** – Cloud storage (S3-compatible) for uploads, video thumbnails
2. **1.2** – Import from social media / Google reviews, tags, bulk actions
3. **1.3** – Plans and billing, usage limits
4. **1.4** – Team members, custom domains, e-mail reminders to customers
5. **2.0** – AI: auto-summaries, highlight quotes, sentiment

## 13. Release Criteria for 1.0

- All "Must" features pass manual and API tests.
- Backend and frontend build without errors.
- Database schema and seed scripts load on a clean database.
- Default admin credentials are documented and changeable.
