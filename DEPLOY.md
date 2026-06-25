# Deploy to Cloudflare

## Recommended path
Cloudflare Pages with Functions / `@cloudflare/next-on-pages`.

## Required environment variables
Set these in Cloudflare Pages project settings before deployment:

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
- Public R2 URL must be enabled for image access.
- Supabase project must already have the `meal_*` tables created.
- Do not commit `.env.local` to Git.

## Deploy steps
1. `npm ci`
2. `npm run build`
3. `npx @cloudflare/next-on-pages`
4. `npx wrangler pages deploy .vercel/output/static --project-name daily-meal-tracker`

Or run the helper script:

```bash
./deploy.sh
```
