import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'

export async function logAuditAction(
  userId: string,
  action: string,
  resource: string,
  resourceId?: string | null,
  changes?: Record<string, unknown> | null,
  ip?: string | null,
  userAgent?: string | null,
) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        resource,
        resourceId,
        // Cast to Prisma's InputJsonValue — safe because Record<string, unknown> is JSON-serializable
        changes: changes !== null && changes !== undefined
          ? (changes as Prisma.InputJsonValue)
          : undefined,
        ip,
        userAgent,
      },
    })
  } catch (error) {
    // Audit log failures should never crash the main flow
    console.error('[AuditLog] Failed to log action:', { userId, action, resource, error })
  }
}
