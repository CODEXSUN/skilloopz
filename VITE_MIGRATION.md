# Vite migration

The Vite app is an in-progress replacement for the Next.js app. The current
Next.js scripts remain available while the LMS and API routes are ported.

## Run the migrated app

```powershell
npm.cmd install
npm.cmd run dev:migrated
```

Open `http://127.0.0.1:5173`. Fastify listens on `127.0.0.1:3002`, and Vite
proxies `/api` requests to it. `npm.cmd run build:vite` builds the frontend;
`npm.cmd run typecheck:vite` checks the migrated code.

The Fastify database is `data/skillloopz.sqlite` by default. Set `SQLITE_PATH`
to choose another local SQLite file. The new database is separate from the
original Prisma database until a data migration is designed and verified.

## Current coverage

- Public pages: home, about, features, pricing, programs, program details,
  application, login, course catalog and detail, and signup redirect.
- Learner entry: onboarding and enrolled-course view at `/dashboard` and
  `/dashboard/courses`. The broader learner dashboard is still Next-only.
- Fastify APIs: session lookup, signup, login, logout, course list/create,
  course detail, enrollment list/create, onboarding completion, application
  submission, and newsletter signup. Applications and subscriptions persist to
  SQLite; email delivery is not yet connected.
- The Vite programs index now uses a framework-neutral component. The original
  Next.js route remains available until the remaining routes are migrated.
- Shared visuals: existing Tailwind config, global CSS, fonts, assets,
  public components, and Framer Motion animations.

## Remaining work

The original app has 127 page files and 196 API route files. Most student,
teacher, parent, school, admin, checkout, blog, lesson player, and other LMS
pages are not yet served by Vite. Their Next.js API handlers are not yet
implemented in Fastify/Kysely. Do not remove the Next.js code or switch the
default `dev` and `build` scripts until these flows and data migration are
verified. The Fastify schema currently contains only the first core tables.
