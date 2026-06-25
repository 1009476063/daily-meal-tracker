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

echo "Installing dependencies..."
npm ci

echo "Building Next.js..."
npm run build

echo "Deploying to Cloudflare Pages..."
npx wrangler pages deploy .vercel/output/static --project-name daily-meal-tracker --commit-dirty=true
