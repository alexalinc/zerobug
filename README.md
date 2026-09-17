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

Admin: `/admin/login` — parola din `ADMIN_PASSWORD` (default `zerobug-admin` local).

## Seed planuri + date emitent

```bash
npm run seed
```

## Deploy pe Vercel

1. Mergi pe [vercel.com/new](https://vercel.com/new) și importă `alexalinc/zerobug`.
2. Creează un proiect Convex cloud (`npx convex login` + `npx convex deploy`) și setează pe Vercel:
   - `NEXT_PUBLIC_CONVEX_URL`
   - `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`
   - `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
   - `RESEND_API_KEY`, `RESEND_FROM_EMAIL`
3. Webhook Stripe → `https://<domeniu>/api/stripe/webhook`
4. În Admin → Setări, confirmă URL-ul GitHub (butonul floating).

Repo: https://github.com/alexalinc/zerobug


## Stripe webhook

Endpoint: `POST /api/stripe/webhook`  
Evenimente: `invoice.paid`, `customer.subscription.created/updated`

## Facturare

- Cron Convex: `0 6 1 * *` (1 ale lunii)
- PDF stocat în Convex file storage + email Resend
- Emitent default: SC AXP GLOBAL RETAIL SRL (editabil în Admin → Setări)
