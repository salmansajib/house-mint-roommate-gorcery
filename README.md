# HouseMint 🌿

> A high-performance, real-time shared household expense and grocery tracker engineered for roommates.

[![Next.js](https://img.shields.io/badge/Next.js-16.3.3-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.8-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL_%26_Realtime-3ecf8e?logo=supabase)](https://supabase.com/)

---

## Overview

**HouseMint** eliminates awkward money conversations and messy spreadsheets in shared apartments. Built with Next.js App Router, Tailwind CSS v4, and Supabase, it handles both itemized grocery trips and recurring household utilities (rent, electricity, gas, internet), tracks running debts with zero rounding drift, and enables one-click settlements in Bangladeshi Taka (৳ / BDT).

---

## Key Capabilities

- **Dual-Mode Expense Logging**:
  - *Itemized Groceries*: Line-item entry with unit prices, quantities, units, and a pre-seeded Bangladeshi grocery catalog combobox.
  - *Single-Amount Bills*: Quick entry for lump-sum utilities (rent, internet, gas, electricity).
- **Flexible Splitting Engine**:
  - Equal 50/50 splits, custom ratios, full cost assignment, or custom amounts.
  - Automated pairwise debt computation: immediate visibility into who owes whom.
- **Recurring Utility Management**:
  - Monthly bill templates with due-date countdowns and 1-click **Quick Log** dialog.
- **Real-Time Multi-User Sync**:
  - Supabase PostgreSQL backend with Row-Level Security (RLS) and real-time activity notifications.
  - Graceful fallback to rich mock data when offline or unconfigured.
- **Apartment Admin & Member Governance**:
  - Passkey-protected admin operations, member invitation codes, and external manager designations.
- **Obsidian Mint Design System**:
  - Dark/light modes built on semantic CSS tokens (no hardcoded hex values).
  - WCAG AA/AAA-compliant, deterministic OKLCH user accent colors (`getUserColorTokens`).
  - Monospaced tabular numeral formatting (`font-numeral tabular-nums`) for currency integrity.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router, React 19, Server Components) |
| **Language** | TypeScript 5 (strict type-checking) |
| **Database & Auth** | Supabase (PostgreSQL 15+, RLS Policies, Realtime Broadcast) |
| **Styling** | Tailwind CSS v4, CSS Variables, `next-themes` |
| **UI Primitives** | shadcn/ui, Radix UI primitives, Lucide Icons |
| **Animation** | Motion (`motion/react`) |
| **Forms & Validation** | React Hook Form + Zod v4 |
| **Currency** | BDT (`৳`) with fixed-point decimal precision |

---

## Project Architecture

```
house-mint-roommate-gorcery/
├── app/                  # Next.js App Router (layout, dashboard, login, globals.css)
├── components/
│   ├── dashboard/        # Balance hero, expense ledger, recurring bills, analytics
│   ├── modals/           # Add/edit expense, quick-log, admin settings, settle up
│   ├── notifications/    # Real-time toast notifications
│   └── ui/               # Design system primitives (shadcn/ui + Radix + custom)
├── context/              # React Context providers (AuthContext, ExpenseContext)
├── lib/
│   ├── balance.ts        # Pairwise debt matrix & running balance calculator
│   ├── grocery-catalog.ts# Seeded common Dhaka market items & units
│   ├── user-identity.ts  # Deterministic OKLCH color generator
│   └── supabase/         # SSR & browser client singleton factories
├── supabase/             # DDL schemas, migrations, RLS policies, seed scripts
└── types/                # Strict domain TypeScript models
```

---

## Quickstart

### 1. Prerequisites

- **Node.js**: `v20.x` or higher
- **Package Manager**: `npm`, `pnpm`, or `bun`
- *(Optional)* Supabase account for cloud persistence

### 2. Installation

```bash
# Clone the repository
git clone https://github.com/your-username/house-mint-roommate-gorcery.git
cd house-mint-roommate-gorcery

# Install dependencies
npm install
```

### 3. Environment Variables

Create `.env.local` based on `.env.example`:

```bash
cp .env.example .env.local
```

Populate the required values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_DEFAULT_HOUSEHOLD_ID=your-household-id
NEXT_PUBLIC_APARTMENT_ADMIN_KEY=your-secure-admin-passkey
```

> **Note**: If Supabase credentials are not provided, the application seamlessly runs in interactive local mock mode.

### 4. Database Setup (Supabase)

Run the SQL scripts located in `supabase/` via the Supabase SQL Editor:

1. `supabase/schema.sql` — Base tables, constraints, indexes, and triggers.
2. `supabase/admin_migration.sql` — Household administration & passkey schema.
3. `supabase/grocery_catalog_migration.sql` — Pre-seeded grocery items and units.
4. `supabase/notifications_migration.sql` — Activity feed broadcast table.

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts Next.js development server with Turbopack |
| `npm run build` | Builds optimized production bundle |
| `npm run start` | Serves production build locally |
| `npm run lint` | Runs ESLint analysis across codebase |

---

## License

MIT
