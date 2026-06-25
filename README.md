# Daily Meal Tracker

A modern web app for recording daily meals, recognizing food with AI, and storing photo evidence in Cloudflare R2.

## Stack

- Next.js 16
- Supabase Auth + PostgreSQL
- Cloudflare R2
- OpenAI-compatible vision model

## Commands

```bash
npm install
npm run dev
npm run build
npm start
```

## Environment

Copy `.env.example` to `.env.local` and fill in real values before running locally.

## Notes

- Public R2 URL must be enabled for image access.
- Supabase tables use prefixed names to avoid conflicts with existing projects.
