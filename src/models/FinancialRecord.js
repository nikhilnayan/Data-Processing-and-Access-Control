const { getDatabase } = require('../config/database');

class FinancialRecord {
  /**
   * Find a record by ID (excluding soft-deleted).
   * @param {number} id
   * @returns {Object|undefined}
   */
  static findById(id) {
    const db = getDatabase();
    return db.prepare(`
      SELECT fr.*, u.full_name as created_by_name
      FROM financial_records fr
      JOIN users u ON fr.created_by = u.id
      WHERE fr.id = ? AND fr.is_deleted = 0
    `).get(id);
  }

  /**
   * Create a new financial record.
   * @param {Object} data - { amount, type, category, date, description, created_by }
   * @returns {Object} The created record.
   */
  static create({ amount, type, category, date, description, created_by }) {
    const db = getDatabase();
    const result = db.prepare(`
      INSERT INTO financial_records (amount, type, category, date, description, created_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(amount, type, category, date, description || null, created_by);

    return FinancialRecord.findById(result.lastInsertRowid);
  }

  /**
   * Update a record by ID.
   * @param {number} id
   * @param {Object} updates - Fields to update.
   * @returns {Object|null} Updated record or null if not found.
   */
  static update(id, updates) {
    const db = getDatabase();
    const allowedFields = ['amount', 'type', 'category', 'date', 'description'];
    const setClauses = [];
    const values = [];

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        setClauses.push(`${field} = ?`);
        values.push(updates[field]);
      }
    }

    if (setClauses.length === 0) return FinancialRecord.findById(id);

    setClauses.push("updated_at = datetime('now')");
    values.push(id);

    const sql = `UPDATE financial_records SET ${setClauses.join(', ')} WHERE id = ? AND is_deleted = 0`;
    const result = db.prepare(sql).run(...values);

    if (result.changes === 0) return null;
    return FinancialRecord.findById(id);
  }

  /**
   * Soft-delete a record.
   * @param {number} id
   * @returns {boolean} True if the record was deleted, false if not found.
   */
  static softDelete(id) {
    const db = getDatabase();
    const result = db.prepare(`
      UPDATE financial_records SET is_deleted = 1, updated_at = datetime('now')
      WHERE id = ? AND is_deleted = 0
    `).run(id);
    return result.changes > 0;
  }

  /**
   * List records with filtering, pagination, sorting, and search.
   * @param {Object} options
   * @returns {{ records: Array, total: number }}
   */
  static list({ page = 1, limit = 20, type, category, startDate, endDate, search, sort = 'date', order = 'desc' } = {}) {
    const db = getDatabase();
    const conditions = ['fr.is_deleted = 0'];
    const params = [];

    if (type) {
      conditions.push('fr.type = ?');
      params.push(type);
    }
    if (category) {
      conditions.push('fr.category = ?');
      params.push(category);
    }
    if (startDate) {
      conditions.push('fr.date >= ?');
      params.push(startDate);
    }
    if (endDate) {
      conditions.push('fr.date <= ?');
      params.push(endDate);
    }
    if (search) {
      conditions.push('(fr.description LIKE ? OR fr.category LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    // Whitelist sort columns to prevent SQL injection
    const allowedSorts = ['date', 'amount', 'type', 'category', 'created_at'];
    const sortColumn = allowedSorts.includes(sort) ? `fr.${sort}` : 'fr.date';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const offset = (page - 1) * limit;

    const total = db.prepare(`
      SELECT COUNT(*) as count FROM financial_records fr ${whereClause}
    `).get(...params).count;

    const records = db.prepare(`
      SELECT fr.*, u.full_name as created_by_name
      FROM financial_records fr
      JOIN users u ON fr.created_by = u.id
      ${whereClause}
      ORDER BY ${sortColumn} ${sortOrder}
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset);

    return { records, total };
  }

  // ── Aggregation Methods (for Dashboard) ─────────────────────────────

  /**
   * Get total income, total expenses, and net balance.
   * @returns {{ total_income: number, total_expenses: number, net_balance: number }}
   */
  static getSummary() {
    const db = getDatabase();
    const result = db.prepare(`
      SELECT
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expenses
      FROM financial_records
      WHERE is_deleted = 0
    `).get();

    return {
      total_income: result.total_income,
      total_expenses: result.total_expenses,
      net_balance: +(result.total_income - result.total_expenses).toFixed(2),
    };
  }

  /**
   * Get totals grouped by category.
   * @param {string} [type] - Optional filter by 'income' or 'expense'.
   * @returns {Array<{ category: string, type: string, total: number, count: number }>}
   */
  static getCategoryTotals(type) {
    const db = getDatabase();
    let sql = `
      SELECT category, type,
        SUM(amount) as total,
        COUNT(*) as count
      FROM financial_records
      WHERE is_deleted = 0
    `;
    const params = [];

    if (type) {
      sql += ' AND type = ?';
      params.push(type);
    }

    sql += ' GROUP BY category, type ORDER BY total DESC';

    return db.prepare(sql).all(...params);
  }

  /**
   * Get monthly trends for the specified number of months.
   * @param {number} [months=12] - Number of months to look back.
   * @returns {Array<{ month: string, income: number, expenses: number, net: number }>}
   */
  static getMonthlyTrends(months = 12) {
    const db = getDatabase();
    return db.prepare(`
      SELECT
        strftime('%Y-%m', date) as month,
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as expenses,
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) -
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as net
      FROM financial_records
      WHERE is_deleted = 0
        AND date >= date('now', '-' || ? || ' months')
      GROUP BY month
      ORDER BY month ASC
    `).all(months);
  }

  /**
   * Get the most recent N records.
   * @param {number} [limit=10]
   * @returns {Array}
   */
  static getRecentActivity(limit = 10) {
    const db = getDatabase();
    return db.prepare(`
      SELECT fr.*, u.full_name as created_by_name
      FROM financial_records fr
      JOIN users u ON fr.created_by = u.id
      WHERE fr.is_deleted = 0
      ORDER BY fr.created_at DESC
      LIMIT ?
    `).all(limit);
  }
}

module.exports = FinancialRecord;
