# Software Requirements Specification (SRS)

**Product:** Praisely – Testimonial Collection & Wall of Love Platform
**Version:** 1.0
**Related document:** PRD.md

---

## 1. Introduction

### 1.1 Purpose
This document specifies the functional and non-functional requirements, architecture, data model and interfaces of Praisely version 1.0. It is intended for developers, testers and project reviewers.

### 1.2 Scope
Praisely is a web application with a REST API backend and a web frontend. It allows business owners to create *Spaces*, collect text/video testimonials from customers through a public link, curate them, and publish a *Wall of Love* (public page and embeddable widget). A separate admin role manages the platform.

### 1.3 Definitions

| Term | Meaning |
|---|---|
| Owner / User | Registered business customer who owns Spaces |
| Respondent / Customer | Person who submits a testimonial (no account) |
| Space | A project/product that has one collection page and one wall |
| Testimonial | A text or video review submitted to a Space |
| Wall of Love | Public page/widget showing liked, non-archived testimonials |
| Slug | URL-friendly unique name of a Space |
| JWT | JSON Web Token used for authentication |
| Admin | Platform operator |

### 1.4 Technology Stack

| Layer | Technology |
|---|---|
| Backend | NestJS 11, TypeScript, TypeORM 1.x |
| Database | PostgreSQL 14+ |
| Auth | JWT (`@nestjs/jwt`), bcrypt |
| Validation | class-validator, class-transformer (backend); zod (frontend) |
| Uploads | multer (disk storage), served via `@nestjs/serve-static` |
| Rate limiting | `@nestjs/throttler` |
| E-mail | nodemailer (optional) |
| Frontend | Next.js 16 (App Router), React 19, Tailwind CSS 4, shadcn/base-ui, axios, sonner |

---

## 2. Overall Description

### 2.1 System Context

```
 Customer browser ──► Next.js frontend (:5000) ──► NestJS API (:7000) ──► PostgreSQL
 Owner browser    ──►        │                          │
 Admin browser    ──►        │                          └──► ./uploads (photos, videos, logos, avatars)
 Visitor website ──► <script src="/embed.js"> ──► /embed/:slug (iframe)
```

### 2.2 User Classes

| Class | Authentication | Access |
|---|---|---|
| Customer / Visitor | None | Public endpoints and pages only |
| Owner | JWT (`role=user`) | Own spaces, testimonials, profile |
| Admin | JWT (`role=admin`) | Platform-wide management |

### 2.3 Operating Environment
- Server: Node.js ≥ 20, PostgreSQL ≥ 14, writable disk for uploads.
- Client: modern browsers (Chrome, Edge, Firefox, Safari). Camera recording requires HTTPS or `localhost`.

### 2.4 Constraints
- Uploaded files are stored on local disk (single-server).
- Tokens are stored in browser `localStorage` (`access_token`, `admin_access_token`).
- Tables are auto-created by TypeORM when `DB_SYNC=true` (must be disabled in production).

### 2.5 Assumptions
- The frontend and backend are deployed on known origins (`NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SITE_URL`).
- One default admin is created on first start from `.env`.

---

## 3. System Architecture

### 3.1 Repository Layout

```
Testimonial-Platform/
├── Testimonial-Platform-Backend/backend/src
│   ├── admin/        (auth/, dto/, entity/, controller, service, module)
│   ├── user/         (auth/, dto/, entity/, controller, service, module)
│   ├── space/        (dto/, entity/, controller, service, module)
│   ├── testimonial/  (dto/, entity/, controllers, public.controller, service, module)
│   └── common/       (upload.util, slug.util, mail.service, guards module, decorators)
├── Testimonial-Platform-Frontend/frontend
│   ├── app/          ((user)/dashboard, (admin)/admin, (public)/s|w|embed, login, register)
│   ├── components/   (landing, authForm, dashboard/user|admin, public, common, ui)
│   ├── lib/          (axios, adminAxios, utils, types, config)
│   └── schemas/      (zod schemas)
├── database/         (schema.sql, seed.sql, create-database.sql)
└── docker-compose.yml
```

