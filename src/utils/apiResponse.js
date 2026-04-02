/**
 * Standardized API response helpers.
 * Ensures consistent response structure across all endpoints.
 */

/**
 * Send a success response.
 * @param {Object} res - Express response object.
 * @param {number} statusCode - HTTP status code.
 * @param {string} message - Human-readable message.
 * @param {Object} [data] - Response payload.
 */
function successResponse(res, statusCode, message, data = null) {
  const response = { success: true, message };
  if (data !== null) {
    response.data = data;
  }
  return res.status(statusCode).json(response);
}

/**
 * Send an error response.
 * @param {Object} res - Express response object.
 * @param {number} statusCode - HTTP status code.
 * @param {string} message - Human-readable error message.
 * @param {Object} [details] - Additional error details (e.g., validation errors).
 */
function errorResponse(res, statusCode, message, details = null) {
  const response = { success: false, message };
  if (details !== null) {
    response.details = details;
  }
  return res.status(statusCode).json(response);
}

/**
 * Send a paginated success response.
 * @param {Object} res - Express response object.
 * @param {string} message - Human-readable message.
 * @param {Array} items - Array of items for the current page.
 * @param {Object} pagination - Pagination metadata.
 * @param {number} pagination.page - Current page number.
 * @param {number} pagination.limit - Items per page.
 * @param {number} pagination.total - Total number of items.
 */
function paginatedResponse(res, message, items, pagination) {
  const totalPages = Math.ceil(pagination.total / pagination.limit);
  return res.status(200).json({
    success: true,
    message,
    data: items,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages,
      hasNextPage: pagination.page < totalPages,
      hasPrevPage: pagination.page > 1,
    },
  });
}

module.exports = { successResponse, errorResponse, paginatedResponse };
