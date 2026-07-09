# BLA SHOP — Design System & Conventions

## Brand
- Dark theme, black/yellow palette
- X.com / SpaceX minimalist style

## Color Tokens
| Token | Value | Use |
|-------|-------|-----|
| `--color-pwa-black` | `#0a0a0a` | Page background |
| `--color-pwa-dark` | `#1a1a1a` | Card/surface |
| `--color-pwa-yellow` | `#f5c518` | Accent, CTAs, prices |
| `--color-pwa-gray` | `#888888` | Secondary text |
| `--color-pwa-light` | `#2a2a2a` | Subtle backgrounds |
| `--color-pwa-border` | `#333333` | Borders |

## Mandatory Design Rules

### Padding — NO text against card walls
- All cards: `p-5` minimum (20px). Never `p-4`.
- Between items inside card: `mb-3` or `gap-3` (never less than `gap-2.5`)
- Labels above values: `mb-2`

### Icons — SVG only from icons.tsx
- No emoji for structural elements
- All icons from `frontend/src/icons.tsx`

### Card Pattern
```tsx
<div className="rounded-2xl border border-pwa-border/50 bg-pwa-dark px-5 py-5 space-y-3">
```

### Typography
- Page headers: `text-lg font-bold leading-tight text-white`
- Card titles: `text-sm font-semibold text-white`
- Stats: `text-3xl font-extrabold leading-none` (or `text-4xl`)
- Labels: `text-xs font-medium text-pwa-gray/70`
- Body: `text-sm leading-relaxed text-pwa-gray`
- Uppercase labels: `text-[11px] font-semibold uppercase tracking-[0.08em] text-pwa-gray/60`

### Buttons
- Primary: `bg-pwa-yellow text-pwa-black` with hover:brightness-110 active:scale-[0.98]
- Secondary: `border border-pwa-border/50 bg-pwa-yellow/10 text-pwa-yellow`
- Disabled: `bg-pwa-light/40 text-pwa-gray/50 cursor-not-allowed`

### Animations
- No pulse/spinner animations — static UI preferred
- Page: `animate-fade-in` (0.3s)
- Hero: `animate-fade-up` (0.45s)

## Tech Stack
- Frontend: React + TypeScript + Tailwind CSS
- Backend: Express.js, TypeScript
- Database: Supabase (PostgreSQL)
- Bot: Telegram Bot API (Telegraf)
- Deploy: Vercel (backend), manual script (frontend)

## Project Structure
```
frontend/src/
├── admin/        # Admin pages
├── api/          # API client (axios)
├── components/   # Shared components
├── hooks/        # Custom hooks
├── pages/        # Page components
├── types/        # TypeScript interfaces
├── icons.tsx     # All SVG icons
├── index.css     # Tailwind + @theme + custom CSS
├── App.tsx       # Router + auth init
└── main.tsx      # Entry point
```

## Deployment
- Backend: git push to main → Vercel auto-deploys
- Frontend: manual via deploy script (not git-linked)
- Test: `cd frontend && npx tsc --noEmit` before deploy
