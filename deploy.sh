#!/usr/bin/env bash
set -euo pipefail

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is required" >&2
  exit 1
fi

if ! command -v npx >/dev/null 2>&1; then
  echo "npx is required" >&2
  exit 1
fi

echo "Building project..."
npm ci
npm run build

echo "Preparing Cloudflare output..."
npx @cloudflare/next-on-pages

echo "Wrangler deploy..."
npx wrangler pages deploy .vercel/output/static --project-name daily-meal-tracker

echo "Done."
