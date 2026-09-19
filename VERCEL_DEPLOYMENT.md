# Vercel deployment

The application is ready to be imported into Vercel from this repository.

## Project settings

- Framework preset: Next.js
- Root Directory: `web`
- Install Command: `npm ci`
- Build Command: `npm run build`

## Required environment variables

Set `DATABASE_URL` for Production and Preview. It must point to a durable remote LibSQL database, for example a Turso `libsql://` URL with its auth token. Do not use the local `file:./dev.db` value from development: Vercel functions do not provide persistent application storage.

Set these only when the related integration is used:

- `NEXT_PUBLIC_DIRECTUS_URL`
- `OPENAI_API_KEY`

Use [`.env.production.example`](./.env.production.example) as the variable template. Keep real values in the Vercel dashboard; do not commit them.

## Deploy

1. Import the repository in Vercel and set the root directory to `web`.
2. Add the environment variables above to Production and Preview as appropriate.
3. Deploy the selected branch.
4. Verify the deployed landing page, `/apply`, and a course detail page. Submit a test application and confirm the record persists after a new deployment.

## Local CLI alternative

After authenticating with Vercel, run these commands from `web`:

```powershell
npx vercel link
npx vercel --prod
```

The Vercel CLI is not installed in this workspace, and no Vercel project is linked yet. Linking and production deployment remain deliberate account-level actions.
