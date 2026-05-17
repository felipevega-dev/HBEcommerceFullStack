import type { Metadata } from 'next'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { AdminCustomerList } from '@/components/admin/customer-list'

export const metadata: Metadata = { title: "Clientes - Admin Harry's Boutique" }

type CustomerSegment = 'vip' | 'frequent' | 'regular' | 'at_risk' | 'new'

type CustomerRow = {
  id: string
  name: string
  email: string
  role: string
  tags: string[]
  createdAt: Date
  segment: CustomerSegment
  clv: Prisma.Decimal | number | string
  orderCount: number | bigint
  lastOrderDate: Date | null
}

type CountRow = { total: number | bigint }

const CUSTOMER_SEGMENTS = new Set<CustomerSegment>(['vip', 'frequent', 'regular', 'at_risk', 'new'])

function parsePage(value: string | undefined) {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1
}

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; segment?: string }>
}) {
  const params = await searchParams
  const page = parsePage(params.page)
  const limit = 20
  const skip = (page - 1) * limit
  const search = params.search?.trim()
  const segment = CUSTOMER_SEGMENTS.has(params.segment as CustomerSegment)
    ? (params.segment as CustomerSegment)
    : null

  const now = new Date()
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)

  const searchCondition = search
    ? Prisma.sql`AND (u.name ILIKE ${`%${search}%`} OR u.email ILIKE ${`%${search}%`})`
    : Prisma.empty
  const segmentCondition = segment ? Prisma.sql`WHERE segment = ${segment}` : Prisma.empty

  const segmentedCustomers = Prisma.sql`
    WITH customer_metrics AS (
      SELECT
        u.id,
        u.name,
        u.email,
        u.role::text AS role,
        u.tags,
        u."createdAt",
        COALESCE(SUM(o.amount) FILTER (
          WHERE o.status IN ('PROCESSING', 'SHIPPED', 'DELIVERED')
        ), 0) AS clv,
        COUNT(o.id) FILTER (
          WHERE o.status IN ('PROCESSING', 'SHIPPED', 'DELIVERED')
        )::int AS "orderCount",
        MAX(o."createdAt") FILTER (
          WHERE o.status IN ('PROCESSING', 'SHIPPED', 'DELIVERED')
        ) AS "lastOrderDate",
        COUNT(o.id) FILTER (
          WHERE o.status IN ('PROCESSING', 'SHIPPED', 'DELIVERED')
            AND o."createdAt" > ${oneMonthAgo}
        )::int AS "recentOrders"
      FROM users u
      LEFT JOIN orders o ON o."userId" = u.id
      WHERE u.role = 'USER' ${searchCondition}
      GROUP BY u.id, u.name, u.email, u.role, u.tags, u."createdAt"
    ),
    segmented AS (
      SELECT
        id,
        name,
        email,
        role,
        tags,
        "createdAt",
        clv,
        "orderCount",
        "lastOrderDate",
        CASE
          WHEN clv >= 500000 THEN 'vip'
          WHEN "orderCount" >= 5 THEN 'frequent'
          WHEN "recentOrders" = 0
            AND "lastOrderDate" IS NOT NULL
            AND "lastOrderDate" < ${ninetyDaysAgo}
            THEN 'at_risk'
          WHEN "orderCount" = 0
            OR ("orderCount" = 1 AND "createdAt" > ${oneMonthAgo})
            THEN 'new'
          ELSE 'regular'
        END AS segment
      FROM customer_metrics
    )
    SELECT * FROM segmented
    ${segmentCondition}
  `

  const [rows, countRows] = await Promise.all([
    prisma.$queryRaw<CustomerRow[]>`
      ${segmentedCustomers}
      ORDER BY clv DESC, "lastOrderDate" DESC NULLS LAST, "createdAt" DESC
      LIMIT ${limit} OFFSET ${skip}
    `,
    prisma.$queryRaw<CountRow[]>`
      SELECT COUNT(*)::int AS total FROM (${segmentedCustomers}) filtered_customers
    `,
  ])

  const total = Number(countRows[0]?.total ?? 0)
  const users = rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    tags: row.tags,
    segment: row.segment,
    clv: Number(row.clv),
    orderCount: Number(row.orderCount),
    lastOrderDate: row.lastOrderDate?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  }))

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Clientes</h1>
      <AdminCustomerList users={users} total={total} page={page} limit={limit} />
    </div>
  )
}
