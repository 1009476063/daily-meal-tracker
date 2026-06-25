# Daily Meal Tracker

A modern web app for recording daily meals, recognizing food with AI, and storing photo evidence in Cloudflare R2.

## Stack

- Next.js 16
- Supabase Auth + PostgreSQL
- Cloudflare R2
- OpenAI-compatible vision model

## Local development

```bash
npm install
cp .env.example .env.local
# fill in real values
npm run dev
```

## Build

```bash
npm run build
```

## Deploy to Cloudflare

See `DEPLOY.md`.

## Pre-launch checks

See `CHECKLIST.md`.

## Notes

- Supabase tables are prefixed with `meal_` to avoid affecting other projects.
- Public R2 access is required for photo display.
