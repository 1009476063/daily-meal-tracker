#!/usr/bin/env bash
set -euo pipefail

echo "Installing dependencies..."
npm ci

echo "Building Next.js..."
npm run build

echo "Preparing Cloudflare Pages output..."
npx @cloudflare/next-on-pages

echo "Deploying to Cloudflare Pages..."
npx wrangler pages deploy .vercel/output/static --project-name daily-meal-tracker
