# Supabase + Vercel Deploy

This is the recommended low-cost path for the project right now. Railway remains supported through `railway.toml` for a future switch.

## Why Supabase Now

- Supabase has a practical free Postgres tier and a friendly dashboard.
- It gives us hosted PostgreSQL without managing a VPS.
- It works well with Prisma when the app runtime uses the transaction pooler.
- It keeps the app portable because runtime still uses `DATABASE_URL`; Prisma migrations use `DIRECT_URL`.

## Alternatives

- Neon: also a good serverless Postgres option. It is usually excellent for branching and scale-to-zero workflows, but Supabase is easier for this project because the dashboard, SQL editor, auth/storage extras, and free-tier onboarding are more straightforward.
- Railway: very convenient, but not ideal if the goal is to avoid monthly cost right now. Keep it as a future paid option.
- VPS: can be cheap, but adds server maintenance, SSL, firewall, backups, process management, and security work.

## Supabase Setup

1. Create a Supabase project.
2. Go to Project Settings → Database → Connection string.
3. Copy the transaction pooler connection string for Vercel runtime.
4. Set it as `DATABASE_URL` in Vercel.
5. Copy the direct connection string for migrations and save it as `DIRECT_URL`.
6. Keep `DATABASE_URL` as the pooler URL in Vercel runtime. Prisma will use `DIRECT_URL` for migrations.

Runtime `DATABASE_URL` example:

```env
DATABASE_URL="postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
```

Migration direct URL example:

```env
DIRECT_URL="postgresql://postgres:PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres"
```

## Vercel Setup

1. Import the GitHub repository in Vercel.
2. Set Root Directory to `harrys-boutique-next`.
3. Vercel will use `vercel.json` and run `npm run vercel:build`.
4. Add all production variables from `.env.production.example`.
5. Deploy.

Required Vercel variables:

- `DATABASE_URL`
- `DIRECT_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `NEXT_PUBLIC_FRONTEND_URL`
- `BLOB_READ_WRITE_TOKEN`
- `MERCADOPAGO_ACCESS_TOKEN`
- `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY`
- `MERCADOPAGO_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`

Recommended variables:

- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `NEXT_PUBLIC_SENTRY_DSN`
- `SENTRY_ORG`
- `SENTRY_PROJECT`

Optional Instagram variables:

- `INSTAGRAM_USER_ID`
- `INSTAGRAM_ACCESS_TOKEN`
- `INSTAGRAM_GRAPH_API_VERSION`

## Migration Flow

Before the first production deploy:

```bash
cd harrys-boutique-next
set DATABASE_URL=postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
set DIRECT_URL=postgresql://postgres:PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres
npm run db:migrate:deploy
npm run admin:create
```

On macOS/Linux, use `export DATABASE_URL="..."` and `export DIRECT_URL="..."` instead of `set`.

For future releases, run migrations before or immediately after deploy using the direct Supabase URL.

## MercadoPago Webhook

Configure the webhook URL in MercadoPago:

```text
https://your-production-domain.com/api/mercadopago/webhook
```

Then set `MERCADOPAGO_WEBHOOK_SECRET` in Vercel with the MercadoPago webhook secret.

## Smoke Test

- `https://your-production-domain.com/api/health` returns `200`.
- Register/login works.
- Admin can create a product and upload images.
- Checkout creates an order.
- MercadoPago redirects correctly.
- Webhook marks the order as paid.
- Resend sends the confirmation email.

## Keeping Railway Ready

Railway remains compatible because:

- `railway.toml` is still present.
- `npm start` does not run migrations.
- `npm run db:migrate:deploy` remains the migration command.
- The app only requires standard PostgreSQL through `DATABASE_URL`.

## Supabase Client Helpers

Supabase browser/server clients are available but do not replace Prisma for the ecommerce database layer:

- Browser: `createSupabaseBrowserClient()` from `@/lib/supabase/client`
- Server: `createSupabaseServerClient()` from `@/lib/supabase/server`

Avoid a shared barrel export for these clients so server-only imports do not leak into client bundles.

Use these helpers if we later enable Supabase features such as realtime, storage, edge functions, or Supabase Auth integrations.
