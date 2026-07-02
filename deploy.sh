#!/usr/bin/env bash
set -euo pipefail

echo "Installing dependencies..."
npm ci

echo "Building Next.js..."
npm run build

echo "Building for Cloudflare..."
npx @opennextjs/cloudflare build

echo "Deploying to Cloudflare Workers..."
npx wrangler deploy
