/**
 * Error Handler Middleware
 * Catches and formats errors for consistent API responses
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err)

  // Default error
  let statusCode = 500
  let message = 'Internal server error'

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400
    message = err.message
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401
    message = 'Unauthorized'
  } else if (err.name === 'ForbiddenError') {
    statusCode = 403
    message = 'Forbidden'
  } else if (err.name === 'NotFoundError') {
    statusCode = 404
    message = 'Resource not found'
  } else if (err.code === 'permission-denied') {
    statusCode = 403
    message = 'Permission denied'
  }

  // Custom error message if provided
  if (err.message) {
    message = err.message
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
}

/**
 * Not Found Handler
 * Catches undefined routes
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.originalUrl} not found`
  })
}

module.exports = { errorHandler, notFoundHandler }
