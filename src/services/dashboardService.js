const FinancialRecord = require('../models/FinancialRecord');

class DashboardService {
  /**
   * Get financial summary (total income, expenses, net balance).
   * @returns {Object} Summary data.
   */
  static getSummary() {
    return FinancialRecord.getSummary();
  }

  /**
   * Get category-wise totals.
   * @param {string} [type] - Optional filter ('income' or 'expense').
   * @returns {Array} Category data with totals and counts.
   */
  static getCategoryTotals(type) {
    return FinancialRecord.getCategoryTotals(type);
  }

  /**
   * Get monthly trends.
   * @param {number} [months=12] - Number of months to look back.
   * @returns {Array} Monthly breakdown of income, expenses, and net.
   */
  static getMonthlyTrends(months) {
    return FinancialRecord.getMonthlyTrends(months);
  }

  /**
   * Get recent activity.
   * @param {number} [limit=10] - Number of recent records.
   * @returns {Array} Recent financial records.
   */
  static getRecentActivity(limit) {
    return FinancialRecord.getRecentActivity(limit);
  }
}

module.exports = DashboardService;