### 3.2 Backend Modules
- **UserAuthModule / AdminAuthModule** – register/login, token issuing.
- **AuthGuardsModule (global)** – `UserAuthGuard`, `AdminAuthGuard`, `MailService`.
- **UserModule** – profile, avatar, password, statistics.
- **SpaceModule** – space CRUD, logo, public space lookup.
- **TestimonialModule** – owner-side listing/actions, public submission, wall.
- **AdminModule** – platform management and default-admin seeding.

### 3.3 Security Design
- Passwords hashed with bcrypt.
- JWT payload: `{ sub, email, role }`, expiry 7 days. Guards verify the `role` claim.
- `UserAuthGuard` also checks the user still exists and is not banned on every request.
- Ownership is enforced in services (a user can only access spaces/testimonials they own).
- Global `ValidationPipe` with `whitelist: true`.
- CORS enabled for the frontend and embedded widgets.

---

## 4. Functional Requirements

Priority: **M** = Must, **S** = Should, **C** = Could.

### 4.1 Authentication and Accounts

| ID | Requirement | Pri |
|---|---|---|
| FR-AUTH-01 | The system shall allow an owner to register with name, e-mail, password (≥ 8 chars) and optional company. | M |
| FR-AUTH-02 | E-mail shall be unique (case-insensitive); duplicate registration returns HTTP 409. | M |
| FR-AUTH-03 | The system shall authenticate an owner by e-mail and password and return a JWT and basic profile. | M |
| FR-AUTH-04 | Invalid credentials shall return HTTP 401 with a generic message. | M |
| FR-AUTH-05 | A banned user shall not be able to log in (HTTP 403) and existing tokens shall be rejected. | M |
| FR-AUTH-06 | The admin shall log in through a separate endpoint; a user token shall not grant admin access. | M |
| FR-AUTH-07 | On first start, if no admin exists, one shall be created from `ADMIN_EMAIL` / `ADMIN_PASSWORD`. | M |
| FR-AUTH-08 | Login and register shall be limited to 10 requests per minute per IP. | S |
| FR-AUTH-09 | The frontend shall redirect to the login page when a token is missing or a request returns 401. | M |

### 4.2 Profile

| ID | Requirement | Pri |
|---|---|---|
| FR-PROF-01 | The owner shall view and update name and company. | S |
| FR-PROF-02 | The owner shall upload an avatar (jpg/png/webp/gif, ≤ 2 MB); the old file shall be deleted. | S |
| FR-PROF-03 | The owner shall change password by providing the current password and a new one (≥ 8 chars). | S |

### 4.3 Spaces

| ID | Requirement | Pri |
|---|---|---|
| FR-SPACE-01 | The owner shall create a Space with a name; other fields have defaults. | M |
| FR-SPACE-02 | Each Space shall have a unique slug (lowercase letters, digits, hyphens; ≤ 60 chars). If not given it is generated from the name, adding a random suffix on collision. A custom slug that is taken returns HTTP 409. | M |
| FR-SPACE-03 | Configurable fields: header title, custom message, up to 8 questions, button colour (hex), thank-you title and message. | M |
| FR-SPACE-04 | Toggles: collect text, collect video, star rating, e-mail, job title, company, photo. At least one of text/video must be on (frontend validation). | M |
| FR-SPACE-05 | The owner shall upload a logo (image ≤ 2 MB). | S |
| FR-SPACE-06 | The owner shall pause/resume a Space (`is_active`). | S |
| FR-SPACE-07 | The owner shall list own Spaces with testimonial counts. | M |
| FR-SPACE-08 | The owner shall delete a Space; all testimonials and files shall be removed. | M |
| FR-SPACE-09 | The create/edit form shall show a live preview of the collection page. | S |

### 4.4 Public Collection

