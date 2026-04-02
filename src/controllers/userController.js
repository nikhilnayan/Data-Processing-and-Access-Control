const UserService = require('../services/userService');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');

class UserController {
  /**
   * GET /api/users
   * List all users with optional filtering and pagination.
   */
  static list(req, res, next) {
    try {
      const { users, total } = UserService.list(req.query);
      return paginatedResponse(res, 'Users retrieved successfully.', users, {
        page: req.query.page || 1,
        limit: req.query.limit || 20,
        total,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/users/:id
   * Get a single user by ID.
   */
  static getById(req, res, next) {
    try {
      const user = UserService.getById(parseInt(req.params.id, 10));
      return successResponse(res, 200, 'User retrieved successfully.', { user });
    } catch (err) {
      if (err.statusCode) {
        return errorResponse(res, err.statusCode, err.message);
      }
      next(err);
    }
  }

  /**
   * PATCH /api/users/:id
   * Update a user (role, status, full_name).
   */
  static update(req, res, next) {
    try {
      const user = UserService.update(
        parseInt(req.params.id, 10),
        req.body,
        req.user
      );
      return successResponse(res, 200, 'User updated successfully.', { user });
    } catch (err) {
      if (err.statusCode) {
        return errorResponse(res, err.statusCode, err.message);
      }
      next(err);
    }
  }

  /**
   * DELETE /api/users/:id
   * Deactivate a user (set status to inactive).
   */
  static deactivate(req, res, next) {
    try {
      const user = UserService.deactivate(
        parseInt(req.params.id, 10),
        req.user
      );
      return successResponse(res, 200, 'User deactivated successfully.', { user });
    } catch (err) {
      if (err.statusCode) {
        return errorResponse(res, err.statusCode, err.message);
      }
      next(err);
    }
  }
}

module.exports = UserController;
