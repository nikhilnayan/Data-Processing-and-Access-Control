const FinancialRecord = require('../models/FinancialRecord');

class RecordService {
  /**
   * Create a new financial record.
   * @param {Object} data - Record data.
   * @param {number} createdBy - User ID of the creator.
   * @returns {Object} Created record.
   */
  static create(data, createdBy) {
    return FinancialRecord.create({ ...data, created_by: createdBy });
  }

  /**
   * Get a single record by ID.
   * @param {number} id
   * @returns {Object} Record data.
   * @throws {Error} If record not found.
   */
  static getById(id) {
    const record = FinancialRecord.findById(id);
    if (!record) {
      const error = new Error('Financial record not found.');
      error.statusCode = 404;
      throw error;
    }
    return record;
  }

  /**
   * List records with filters and pagination.
   * @param {Object} filters - Query parameters.
   * @returns {{ records: Array, total: number }}
   */
  static list(filters) {
    return FinancialRecord.list(filters);
  }

  /**
   * Update a financial record.
   * @param {number} id
   * @param {Object} updates - Fields to update.
   * @returns {Object} Updated record.
   * @throws {Error} If record not found.
   */
  static update(id, updates) {
    const record = FinancialRecord.update(id, updates);
    if (!record) {
      const error = new Error('Financial record not found.');
      error.statusCode = 404;
      throw error;
    }
    return record;
  }

  /**
   * Soft-delete a financial record.
   * @param {number} id
   * @throws {Error} If record not found.
   */
  static delete(id) {
    const deleted = FinancialRecord.softDelete(id);
    if (!deleted) {
      const error = new Error('Financial record not found.');
      error.statusCode = 404;
      throw error;
    }
  }
}

module.exports = RecordService;
