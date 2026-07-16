# Timeframe

Explore how websites evolve through time. Timeframe is a web app that lets you search, browse, and compare archived snapshots of any website using the Wayback Machine's CDX API.

## Features

- **Search** any domain to find its archived history on the Wayback Machine
- **Explore** individual snapshots with an embedded iframe viewer and timeline navigation
- **Compare** two snapshots side-by-side to see how a site has changed
- **Collections** of curated exhibits tracing the evolution of major platforms and the web itself

## Tech Stack

- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS v4, Framer Motion
- **Data:** tRPC v11, React Query, Wayback Machine CDX API
- **Cache:** Upstash Redis
- **Database:** Supabase (PostgreSQL) via Drizzle ORM

## Getting Started

```bash
npm install
cp .env.example .env.local   # fill in your env vars
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Description |
|---|---|
| `UPSTASH_REDIS_REST_URL` | Upstash Redis endpoint |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis auth token |
| `NEXT_PUBLIC_APP_URL` | Public app URL (e.g. `https://timeframe-olive.vercel.app`) |
| `NEXT_PUBLIC_TRPC_URL` | Backend tRPC URL |
| `WAYBACK_CDX_BASE_URL` | Wayback CDX API base URL |

## Architecture

The app is a Next.js frontend that proxies tRPC requests to a remote backend (`timeframe-backend.vercel.app`). The proxy route at `src/app/api/trpc/[trpc]/route.ts` forwards procedure calls while keeping the client-facing API same-origin.

Archived pages are rendered inside sandboxed iframes using the Wayback Machine's `if_` rewrite mode, which provides URL rewriting and the wombat client-side proxy.

## Deploy

```bash
vercel --prod
```