| ID | Requirement | Pri |
|---|---|---|
| FR-PUB-01 | `GET /public/spaces/:slug` shall return only public configuration (no owner data). Unknown or paused Space returns HTTP 404. | M |
| FR-PUB-02 | The collection page shall show logo, title, message, questions and buttons for the enabled testimonial types. | M |
| FR-PUB-03 | The customer shall submit a text testimonial with name, message, consent and the fields enabled by the owner. | M |
| FR-PUB-04 | The customer shall record a video in the browser (max 120 s) or upload a video file (≤ 100 MB). | M |
| FR-PUB-05 | A submission with a video file is saved as type `video`, otherwise `text`. | M |
| FR-PUB-06 | A text testimonial shall require a non-empty message; a video testimonial may omit it. | M |
| FR-PUB-07 | If the Space collects e-mail, a valid e-mail is required. | M |
| FR-PUB-08 | Consent shall be required; without it the request is rejected. | M |
| FR-PUB-09 | Rating, if collected, shall be an integer 1–5. | S |
| FR-PUB-10 | An optional photo (image ≤ 5 MB) may be attached when photo collection is enabled. | S |
| FR-PUB-11 | Submitting to a type that the Space has disabled shall be rejected (HTTP 400). | M |
| FR-PUB-12 | If validation fails after files were uploaded, the files shall be deleted. | M |
| FR-PUB-13 | Submissions shall be limited to 8 per minute per IP. | S |
| FR-PUB-14 | After success the page shall show the owner's thank-you title and message. | M |
| FR-PUB-15 | The owner shall receive an e-mail on a new testimonial when SMTP is configured. Failure to send shall not fail the submission. | C |

### 4.5 Testimonial Management (Owner)

| ID | Requirement | Pri |
|---|---|---|
| FR-TST-01 | The owner shall list testimonials of an owned Space with pagination (default 50, max 100). | M |
| FR-TST-02 | Filters: `inbox` (not archived), `text`, `video`, `liked`, `archived`. | M |
| FR-TST-03 | Search shall match name, message and company (case-insensitive). | S |
| FR-TST-04 | The response shall include counts for each filter. | S |
| FR-TST-05 | The owner shall toggle *like*; liked testimonials appear on the wall. | M |
| FR-TST-06 | The owner shall toggle *archive*; archiving also removes the like. | M |
| FR-TST-07 | The owner shall delete a testimonial; its photo and video shall be removed from disk. | M |
| FR-TST-08 | The owner shall manually add a text testimonial (source = `imported`). | S |
| FR-TST-09 | Access to another owner's Space or testimonial shall return HTTP 404. | M |

### 4.6 Wall of Love

| ID | Requirement | Pri |
|---|---|---|
| FR-WALL-01 | `GET /public/wall/:slug` shall return Space display settings and only testimonials where `is_liked = true` and `is_archived = false`, newest first. | M |
| FR-WALL-02 | The wall response shall not contain e-mail addresses. | M |
| FR-WALL-03 | The owner shall set theme (light/dark), layout (masonry/grid) and toggles for rating, date and branding. | S |
| FR-WALL-04 | The system shall provide a public page `/w/:slug`. | M |
| FR-WALL-05 | The system shall provide an embeddable page `/embed/:slug` and a script `/embed.js` that inserts an iframe and resizes it via `postMessage`. | M |
| FR-WALL-06 | The dashboard shall show copyable script code, iframe code and public link, plus a live preview. | S |
| FR-WALL-07 | Video testimonials shall play inline with controls. | M |

### 4.7 Dashboard Statistics (Owner)

| ID | Requirement | Pri |
|---|---|---|
| FR-STAT-01 | Show total spaces, total testimonials, text count, video count, liked count, average rating, last-7-days count. | S |
| FR-STAT-02 | Show a 14-day chart of received testimonials (missing days = 0). | S |

### 4.8 Admin

| ID | Requirement | Pri |
|---|---|---|
| FR-ADM-01 | Show platform totals: users, spaces, testimonials, video, text, liked. | M |
| FR-ADM-02 | List users with their space count. | M |
| FR-ADM-03 | Ban / unban a user. | M |
| FR-ADM-04 | Delete a user together with all spaces, testimonials and files. | M |
| FR-ADM-05 | List all spaces with owner and testimonial count; delete any space. | M |
| FR-ADM-06 | List the latest 200 testimonials; delete any testimonial. | M |

### 4.9 Landing Page

| ID | Requirement | Pri |
|---|---|---|
| FR-LAND-01 | A public landing page with navigation, hero, features, how-it-works, sample wall, call-to-action and footer. | S |
| FR-LAND-02 | The navbar shall show "Go to dashboard" if the visitor is logged in. | C |

---

## 5. External Interface Requirements

