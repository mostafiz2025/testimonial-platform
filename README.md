# Testimonial Platform

Collect **text & video testimonials** with one link, pick your favourites (❤️) and show them on a
**Wall of Love** you can embed on any website.

Same structure as your tool project: backend and frontend are separate.

```
Testimonial-Platform/
├── Testimonial-Platform-Backend/backend     NestJS + TypeORM + PostgreSQL   (port 7000)
├── Testimonial-Platform-Frontend/frontend   Next.js 16 + Tailwind + shadcn  (port 5000)
├── database/                                schema.sql, seed.sql, create-database.sql
└── docker-compose.yml                       optional PostgreSQL + pgAdmin
```

## 1. Database (PostgreSQL)

Option A – Docker: `docker compose up -d` (creates DB `TestimonialDB`, user `postgres`, password `postgres`)

Option B – local Postgres: `psql -U postgres -f database/create-database.sql`

Tables are created **automatically** by the backend (`DB_SYNC=true`).
Prefer manual setup? Run `database/schema.sql`. Optional demo data: `database/seed.sql`.

Tables: `users`, `admins`, `spaces`, `testimonials`.

## 2. Backend

```bash
cd Testimonial-Platform-Backend/backend
npm install
# edit .env (DB_PASSWORD, JWT_SECRET ...)
npm run start:dev          # http://localhost:7000
```

A default admin is created on first start: `admin@testimonial.local` / `Admin@12345`
(change `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env` before the first run).

Optional e-mail alert for new testimonials: fill `EMAIL_USER` / `EMAIL_PASS` (Gmail app password).

## 3. Frontend

```bash
cd Testimonial-Platform-Frontend/frontend
npm install
npm run dev                # http://localhost:5000
```

## Pages

| URL | What |
|---|---|
| `/` | Landing page |
| `/register`, `/login` | Business owner auth |
| `/dashboard` | Stats + your spaces |
| `/dashboard/spaces/new` | Create a space (live preview) |
| `/dashboard/spaces/:id` | Inbox: All / Video / Text / Wall of Love / Archived, search, ❤️ archive delete, add manually |
| `/dashboard/spaces/:id/settings` | Edit collection page, questions, fields, thank-you page |
| `/dashboard/spaces/:id/wall` | Wall theme/layout + **embed code** |
| `/dashboard/profile` | Profile, avatar, password |
| `/s/:slug` | **Public collection page** (customers; text or webcam video) |
| `/w/:slug` | Public Wall of Love |
| `/embed/:slug` + `/embed.js` | Embeddable wall (`<script src=".../embed.js" data-slug="slug">`) |
| `/admin` | Admin login → users (ban/delete), spaces, testimonials |

## API (backend)

- `POST /user-auth/register|login`, `POST /admin-auth/login`
- `GET/POST /spaces`, `GET/PATCH/DELETE /spaces/:id`, `PATCH /spaces/:id/logo`
- `GET/POST /spaces/:id/testimonials`, `PATCH /testimonials/:id/like|archive`, `DELETE /testimonials/:id`
- `GET /user/stats|profile`, `PATCH /user/profile|avatar|password`
- Public (no login): `GET /public/spaces/:slug`, `POST /public/spaces/:slug/testimonials`, `GET /public/wall/:slug`
- Admin: `GET /admin/stats|users|spaces|testimonials`, `PATCH /admin/users/:id/ban`, `DELETE /admin/users|spaces|testimonials/:id`

Uploads (logos, photos, videos ≤ 100 MB) are stored in `backend/uploads` and served at `/uploads/...`.

## Production notes
- Set a long random `JWT_SECRET`, `DB_SYNC=false`, and real `FRONTEND_URL` / `NEXT_PUBLIC_*` URLs.
- Public form is rate-limited (8 submissions/min per IP); login is limited to 10/min.
- Camera recording needs HTTPS (or localhost).
