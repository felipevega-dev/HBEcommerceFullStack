# Production Checklist

## Before Deploy

- Current recommended target: Vercel for the app and Supabase for PostgreSQL.
- Keep Railway/VPS as future alternatives; do not delete their config unless we fully migrate away.
- Configure all variables from `.env.production.example` in the provider secrets panel.
- Use production MercadoPago credentials, not sandbox credentials.
- Verify the Resend sending domain with SPF, DKIM, and DMARC records.
- Configure PostgreSQL automated backups and test one restore.
- Run migrations in staging with `npm run db:migrate:deploy`.
- For Supabase migrations, prefer the direct connection string while runtime uses the transaction pooler URL.
- Create and verify the initial `OWNER` user with `npm run admin:create`.

## Release Gate

- `npm run type-check`
- `npm run lint`
- `npm run test`
- `npm run build`
- `npm run db:migrate:deploy` against staging before production.

## Smoke Test

- `GET /api/health` returns `200`.
- Register, login, add product to cart, checkout and pay with MercadoPago.
- MercadoPago webhook marks the order as paid and `PROCESSING`.
- Order confirmation email arrives from the verified sender.
- Admin can create/edit products and upload images.
- Sitemap and robots are available at `/sitemap.xml` and `/robots.txt`.

## Monitoring

- Configure Sentry DSN and project variables if Sentry is used.
- Add uptime monitoring for `/api/health`.
- Add alerting for failed deploys, failed webhooks, and database backup failures.