### 5.1 User Interface Pages

| URL | Audience | Description |
|---|---|---|
| `/` | Public | Landing page |
| `/login`, `/register` | Public | Owner authentication |
| `/dashboard` | Owner | Statistics and spaces |
| `/dashboard/spaces/new` | Owner | Create space |
| `/dashboard/spaces/:id` | Owner | Testimonial inbox |
| `/dashboard/spaces/:id/settings` | Owner | Edit space, delete space |
| `/dashboard/spaces/:id/wall` | Owner | Wall settings and embed code |
| `/dashboard/profile` | Owner | Profile and password |
| `/s/:slug` | Public | Collection page |
| `/w/:slug` | Public | Wall of Love |
| `/embed/:slug`, `/embed.js` | Public | Embeddable widget |
| `/admin` | Admin | Admin login |
| `/admin/dashboard`, `/users`, `/spaces`, `/testimonials` | Admin | Management |

### 5.2 REST API (base URL `http://localhost:7000`)

**Authentication (public)**

| Method | Path | Body | Result |
|---|---|---|---|
| POST | `/user-auth/register` | name, email, password, company? | `{access_token, user}` |
| POST | `/user-auth/login` | email, password | `{access_token, user}` |
| POST | `/admin-auth/login` | email, password | `{access_token, admin}` |

**Public (no authentication)**

| Method | Path | Notes |
|---|---|---|
| GET | `/public/spaces/:slug` | Collection page config |
| POST | `/public/spaces/:slug/testimonials` | `multipart/form-data`: name, email?, job_title?, company?, rating?, message?, consent, photo?, video? |
| GET | `/public/wall/:slug` | Wall settings + liked testimonials |
| GET | `/uploads/...` | Static files (supports HTTP range) |

**Owner (header `Authorization: Bearer <token>`)**

| Method | Path | Description |
|---|---|---|
| GET | `/user/profile` | Profile |
| PATCH | `/user/profile` | Update name/company |
| PATCH | `/user/avatar` | Upload avatar (`myfile`) |
| PATCH | `/user/password` | Change password |
| GET | `/user/stats` | Dashboard statistics |
| GET | `/spaces` | List own spaces |
| POST | `/spaces` | Create space |
| GET | `/spaces/:id` | Get space |
| PATCH | `/spaces/:id` | Update space |
| PATCH | `/spaces/:id/logo` | Upload logo (`logo`) |
| DELETE | `/spaces/:id` | Delete space |
| GET | `/spaces/:spaceId/testimonials` | Query: `filter`, `search`, `page`, `limit` |
| POST | `/spaces/:spaceId/testimonials` | Manual add |
| PATCH | `/testimonials/:id/like` | Toggle like |
| PATCH | `/testimonials/:id/archive` | Toggle archive |
| DELETE | `/testimonials/:id` | Delete |

**Admin (admin token)**

| Method | Path | Description |
|---|---|---|
| GET | `/admin/stats` | Platform totals |
| GET | `/admin/users` | List users |
| PATCH | `/admin/users/:id/ban` | Toggle ban |
| DELETE | `/admin/users/:id` | Delete user |
| GET | `/admin/spaces` | List spaces |
| DELETE | `/admin/spaces/:id` | Delete space |
| GET | `/admin/testimonials` | Latest 200 |
| DELETE | `/admin/testimonials/:id` | Delete testimonial |

**Error format:** standard NestJS JSON `{ statusCode, message, error }`; `message` may be an array for validation errors.

**HTTP codes used:** 200/201 success, 400 validation, 401 unauthenticated, 403 banned, 404 not found, 409 conflict, 429 rate limited.

### 5.3 Embed Interface
```html
<script src="https://YOUR-SITE/embed.js" data-slug="your-space" async></script>
```
The script inserts an iframe to `/embed/:slug`. The embed page sends `{type:"praisely:height", slug, height}` to the parent window to resize the iframe.

### 5.4 Hardware / Software Interfaces
- PostgreSQL via `pg` driver (TypeORM).
- Browser APIs: `getUserMedia`, `MediaRecorder`, `localStorage`, `postMessage`.
- Optional SMTP server via nodemailer.

---

## 6. Data Requirements

### 6.1 Entity Relationship

