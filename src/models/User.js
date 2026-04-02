const { getDatabase } = require('../config/database');

class User {
  /**
   * Find a user by email.
   * @param {string} email
   * @returns {Object|undefined}
   */
  static findByEmail(email) {
    const db = getDatabase();
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  }

  /**
   * Find a user by ID.
   * @param {number} id
   * @returns {Object|undefined}
   */
  static findById(id) {
    const db = getDatabase();
    return db.prepare('SELECT id, email, full_name, role, status, created_at, updated_at FROM users WHERE id = ?').get(id);
  }

  /**
   * Create a new user.
   * @param {Object} userData - { email, password_hash, full_name, role }
   * @returns {Object} The created user (without password_hash).
   */
  static create({ email, password_hash, full_name, role = 'viewer' }) {
    const db = getDatabase();
    const result = db.prepare(`
      INSERT INTO users (email, password_hash, full_name, role)
      VALUES (?, ?, ?, ?)
    `).run(email, password_hash, full_name, role);

    return User.findById(result.lastInsertRowid);
  }

  /**
   * Update a user by ID.
   * @param {number} id
   * @param {Object} updates - Fields to update (full_name, role, status).
   * @returns {Object|null} Updated user or null if not found.
   */
  static update(id, updates) {
    const db = getDatabase();
    const allowedFields = ['full_name', 'role', 'status'];
    const setClauses = [];
    const values = [];

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        setClauses.push(`${field} = ?`);
        values.push(updates[field]);
      }
    }

    if (setClauses.length === 0) return User.findById(id);

    setClauses.push("updated_at = datetime('now')");
    values.push(id);

    const sql = `UPDATE users SET ${setClauses.join(', ')} WHERE id = ?`;
    const result = db.prepare(sql).run(...values);

    if (result.changes === 0) return null;
    return User.findById(id);
  }

  /**
   * List all users with pagination.
   * @param {Object} options - { page, limit, role, status }
   * @returns {{ users: Array, total: number }}
   */
  static list({ page = 1, limit = 20, role, status } = {}) {
    const db = getDatabase();
    const conditions = [];
    const params = [];

    if (role) {
      conditions.push('role = ?');
      params.push(role);
    }
    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (page - 1) * limit;

    const total = db.prepare(`SELECT COUNT(*) as count FROM users ${whereClause}`).get(...params).count;

    const users = db.prepare(`
      SELECT id, email, full_name, role, status, created_at, updated_at
      FROM users ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset);

    return { users, total };
  }
}

module.exports = User;
