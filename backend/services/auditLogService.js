import AuditLogModel from '../models/auditLogModel.js'
import logger from '../config/logger.js'

/**
 * Log an administrative action.
 * @param {string} userId - ID of the user performing the action
 * @param {string} action - Action performed (CREATE, UPDATE, DELETE, etc.)
 * @param {string} resource - Resource type (product, order, user, etc.)
 * @param {string|null} resourceId - ID of the affected resource
 * @param {object|null} changes - Object describing what changed
 * @param {import('express').Request} req - Express request (for IP and user agent)
 */
export const logAction = async (
  userId,
  action,
  resource,
  resourceId = null,
  changes = null,
  req = null,
) => {
  try {
    await AuditLogModel.create({
      userId,
      action,
      resource,
      resourceId,
      changes,
      ip: req?.ip || req?.headers?.['x-forwarded-for'],
      userAgent: req?.headers?.['user-agent'],
    })
  } catch (error) {
    // Audit log failures should never crash the main flow
    logger.error('Error al registrar audit log', { error: error.message, userId, action, resource })
  }
}

export const getAuditLogs = async ({ page = 1, limit = 50, resource, userId } = {}) => {
  const filter = {}
  if (resource) filter.resource = resource
  if (userId) filter.userId = userId

  const skip = (Number(page) - 1) * Number(limit)
  const [logs, total] = await Promise.all([
    AuditLogModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('userId', 'name email'),
    AuditLogModel.countDocuments(filter),
  ])

  return {
    logs,
    total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / Number(limit)),
  }
}
