# Shared Expense Tracker — App Spec

## Overview

A shared household expense tracker for two roommates living in the same apartment. It covers **groceries** as well as **recurring bills** — rent, internet, gas (for cooking), and electricity. Each expense is logged, tagged with who paid, split between the two of you, and the app maintains a running balance of who owes whom.

Think of it as a lightweight "Splitwise for the apartment."

**Core loop:** Someone pays for something (groceries, rent, a bill) → logs it in the app → app tags who paid → app calculates each person's fair share → app shows the running balance ("You owe Alex ৳1,200" or "Alex owes you ৳800").

That's the MVP. Below are the architectural decisions worth locking in early so you don't end up rewriting things later.

---

## 1. Data Model

Since the app now covers more than groceries, don't build a grocery-only table — generalize it:

- **User** — id, name (just 2 users for now, but don't hardcode "user1/user2")
- **Expense** — id, title, category (groceries / rent / internet / gas / electricity / other), amount, paid_by, date, split_type, is_recurring
- **ExpenseItem** *(optional, groceries only)* — id, expense_id, item name, quantity, unit price, total price — used when an expense is itemized (a grocery trip) rather than a single lump sum (a bill)
- **SplitRule** — how a specific expense is divided (50/50 default, but see below)
- **Settlement/Payment** — a record of "Alex paid Salman ৳1,500 to settle up," separate from expense entries

**Key distinction:** groceries are usually **itemized** (multiple line items per trip), while bills are usually **single-amount** (one total for rent, one for internet, etc). Design the "add expense" flow to support both:
- Itemized mode → list of items with individual prices (groceries)
- Single-amount mode → one total (rent, internet, gas, electricity)

---

## 2. Splitting Logic

Not everything splits 50/50 in real life:

- **Equal split** (default) — most groceries and bills
- **Full cost to one person** — e.g., a personal snack, or a bill only one person uses
- **Custom ratio** — e.g., 60/40 if usage or income differs
- **Exclude an item** from the split entirely

Decide this now — retrofitting split logic onto a flat "total ÷ 2" model later is painful.

---

## 3. Recurring Bills

Rent, internet, gas, and electricity are usually **monthly and roughly fixed** — very different from groceries, which are ad-hoc. Two approaches:

- **Manual entry each month** — simplest to build first; just log the bill when it arrives (amount will vary slightly for gas/electricity)
- **Recurring templates (v2)** — define "Rent: ৳15,000/month, split 50/50" once, and the app auto-generates the entry each month with a reminder to confirm/adjust the amount

Start manual. Add recurring templates once the MVP works.

---

## 4. Balance Calculation

Don't recalculate the whole history every time — that gets slow and error-prone. Instead:

- Each expense creates a "debt" entry (who paid, who owes, how much)
- A **ledger/balance table** aggregates these into a running net balance
- When someone "settles up," record it as a transaction that reduces the balance — don't delete history

---

## 5. Category Breakdown

With multiple expense types now in play, a simple total isn't enough — you'll want a dashboard that breaks spending down by category, e.g.:

> This month: ৳12,000 groceries · ৳15,000 rent · ৳1,200 internet · ৳1,500 gas · ৳2,500 electricity

This helps both of you see where the money's actually going, not just who owes what.

---

## 6. Other Things to Think About

- **Authentication** — even for 2 users, you need login (simple email/password or magic link is enough)
- **Editing/deleting entries** — someone will mistype a price or amount
- **Currency/rounding** — decide how split amounts that don't divide evenly are handled (e.g., ৳101 ÷ 2)
- **Notifications** — a simple "Alex added a bill" ping (in-app is fine to start, no need for push)
- **History/filtering** — view by month, by person, by category
- **Due dates / reminders** — bills like rent and internet often have due dates; a simple reminder ("rent due in 3 days") is a natural add-on
- **Multi-device sync** — both users need to see updates without weird refresh issues (websockets, or just refetch-on-focus for 2 users)
- **Offline/mobile-first UX** — groceries especially get logged standing in a store; the "add expense" flow needs to be fast on a phone browser

---

## 7. Currency (Bangladeshi Taka)

All amounts are in BDT (৳). A few practical implications:

- **Storage:** store amounts as integers in the smallest unit (poisha) or as a decimal with 2 places — don't use floating point for money, use a fixed-point/decimal type to avoid rounding drift
- **Formatting:** display with the ৳ symbol and standard Bangladeshi comma grouping (e.g., ৳12,000, not ৳12000) — libraries like `Intl.NumberFormat('bn-BD', { style: 'currency', currency: 'BDT' })` handle this in JS
- **Rounding on splits:** BDT doesn't typically use sub-poisha values, so when splitting an odd amount (e.g., ৳101 ÷ 2 = ৳50.50), decide whether to round to the nearest full Taka or keep 2 decimal places — worth a simple rule (e.g., round the leftover poisha to whichever person paid)
- **No multi-currency needed** — since it's a single currency for both users, you can skip currency-conversion complexity entirely, which simplifies the Expense model (no need for a currency field)

---

## 8. Suggested Tech Stack

Lightweight, since it's just 2 users:

- **Frontend:** Next.js or plain React — simple form-heavy UI
- **Backend/DB:** Postgres (via Supabase or Prisma) — relational data (users, expenses, items, splits, settlements) fits SQL well
- **Auth:** Supabase Auth or NextAuth — don't roll your own
- **Hosting:** Vercel + Supabase free tier is more than enough for 2 users

---

## 9. Suggested MVP Scope (in order)

1. Add/edit/delete expenses — both itemized (groceries) and single-amount (bills) — with amount + who paid
2. Auto 50/50 split, running balance shown on a dashboard
3. Settle-up button that logs a payment and reduces balance
4. History view, filterable by category and month
5. Category breakdown chart/summary

Custom split ratios, recurring bill templates, due-date reminders, and notifications can come after the MVP works.

---

## Open Questions to Decide Before Building

- Should split ratios be a global default (e.g. always 50/50) with per-expense overrides, or set individually every time?
- Do you want receipt/bill photo upload, or manual entry only for now?
- Should recurring bills (rent, internet) auto-generate monthly, or will you always enter them manually?
- Preferred hosting/budget constraints (fully free tier vs. willing to pay for a small DB)?
