# CLAUDE.md – Testimonial Platform

Testimonial collection + Wall of Love app (Testimonial.to style). Backend and frontend are separate projects.

## Structure
- `Testimonial-Platform-Backend/backend` – NestJS 11, TypeORM, PostgreSQL, JWT (port 7000)
- `Testimonial-Platform-Frontend/frontend` – Next.js 16 (App Router), Tailwind 4, shadcn/base-ui (port 5000)
- `database/` – schema.sql, seed.sql, create-database.sql
- `docs/` – PRD.md, SRS.md, DATA_MODEL.md

## Commands
Backend (run inside `backend/`):
- Install: `npm install`
- Dev: `npm run start:dev`
- Build / type-check: `npm run build`
- Lint: `npm run lint`

Frontend (run inside `frontend/`):
- Install: `npm install`
- Dev: `npm run dev`
- Build (also type-checks): `npm run build`

Database: create `TestimonialDB`, set `DB_PASSWORD` in `backend/.env`. Tables auto-create (`DB_SYNC=true`).

## Rules
- Script names are lowercase (`npm run start:dev`).
- Backend: one folder per feature (`admin`, `user`, `space`, `testimonial`) with `auth/`, `dto/`, `entity/`. Use relative imports (no `src/...` paths).
- TypeORM 1.x: use object form for `select` / `relations` (`{ id: true }`), no `loadRelationCountAndMap`, use `exists()` not `exist()`.
- Never return `password`; the column is `select: false`.
- Every owner endpoint must check ownership (space.owner_id === user id).
- Public endpoints (`/public/*`) must never expose e-mail addresses.
- Uploads live in `backend/uploads/<folder>`; DB stores `folder/filename`. Delete the file when the record is deleted.
- Only testimonials with `is_liked = true` AND `is_archived = false` appear on the wall.
- Frontend: user token key `access_token`, admin token key `admin_access_token`; user API via `lib/axios.ts`, admin via `lib/adminAxios.ts`.
- Product name lives only in `frontend/lib/config.ts` (`APP_NAME`).
- Do not use Google Fonts (build must work offline).

## Verify before saying "done"
1. `npm run build` passes in backend and frontend.
2. Start backend against a real PostgreSQL and call the changed endpoints with curl.
3. Re-check against `docs/SRS.md` requirement IDs.
