const { errorResponse } = require('../utils/apiResponse');

/**
 * Global error handler middleware.
 * Catches unhandled errors and returns a structured JSON response.
 */
function errorHandler(err, req, res, _next) {
  // Log the error in development
  if (process.env.NODE_ENV !== 'test') {
    console.error('Unhandled error:', {
      message: err.message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
    });
  }

  // Handle specific error types
  if (err.type === 'entity.parse.failed') {
    return errorResponse(res, 400, 'Invalid JSON in request body.');
  }

  if (err.code === 'SQLITE_CONSTRAINT_UNIQUE' ||
      (err.message && err.message.includes('UNIQUE constraint failed'))) {
    return errorResponse(res, 409, 'A record with this value already exists.');
  }

  if (err.code === 'SQLITE_CONSTRAINT' ||
      (err.message && err.message.includes('constraint failed'))) {
    return errorResponse(res, 400, 'Database constraint violation.');
  }

  // Default to 500
  const statusCode = err.statusCode || 500;
  const message = statusCode === 500
    ? 'An unexpected error occurred. Please try again later.'
    : err.message;

  return errorResponse(res, statusCode, message);
}

module.exports = { errorHandler };
