# Pre-launch checklist

## Database
- [ ] Supabase tables exist:
  - `meal_users`
  - `meal_model_providers`
  - `meal_meals`
  - `meal_items`
  - `meal_daily_summary`
- [ ] Auth users are created through app register flow.

## Storage
- [ ] R2 bucket exists.
- [ ] Public access is enabled.
- [ ] Upload API returns accessible image URLs.

## AI
- [ ] AI provider configured.
- [ ] `/api/ai/recognize` returns structured results.

## App
- [ ] Register works.
- [ ] Login works.
- [ ] Upload page works end-to-end.
- [ ] Home page shows daily summary.

## Deployment
- [ ] All environment variables set in Cloudflare.
- [ ] Build passes.
- [ ] Production URL works.
