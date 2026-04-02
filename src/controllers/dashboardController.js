const DashboardService = require('../services/dashboardService');
const { successResponse } = require('../utils/apiResponse');

class DashboardController {
  /**
   * GET /api/dashboard/summary
   * Get total income, total expenses, and net balance.
   */
  static getSummary(req, res, next) {
    try {
      const summary = DashboardService.getSummary();
      return successResponse(res, 200, 'Dashboard summary retrieved.', { summary });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/dashboard/category-totals
   * Get totals grouped by category.
   * Optional query: ?type=income or ?type=expense
   */
  static getCategoryTotals(req, res, next) {
    try {
      const { type } = req.query;
      const categories = DashboardService.getCategoryTotals(type);
      return successResponse(res, 200, 'Category totals retrieved.', { categories });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/dashboard/trends
   * Get monthly trends.
   * Optional query: ?months=6 (default 12)
   */
  static getMonthlyTrends(req, res, next) {
    try {
      const months = parseInt(req.query.months, 10) || 12;
      const trends = DashboardService.getMonthlyTrends(months);
      return successResponse(res, 200, 'Monthly trends retrieved.', { trends });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/dashboard/recent
   * Get recent activity.
   * Optional query: ?limit=10 (default 10)
   */
  static getRecentActivity(req, res, next) {
    try {
      const limit = parseInt(req.query.limit, 10) || 10;
      const records = DashboardService.getRecentActivity(limit);
      return successResponse(res, 200, 'Recent activity retrieved.', { records });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = DashboardController;