```
users (1) ────< spaces (1) ────< testimonials
admins   (independent)
```

### 6.2 Tables

**users**

| Column | Type | Notes |
|---|---|---|
| id | serial PK | |
| name | varchar(100) | |
| email | varchar(150) | unique |
| password | varchar(255) | bcrypt hash, not selected by default |
| company | varchar(150) | nullable |
| profile_image | varchar(255) | nullable, path in uploads |
| is_banned | boolean | default false |
| created_at, updated_at | timestamp | |

**admins**: id, name, email (unique), password (bcrypt), created_at.

**spaces**

| Column | Type | Notes |
|---|---|---|
| id | serial PK | |
| name | varchar(100) | |
| slug | varchar(60) | unique |
| logo | varchar(255) | nullable |
| header_title | varchar(200) | |
| custom_message | text | |
| questions | jsonb | array of strings, default `[]` |
| collect_text / collect_video / collect_star_rating / collect_email / collect_company / collect_job_title / collect_photo | boolean | default true |
| thank_you_title | varchar(200) | default "Thank you!" |
| thank_you_message | text | |
| button_color | varchar(9) | default `#6366f1` |
| is_active | boolean | default true |
| wall_theme | enum(light, dark) | default light |
| wall_layout | enum(masonry, grid) | default masonry |
| wall_show_rating / wall_show_date / wall_show_branding | boolean | default true |
| owner_id | int FK → users.id | ON DELETE CASCADE |
| created_at, updated_at | timestamp | |

**testimonials**

| Column | Type | Notes |
|---|---|---|
| id | serial PK | |
| space_id | int FK → spaces.id | ON DELETE CASCADE, indexed with created_at |
| type | enum(text, video) | |
| name | varchar(100) | |
| email | varchar(150) | nullable, private |
| job_title, company | varchar(150) | nullable |
| photo, video | varchar(255) | nullable, relative paths |
| rating | smallint | nullable, 1–5 |
| message | text | nullable |
| consent | boolean | default true |
| source | enum(collected, imported) | default collected |
| is_liked | boolean | default false |
| is_archived | boolean | default false |
| created_at | timestamp | |

### 6.3 File Storage
`backend/uploads/{avatars,logos,photos,videos}`; file names are `timestamp-randomhex.ext`; DB stores `folder/filename`.

### 6.4 Validation Limits

| Item | Limit |
|---|---|
| Password | ≥ 8 characters |
| Video | ≤ 100 MB; webm, mp4, quicktime, matroska, ogg |
| Recording length | ≤ 120 seconds |
| Photo | ≤ 5 MB; jpeg, png, webp, gif |
| Logo / avatar | ≤ 2 MB; image types |
| Questions | ≤ 8, each ≤ 200 chars |
| Testimonial message | ≤ 3000 chars |
| Slug | `^[a-z0-9]+(-[a-z0-9]+)*$`, ≤ 60 |

---

## 7. Non-Functional Requirements

### 7.1 Security

| ID | Requirement |
|---|---|
| NFR-SEC-01 | Passwords shall never be stored or returned in plain text. |
| NFR-SEC-02 | Protected endpoints shall require a valid JWT with the correct role. |
| NFR-SEC-03 | Owners shall only access their own data. |
| NFR-SEC-04 | Uploads shall be filtered by MIME type and size; stored names shall be randomised. |
| NFR-SEC-05 | Public endpoints shall be rate limited (global 120/min, submit 8/min, auth 10/min per IP). |
| NFR-SEC-06 | Private data (e-mail) shall not be exposed by public endpoints. |
| NFR-SEC-07 | `JWT_SECRET`, DB password and SMTP credentials shall come from environment variables. |
| NFR-SEC-08 | HTML in e-mail notifications shall be escaped. |

### 7.2 Performance
- NFR-PERF-01: Typical API responses should complete within 500 ms on a single small server.
- NFR-PERF-02: Videos shall be served with HTTP range support for fast seeking.
- NFR-PERF-03: Testimonial counts shall be computed in a single aggregate query.

### 7.3 Usability
- NFR-UX-01: All pages shall be responsive from 360 px width.
- NFR-UX-02: Errors shall be shown as readable toast messages.
- NFR-UX-03: Destructive actions shall require confirmation.

