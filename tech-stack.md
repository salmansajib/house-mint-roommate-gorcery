# Tech Stack — Shared Expense Tracker

## Overview

Stack chosen for a small, fast-moving 2-user web app: type-safe, minimal backend maintenance, and a UI layer that's easy to customize rather than fight.

---

## 1. Frontend Framework — Next.js (App Router)

- Server components for data-heavy pages (dashboard, history) reduce client JS
- API routes / server actions double as your backend — no separate server needed
- Built-in routing, image optimization, and easy deployment to Vercel
- Use the **App Router** (not Pages Router) for server components and simpler data fetching with Supabase

## 2. Language — TypeScript

- Non-negotiable for a money app — catch type errors (e.g., passing a string where an amount number is expected) at compile time
- Define shared types once (e.g., `Expense`, `SplitRule`, `Settlement`) and reuse across frontend and Supabase queries
- Use **Zod** alongside TypeScript for runtime validation of form inputs (TypeScript types disappear at runtime; Zod schemas don't) — worth adding even though not explicitly requested, since money/amount inputs need real validation

## 3. Styling — Tailwind CSS

- Utility-first, pairs naturally with shadcn/ui (which is Tailwind-based)
- Use Tailwind's config to define your brand colors/spacing scale once, rather than hardcoding values in components

## 4. UI Components — shadcn/ui

Good fit for this project:
- Not a runtime dependency — components are copied into your codebase, so you fully own and can modify them
- Built on **Radix UI primitives** — accessible by default (keyboard nav, focus management, ARIA) without extra work, which matters for form-heavy screens (add expense, settle up)
- Composes cleanly with Tailwind and Motion — no fighting a pre-styled component library's CSS
- Relevant components for this app: `Form`, `Input`, `Select` (category picker), `Dialog` (add expense modal), `Table` (history view), `Card` (dashboard balance), `Tabs` (filter by category/month), `Toast` (confirmation on save)

## 5. Animation — Motion (Framer Motion)

- Use sparingly and purposefully rather than everywhere:
  - Balance number counting up/down when it changes
  - Expense list items animating in on add, out on delete
  - Page transitions between dashboard/history/settle-up
- Avoid animating on every interaction — for a finance app, restraint reads as trustworthy; excessive motion can undercut that

## 6. Backend / Database / Auth — Supabase

- **Postgres** under the hood — fits the relational data model (users, expenses, items, splits, settlements) well
- **Row Level Security (RLS)** — since this is a 2-user shared app, set up RLS policies so each user can only read/write expenses within their shared "household" record, not global access
- **Supabase Auth** — email/password or magic link login; avoids rolling your own auth
- **Realtime subscriptions** — Supabase supports realtime Postgres changes, useful so both roommates see new expenses/balance updates live without manual refresh
- **Supabase client libraries** — use `@supabase/ssr` for proper server-side session handling with Next.js App Router (not the older auth-helpers package, which is deprecated)

---

## 7. Suggested Additional Tools (not requested, but worth considering)

- **Zod** — runtime schema validation for forms and API inputs (pairs with `react-hook-form`)
- **react-hook-form** — form state management; integrates directly with shadcn/ui's `Form` component
- **date-fns** — lightweight date handling for filtering expenses by month
- **Vercel** — natural hosting pairing with Next.js; free tier is enough for 2 users

---

## 8. Project Structure (suggested)

```
/app
  /dashboard        → balance overview, category breakdown
  /expenses         → add/edit expense (itemized or single-amount)
  /history           → filterable expense list
  /settle-up         → record a settlement payment
  /api or /actions   → server actions for Supabase writes
/components
  /ui                → shadcn/ui components
  /expense-form.tsx
  /balance-card.tsx
/lib
  /supabase          → client + server Supabase instances
  /validations        → Zod schemas
/types
  → shared TypeScript types (Expense, SplitRule, Settlement, etc.)
```

---

## Summary Table

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui (Radix-based) |
| Animation | Motion (Framer Motion) |
| Backend/DB | Supabase (Postgres) |
| Auth | Supabase Auth |
| Validation | Zod (suggested addition) |
| Forms | react-hook-form (suggested addition) |
| Hosting | Vercel (suggested) |
