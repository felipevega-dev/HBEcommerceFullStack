import { AuthorizationError } from './errorHandler.js'

/**
 * Middleware factory that restricts access to users with specific roles.
 * Usage: router.get('/admin-route', authUser, requireRole('ADMIN', 'OWNER'), handler)
 */
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AuthorizationError('No autenticado'))
    }

    const userRole = req.user.role

    if (!roles.includes(userRole)) {
      return next(
        new AuthorizationError(
          `Acceso denegado. Se requiere uno de los roles: ${roles.join(', ')}`,
        ),
      )
    }

    next()
  }
}
