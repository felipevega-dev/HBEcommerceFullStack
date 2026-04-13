// Custom error classes
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = true
    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  constructor(message) {
    super(message, 400)
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'No autenticado') {
    super(message, 401)
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'No autorizado') {
    super(message, 403)
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Recurso no encontrado') {
    super(message, 404)
  }
}

// Global error handling middleware
const errorHandler = (err, req, res, _next) => {
  const statusCode = err.statusCode || 500
  const isProduction = process.env.NODE_ENV === 'production'

  if (statusCode >= 500) {
    // Dynamic import to avoid circular deps — logger is set on app after init
    const logger = req.app?.get('logger')
    if (logger) {
      logger.error({
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        userId: req.user?.id,
      })
    } else {
      console.error(err)
    }
  }

  res.status(statusCode).json({
    success: false,
    message: isProduction && statusCode === 500 ? 'Error interno del servidor' : err.message,
    ...(!isProduction && { stack: err.stack }),
  })
}

export default errorHandler