### 7.4 Reliability and Data Integrity
- NFR-REL-01: Foreign keys with cascade delete shall prevent orphan rows.
- NFR-REL-02: Uploaded files shall be removed when their record is deleted or validation fails.
- NFR-REL-03: A failing e-mail service shall not break testimonial submission.

### 7.5 Maintainability and Portability
- NFR-MNT-01: Backend and frontend are independently deployable.
- NFR-MNT-02: Configuration only through `.env` files.
- NFR-MNT-03: Database can be created via TypeORM sync or `database/schema.sql`.
- NFR-MNT-04: `docker-compose.yml` provides PostgreSQL and pgAdmin for development.

### 7.6 Compatibility
- Camera recording: browsers with `MediaRecorder`; otherwise users can upload a video file.

---

## 8. Deployment and Configuration

### 8.1 Backend `.env`

| Variable | Purpose | Default |
|---|---|---|
| PORT | API port | 7000 |
| FRONTEND_URL | Used in e-mail links | http://localhost:5000 |
| JWT_SECRET | Token signing key | (must change) |
| DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME | PostgreSQL connection | localhost, 5432, postgres, –, TestimonialDB |
| DB_SYNC | Auto-create/alter tables | true (set false in production) |
| ADMIN_EMAIL, ADMIN_PASSWORD | First admin | admin@testimonial.local / Admin@12345 |
| EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS | Optional SMTP | empty = disabled |

### 8.2 Frontend `.env`

| Variable | Purpose |
|---|---|
| NEXT_PUBLIC_API_URL | Backend URL (default http://localhost:7000) |
| NEXT_PUBLIC_SITE_URL | Public frontend URL used in share links and embed code |

### 8.3 Run Commands
```
docker compose up -d                                    # optional database
cd Testimonial-Platform-Backend/backend  && npm install && npm run start:dev
cd Testimonial-Platform-Frontend/frontend && npm install && npm run dev
```

### 8.4 Production Checklist
Set strong `JWT_SECRET` and admin password; `DB_SYNC=false`; use HTTPS; persistent volume or object storage for `uploads`; set real `NEXT_PUBLIC_*` URLs; configure SMTP if alerts are wanted.

---

## 9. Verification and Test Summary

### 9.1 Automated/Scripted Checks Performed (against real PostgreSQL 16)
Registration, duplicate e-mail rejection, wrong password (401), unauthenticated access (401), space creation, public space lookup, text submission, invalid submission rejection, video submission, invalid file type rejection, listing and counts, like, wall output, filter + search, video range serving, owner statistics, admin login, user-token rejected on admin routes, admin stats and space listing, ban → login blocked, unban, space deletion removing files, CORS preflight, and rate limiting (429 on the 11th login attempt).

### 9.2 Build Checks
- Backend: `nest build` / TypeScript compile passes.
- Frontend: `next build` with TypeScript check passes; all routes render (HTTP 200, unknown route 404).
- Database: `schema.sql` and `seed.sql` load on a clean database.

### 9.3 Not Yet Verified
- Interactive browser testing (camera recording, visual design, mobile layout) and automated unit/e2e test suites.

### 9.4 Suggested Acceptance Test Cases

| ID | Scenario | Expected |
|---|---|---|
| TC-01 | Register with 7-char password | Rejected with validation message |
| TC-02 | Create space "My Shop" | Slug `my-shop`; page `/s/my-shop` opens |
| TC-03 | Submit text without consent | Rejected |
| TC-04 | Submit video + rating | Appears in inbox as Video with rating |
| TC-05 | Like a testimonial | Appears on `/w/my-shop` |
| TC-06 | Archive a liked testimonial | Removed from wall and moves to Archived |
| TC-07 | Pause space | `/s/my-shop` and wall show not found |
| TC-08 | Ban user | Login returns 403; existing session fails |
| TC-09 | Delete space | Testimonials and files removed |
| TC-10 | Paste embed script on a test page | Wall appears and resizes automatically |

---

## 10. Future Enhancements
Cloud storage, social import, tags and bulk actions, billing and plans, team members, custom domains, customer e-mail reminders, AI summaries (see PRD roadmap).
