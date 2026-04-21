# BC Scanner

Business card capture PWA for ERPNext v16. Built by Nest Software Development (NSD).

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview built app |
| `npm run lint` | ESLint |
| `npm run test` | Vitest unit tests |
| `npm run test:e2e` | Playwright E2E |
| `npm run typecheck` | TypeScript check |

## Environment

Copy `.env.example` to `.env.local` and set:

```
VITE_DEFAULT_SERVER_URL=https://your-erp.domain.com
```

## ERPNext CORS Setup

On your ERPNext server, add to `sites/common_site_config.json`:

```json
"allow_cors": "https://bc.nsd-eg.com"
```

Then run `bench restart`.

## Deployment

### Cloudflare Pages

1. Build: `npm run build`
2. Publish directory: `dist`
3. Set custom domain to `bc.nsd-eg.com`
4. HTTPS is automatic via Cloudflare

### Content Security Policy (Production)

```
default-src 'self';
script-src 'self' 'wasm-unsafe-eval';
style-src 'self' 'unsafe-inline';
img-src 'self' data: blob:;
connect-src 'self' https://*;
worker-src 'self' blob:;
```

## Tech Stack

React 18 · TypeScript · Vite · Tailwind CSS · TanStack Query · Zustand · Dexie · Tesseract.js · html5-qrcode · Workbox

## Implementation Status

See the PRD for milestone details. Currently at **Milestone 0** (scaffold).
