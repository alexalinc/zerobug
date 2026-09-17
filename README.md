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

## Env

Vezi `.env.example`. Pe Vercel setează aceleași variabile + Convex production URL.

## Stripe webhook

Endpoint: `POST /api/stripe/webhook`  
Evenimente: `invoice.paid`, `customer.subscription.created/updated`

## Facturare

- Cron Convex: `0 6 1 * *` (1 ale lunii)
- PDF stocat în Convex file storage + email Resend
- Emitent default: SC AXP GLOBAL RETAIL SRL (editabil în Admin → Setări)
