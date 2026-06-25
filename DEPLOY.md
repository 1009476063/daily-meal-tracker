# Deploy to Cloudflare

## Current deployment
The project has been deployed to Cloudflare Pages.

Production URL:
- https://daily-meal-tracker.pages.dev

## Build and deploy
```bash
npm ci
npm run build
npx wrangler pages deploy .vercel/output/static --project-name daily-meal-tracker --commit-dirty=true
```

Or:
```bash
./deploy.sh
```

## Environment variables
Set these in Cloudflare Pages project settings before using protected features:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_DB_PASSWORD`
- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET`
- `R2_PUBLIC_BASE_URL`
- `AI_BASE_URL`
- `AI_API_KEY`
- `AI_MODEL`

## Notes
- Public R2 access is required for photo display.
- Supabase tables must already exist.
