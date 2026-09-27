# ZeroBug

Site de servicii IT (Next.js + Convex + Stripe) pentru **ZeroBug** / SC AXP GLOBAL RETAIL SRL.

## Stack

- Next.js 16 (App Router) + Tailwind 4 + shadcn/ui
- Convex (DB, cron facturi pe 1 ale lunii, storage PDF)
- Stripe Checkout (abonamente mentenanță)
- Resend (email facturi)
- Deploy: Vercel + GitHub

## Development

```bash
npm install
# pornește Convex local + Next
npm run dev
```

Admin: `/admin/login` — parola din `ADMIN_PASSWORD` (local default doar în development; în producție e obligatoriu un secret puternic).

## Seed planuri + date emitent

```bash
npm run seed
```

## Deploy pe Vercel

1. Mergi pe [vercel.com/new](https://vercel.com/new) și importă `alexalinc/zerobug`.
2. Creează un proiect Convex cloud (`npx convex login` + `npx convex deploy`) și setează pe Vercel **și** în Convex Dashboard:
   - `NEXT_PUBLIC_CONVEX_URL`
   - `ADMIN_USERNAME`, `ADMIN_PASSWORD` (min. 12 caractere), `ADMIN_SESSION_SECRET` (min. 24 caractere, distinct)
   - `CRON_SECRET` (min. 24 caractere — pe Vercel și Convex)
   - `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
   - `CONVEX_BRIDGE_SECRET` (min. 24 caractere, **diferit** de webhook secret — pe Vercel și Convex)
   - `RESEND_API_KEY`, `RESEND_FROM_EMAIL`
3. Webhook Stripe → `https://<domeniu>/api/stripe/webhook`
4. În Admin → Setări, confirmă URL-ul GitHub (butonul floating).

Repo: https://github.com/alexalinc/zerobug

Admin: `/admin/login` — fără sesiune JWT validă dashboard-ul redirecționează la login. Funcțiile Convex de admin cer `sessionToken`. Pentru invalidare globală a sesiunilor, setează `ADMIN_SESSION_MIN_IAT` (unix seconds) pe Vercel + Convex.

## Stripe webhook

Endpoint: `POST /api/stripe/webhook`  
Evenimente: `invoice.paid`, `customer.subscription.created/updated`

## Facturare

- Cron Convex: `0 6 1 * *` (1 ale lunii)
- PDF stocat în Convex file storage + email Resend
- Emitent default: SC AXP GLOBAL RETAIL SRL (editabil în Admin → Setări)
