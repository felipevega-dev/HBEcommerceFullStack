# Production Checklist

## Before Deploy

- Current recommended target: Vercel for the app and Supabase for PostgreSQL.
- Keep Railway/VPS as future alternatives; do not delete their config unless we fully migrate away.
- Configure all variables from `.env.production.example` in the provider secrets panel.
- Use Supabase transaction pooler for `DATABASE_URL` and direct port 5432 URL for `DIRECT_URL`.
- Configure `ORDER_STOCK_RESERVATION_MINUTES` for pending MercadoPago stock reservations.
- Use production MercadoPago credentials, not sandbox credentials.
- Verify the Resend sending domain with SPF, DKIM, and DMARC records.
- Configure PostgreSQL automated backups and test one restore.
- Run migrations in staging with `npm run db:migrate:deploy`.
- For Supabase migrations, keep runtime on the transaction pooler URL and let Prisma use `DIRECT_URL`.
- Create and verify the initial `OWNER` user with `npm run admin:create`.
- Guest checkout: apply migration `20261018140000_guest_checkout` before deploying the branch; optionally set `GUEST_ORDER_SECRET`.

## Release Gate

- `npm run type-check`
- `npm run lint`
- `npm run test`
- `npm run build`
- `npm audit --omit=dev`
- `npm run db:migrate:deploy` against staging before production.

## Smoke Test

- `GET /api/health` returns `200`.
- Register, login, add product to cart, checkout and pay with MercadoPago.
- As a guest (no session): add a product, pay with MercadoPago, return to `/orders/<id>` and open the "Ver mi pedido" link from the email in another browser.
- MercadoPago webhook marks the order as paid and `PROCESSING`.
- A rejected/expired MercadoPago order releases stock and coupon usage.
- Order confirmation email arrives from the verified sender.
- Admin can create/edit products and upload images.
- Sitemap and robots are available at `/sitemap.xml` and `/robots.txt`.

## Monitoring

- Configure Sentry DSN and project variables if Sentry is used.
- Add uptime monitoring for `/api/health`.
- Add alerting for failed deploys, failed webhooks, and database backup failures.
