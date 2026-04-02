const { errorResponse } = require('../utils/apiResponse');

/**
 * Role-based access control middleware factory.
 * Returns middleware that checks if the authenticated user has one of the allowed roles.
 *
 * @param  {...string} allowedRoles - Roles permitted to access the route.
 * @returns {Function} Express middleware function.
 *
 * @example
 * router.get('/admin-only', authenticate, authorize('admin'), controller.handler);
 * router.get('/analysts-too', authenticate, authorize('analyst', 'admin'), controller.handler);
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 401, 'Authentication required.');
    }

    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(
        res,
        403,
        `Access denied. Required role(s): ${allowedRoles.join(', ')}. Your role: ${req.user.role}.`
      );
    }

    next();
  };
}

module.exports = { authorize };
