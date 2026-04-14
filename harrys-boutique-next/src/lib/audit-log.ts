import { prisma } from '@/lib/prisma'

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
      data: { userId, action, resource, resourceId, changes, ip, userAgent },
    })
  } catch (error) {
    // Audit log failures should never crash the main flow
    console.error('[AuditLog] Failed to log action:', { userId, action, resource, error })
  }
}
