<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# HouseMint Project Guidelines & Rules

## 1. Color System & CSS Variables (Mandatory)
- **Always use semantic theme tokens / CSS variables** configured in `app/globals.css`.
- **Never hardcode hex values, rgb/rgba strings, or arbitrary palette classes** (e.g. avoid `bg-[#10b981]`, `text-[#080c0a]`, `bg-emerald-500`, `text-slate-200`, `bg-zinc-900`) directly in markup.
- **Core Semantic Tokens**:
  - Surfaces & Backgrounds: `bg-background`, `bg-card`, `bg-popover`, `bg-muted`, `bg-accent`
  - Text & Foreground: `text-foreground`, `text-card-foreground`, `text-popover-foreground`, `text-muted-foreground`, `text-accent-foreground`
  - Interactive & Borders: `border-border`, `bg-input`, `ring-ring`, `bg-primary`, `text-primary-foreground`, `bg-secondary`, `text-secondary-foreground`
  - Intent / Feedback: `text-positive` / `bg-positive`, `text-destructive` / `bg-destructive`, `text-warning` / `bg-warning`
- **Category Colors**:
  - `var(--cat-groceries)` (`bg-cat-groceries`, `text-cat-groceries`)
  - `var(--cat-rent)` (`bg-cat-rent`, `text-cat-rent`)
  - `var(--cat-electricity)` (`bg-cat-electricity`, `text-cat-electricity`)
  - `var(--cat-gas)` (`bg-cat-gas`, `text-cat-gas`)
  - `var(--cat-internet)` (`bg-cat-internet`, `text-cat-internet`)
  - `var(--cat-other)` (`bg-cat-other`, `text-cat-other`)
- **Roommate / User Accents & Scalable Multi-User System**:
  - For displaying user identity, **always use the dedicated UI primitives**: `<UserAvatar user={...} />` (`@/components/ui/user-avatar`) and `<UserBadge user={...} />` (`@/components/ui/user-badge`).
  - Never hardcode static user classes for dynamic users. Use `getUserColorTokens(userId)` from `@/lib/user-identity` or `getDistinctUserColorMap(users)` to guarantee deterministic, collision-free, WCAG AA/AAA-compliant OKLCH tones for any arbitrary number of users.
  - Curated fallback tokens: `--user-1` through `--user-8` (`bg-user-1` ... `bg-user-8`) configured in `app/globals.css`.
- Ensure all styling works seamlessly across both dark (Obsidian Mint, default) and light modes via these tokens.

---

## 2. Typography System & Guidelines
- **Use the Typography Component**: Prefer using `<Text variant="...">` from `@/components/ui/typography` whenever applicable.
- **Semantic Typography Scale**:
  - Headings: `text-display`, `text-h1`, `text-h2`, `text-h3`, `text-h4`
  - Body: `text-body-lg`, `text-body`, `text-body-sm`, `caption`, `text-label`, `muted`
- **Financial & Monetary Numerals**:
  - Always render currency values with the `<CurrencyAmount amount={...} />` component (`@/components/ui/currency-amount`) or use the utility classes `font-numeral tabular-nums` to maintain aligned tabular layout for digits and BDT (`৳`) symbols.
- **Text Wrapping**:
  - Headings default to `text-wrap: balance`.
  - Body / Paragraph text defaults to `text-wrap: pretty`.

---

## 3. UI Components & shadcn/ui Best Practices
- **Reuse shadcn/ui Components**: Always check and use components from `@/components/ui/`:
  - `Button`, `Input`, `Dialog`, `AlertDialog`, `Select`, `Card`, `Badge`, `Avatar`, `UserAvatar`, `UserBadge`, `Tabs`, `Separator`, `Text`, `CurrencyAmount`, etc.
- **Do NOT reinvent basic UI primitives** (e.g. building ad-hoc custom modals, native select dropdowns, or unstyled buttons).
- **Icons**: Always import icons from `lucide-react`.
- **Class Merging**: Always use `cn()` from `@/lib/utils` for dynamic and variant className compositions.
- **Variants**: Use `class-variance-authority` (`cva`) for multi-variant components.

---

## 4. Architecture, State & Forms
- **Framework**: Next.js (App Router, Tailwind CSS v4, React 19).
- **Client Components**: Explicitly add `'use client'` at the top of files that utilize React state, hooks, event listeners, or Framer Motion animations.
- **Imports & Aliases**: Use defined path aliases:
  - `@/components/*`, `@/components/ui/*`, `@/lib/*`, `@/hooks/*`
- **Forms & Validation**: Use `react-hook-form` together with `zod` and `@hookform/resolvers/zod`.
- **Animations & Micro-interactions**: Use `motion` (`motion/react` / `framer-motion`) for smooth transitions, list animations, and modal openings.

