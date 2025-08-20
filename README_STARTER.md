# Starter Pack

This folder contains the minimal scaffolding to kick off the MVP with:

- Next.js monolith
- Docker Compose (web, Postgres, Mailhog)
- Prisma baseline schema (profiles, orgs, memberships)
- Supabase SQL for RLS and invites flow (templates)
- GitHub Actions CI (lint/typecheck/test + docker build)
- Sentry config (client+server)

## Quick start (local)

1. Copy `.env.example` to `.env` and fill SUPABASE*\* and SENTRY*\*.
2. `pnpm i`
3. `docker compose up -d`
4. `pnpm prisma migrate dev --name init && pnpm prisma db seed` (optional seed)
5. Open http://localhost:3000

## Notes

- RLS SQL assumes you run it in Supabase SQL editor. Adjust schema/table names if needed.
- Keep ADR docs in `/docs/adr`. See sample in `docs/adr/0001-monolith.md`.
