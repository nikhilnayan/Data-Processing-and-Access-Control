const User = require('../models/User');

class UserService {
  /**
   * Get a user by ID.
   * @param {number} id
   * @returns {Object} User data.
   * @throws {Error} If user not found.
   */
  static getById(id) {
    const user = User.findById(id);
    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }
    return user;
  }

  /**
   * List all users with optional filters and pagination.
   * @param {Object} options - { page, limit, role, status }
   * @returns {{ users: Array, total: number }}
   */
  static list(options) {
    return User.list(options);
  }

  /**
   * Update a user's profile (role, status, name).
   * Validates that an admin can't deactivate themselves.
   * @param {number} id - User ID to update.
   * @param {Object} updates - Fields to update.
   * @param {Object} requestingUser - The user making the request.
   * @returns {Object} Updated user.
   * @throws {Error} If user not found or self-demotion attempted.
   */
  static update(id, updates, requestingUser) {
    // Prevent admin from changing their own role or deactivating themselves
    if (requestingUser.id === id) {
      if (updates.role && updates.role !== requestingUser.role) {
        const error = new Error('You cannot change your own role.');
        error.statusCode = 400;
        throw error;
      }
      if (updates.status === 'inactive') {
        const error = new Error('You cannot deactivate your own account.');
        error.statusCode = 400;
        throw error;
      }
    }

    const user = User.update(id, updates);
    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }
    return user;
  }

  /**
   * Deactivate a user (soft-delete by setting status to inactive).
   * @param {number} id - User ID to deactivate.
   * @param {Object} requestingUser - The user making the request.
   * @returns {Object} Updated user.
   * @throws {Error} If user not found or self-deactivation attempted.
   */
  static deactivate(id, requestingUser) {
    if (requestingUser.id === id) {
      const error = new Error('You cannot deactivate your own account.');
      error.statusCode = 400;
      throw error;
    }

    const user = User.update(id, { status: 'inactive' });
    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }
    return user;
  }
}

module.exports = UserService;
