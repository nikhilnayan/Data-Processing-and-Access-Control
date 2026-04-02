const AuthService = require('../services/authService');
const { successResponse, errorResponse } = require('../utils/apiResponse');

class AuthController {
  /**
   * POST /api/auth/register
   * Register a new user.
   */
  static async register(req, res, next) {
    try {
      const { user, token } = await AuthService.register(req.body);
      return successResponse(res, 201, 'User registered successfully.', { user, token });
    } catch (err) {
      if (err.statusCode) {
        return errorResponse(res, err.statusCode, err.message);
      }
      next(err);
    }
  }

  /**
   * POST /api/auth/login
   * Authenticate a user and return a JWT.
   */
  static async login(req, res, next) {
    try {
      const { user, token } = await AuthService.login(req.body);
      return successResponse(res, 200, 'Login successful.', { user, token });
    } catch (err) {
      if (err.statusCode) {
        return errorResponse(res, err.statusCode, err.message);
      }
      next(err);
    }
  }

  /**
   * GET /api/auth/me
   * Get the currently authenticated user's profile.
   */
  static async me(req, res) {
    return successResponse(res, 200, 'User profile retrieved.', { user: req.user });
  }
}

module.exports = AuthController;
