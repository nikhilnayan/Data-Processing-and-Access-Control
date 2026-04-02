const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');

const SALT_ROUNDS = 10;

class AuthService {
  /**
   * Register a new user.
   * @param {Object} data - { email, password, full_name, role }
   * @returns {Object} { user, token }
   * @throws {Error} If email already exists.
   */
  static async register({ email, password, full_name, role }) {
    // Check if email already exists
    const existing = User.findByEmail(email);
    if (existing) {
      const error = new Error('A user with this email already exists.');
      error.statusCode = 409;
      throw error;
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const user = User.create({ email, password_hash, full_name, role });

    // Generate token
    const token = AuthService.generateToken(user);

    return { user, token };
  }

  /**
   * Authenticate a user with email and password.
   * @param {Object} data - { email, password }
   * @returns {Object} { user, token }
   * @throws {Error} If credentials are invalid or user is inactive.
   */
  static async login({ email, password }) {
    // Find user by email (includes password_hash)
    const user = User.findByEmail(email);
    if (!user) {
      const error = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    // Check if user is active
    if (user.status !== 'active') {
      const error = new Error('Account is inactive. Contact an administrator.');
      error.statusCode = 403;
      throw error;
    }

    // Compare passwords
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      const error = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    // Remove password_hash from response
    const { password_hash, ...safeUser } = user;

    // Generate token
    const token = AuthService.generateToken(safeUser);

    return { user: safeUser, token };
  }

  /**
   * Generate a JWT token for a user.
   * @param {Object} user - User object with id, email, role.
   * @returns {string} JWT token.
   */
  static generateToken(user) {
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
  }
}

module.exports = AuthService;
