# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` - Start dev server (localhost:3000)
- `npm run build` - Production build
- `npm run lint` - Run ESLint

## Architecture

Next.js 16 App Router project with React 19, TypeScript, and Tailwind CSS v4.

- `app/` - App Router pages and layouts
- `app/layout.tsx` - Root layout with Geist font config
- `app/page.tsx` - Home page
- `public/` - Static assets
- Path alias: `@/*` maps to project root
