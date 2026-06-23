# Ilé — Fine Dining, Lagos

Full-stack restaurant site: Next.js (App Router) + Neon Postgres (Drizzle ORM) +
Better Auth + GSAP + Paystack + shadcn-style UI.

## What's included

- **Public site**: animated homepage (GSAP parallax hero, scroll reveals), online
  menu/ordering with cart, reservation form.
- **Auth**: email/password sign-in & sign-up via Better Auth, with a `role`
  field (`customer` / `admin`) on the user.
- **Ordering**: cart → `/api/orders` creates the order server-side (prices are
  re-fetched from the DB, never trusted from the client) → redirects to a
  Paystack-hosted checkout → `/api/paystack/webhook` confirms payment by
  verified signature, and `/checkout/success` double-checks via the verify API.
- **Admin dashboard** (`/admin`, gated by `role === "admin"`): add/hide/delete
  menu items, view reservations, view orders.

## 1. Set up Neon

1. Create a project at https://neon.tech.
2. Copy the pooled connection string into `.env` as `DATABASE_URL` (copy
   `.env.example` to `.env` first).

## 2. Set up Paystack

1. Get your **test** keys from https://dashboard.paystack.com/#/settings/developer.
2. Put the secret key in `PAYSTACK_SECRET_KEY`, the public key in
   `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`.
3. In the Paystack dashboard, set your webhook URL to:
   `https://your-domain.com/api/paystack/webhook`
   (for local testing, use `ngrok` or Paystack's CLI tunnel).

## 3. Set up Better Auth

Generate a secret:

```bash
openssl rand -base64 32
```

Put it in `BETTER_AUTH_SECRET`.

## 4. Install, migrate, seed

```bash
npm install
npx drizzle-kit push      # creates all tables in Neon from src/db/schema.ts
npx tsx scripts/seed.ts   # adds a few starter menu items
```

## 5. Make yourself an admin

After signing up once through `/sign-in`, promote your user manually (Neon's
SQL editor, or any Postgres client):

```sql
update "user" set role = 'admin' where email = 'you@example.com';
```

## 6. Run it

```bash
npm run dev
```

Visit `http://localhost:3000`.

## Project structure

```
src/
  app/
    page.tsx                 → homepage (Hero, philosophy, CTA)
    menu/page.tsx             → ordering page (cart + Paystack checkout)
    reserve/page.tsx          → reservation form
    sign-in/page.tsx          → Better Auth email/password
    admin/                    → admin dashboard (menu/reservations/orders)
    checkout/success/page.tsx → Paystack verify + confirmation
    api/
      menu/                   → public GET, admin POST/PATCH/DELETE
      orders/                 → create order + Paystack init, admin GET list
      reservations/           → create + admin GET list
      paystack/webhook/       → signature-verified payment confirmation
      auth/[...all]/          → Better Auth handler
  components/
    hero.tsx, reveal.tsx, navbar.tsx   → GSAP-driven UI
    ui/                                → button, card, input, label
  db/
    schema.ts   → Drizzle tables (menu, orders, reservations, auth tables)
    index.ts    → Neon/Drizzle client
  lib/
    auth.ts, auth-client.ts, session.ts → Better Auth config + helpers
    paystack.ts                         → Paystack init/verify
    utils.ts                            → cn(), formatNaira()
```

## Notes & next steps

- Money is stored in **kobo** (smallest unit) everywhere, matching how
  Paystack expects amounts — `formatNaira()` converts for display.
- Swap the Unsplash hero/photo URLs for real photography before launch.
- Add a transactional email provider (Resend, Postmark) where the `// TODO`
  comments are, for order/reservation confirmations.
- The GSAP `Hero` and `Reveal` components are reusable — drop `<Reveal>`
  around any section to get the same scroll-in animation.
