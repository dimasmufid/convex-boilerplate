# Next.js + Convex Boilerplate

A Next.js 16 boilerplate using Convex Cloud as the backend and Convex Auth for authentication.

## Tech Stack

- Next.js 16 (App Router)
- Convex Cloud (`convex`)
- Convex Auth (`@convex-dev/auth`) with password auth
- React 19 + TypeScript
- shadcn/ui + Tailwind CSS v4

## What Changed

- Better Auth removed
- Drizzle/Neon PostgreSQL removed
- Authentication moved to Convex Auth
- Backend configuration moved to `convex/`
- Next.js proxy now guards protected routes via Convex Auth

## Required Environment Variables

`.env.local` (for Next.js app):

- `CONVEX_DEPLOYMENT`
- `NEXT_PUBLIC_CONVEX_URL`

Convex deployment environment:

- `JWT_PRIVATE_KEY`

Use `.env.example` as the baseline for local setup.

## Local Development

1. Install dependencies:

```bash
bun install
```

2. Configure or create a Convex deployment (this writes Convex vars locally):

```bash
bun run convex:dev
```

3. Set JWT private key in your Convex deployment:

```bash
openssl genpkey -algorithm RSA -out private_key.pem -pkeyopt rsa_keygen_bits:2048
bunx convex env set JWT_PRIVATE_KEY "$(cat private_key.pem)"
```

4. Run Next.js:

```bash
bun run dev
```

## Scripts

- `bun run dev` - Start Next.js
- `bun run build` - Build production app
- `bun run start` - Run production build
- `bun run lint` - Run ESLint
- `bun run convex:dev` - Start Convex dev deployment sync
- `bun run convex:deploy` - Deploy Convex functions

## Convex Files

- `convex/auth.ts` - Convex Auth setup (password provider)
- `convex/http.ts` - Auth HTTP routes
- `convex/schema.ts` - Schema with auth tables
- `proxy.ts` - Route protection and auth-route redirection

## Notes

- Admin features from Better Auth were removed and should be re-implemented as Convex functions if needed.
- Current auth UI supports email/password sign-in and sign-up against Convex Auth.
