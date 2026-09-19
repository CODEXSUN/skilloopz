# skilloopz

skilloopz is a learning site and LMS. The public site runs on Vite and React.
Fastify serves the migrated API, with Kysely and SQLite for local data.
The original Next.js app remains in the repository while the LMS migration continues.

## Run the Vite site

Use Node.js 26 and install the packages:

```powershell
npm.cmd install
npm.cmd run dev:migrated
```

Open `http://127.0.0.1:5173`. Vite proxies API requests to Fastify on port 3002.
The local SQLite file is `data/skillloopz.sqlite` unless `SQLITE_PATH` is set.

## Check the code

```powershell
npm.cmd run typecheck:vite
npm.cmd run build:vite
```

The Vite app does not yet cover every LMS page or API route. Read
[VITE_MIGRATION.md](VITE_MIGRATION.md) for the current coverage and limits.

The original Next.js app still uses `npm.cmd run dev`. It remains available
until the Vite and Fastify migration is complete.
