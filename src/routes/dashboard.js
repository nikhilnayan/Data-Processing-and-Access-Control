const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

// All dashboard routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/dashboard/summary:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get financial summary (Analyst, Admin)
 *     description: Returns total income, total expenses, and net balance
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Summary data retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     summary:
 *                       type: object
 *                       properties:
 *                         total_income:
 *                           type: number
 *                         total_expenses:
 *                           type: number
 *                         net_balance:
 *                           type: number
 *       403:
 *         description: Access denied (Viewers cannot access)
 */
router.get('/summary', authorize('analyst', 'admin'), DashboardController.getSummary);

/**
 * @swagger
 * /api/dashboard/category-totals:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get category-wise totals (Analyst, Admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [income, expense]
 *         description: Optional filter by type
 *     responses:
 *       200:
 *         description: Category totals retrieved
 */
router.get('/category-totals', authorize('analyst', 'admin'), DashboardController.getCategoryTotals);

/**
 * @swagger
 * /api/dashboard/trends:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get monthly trends (Analyst, Admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: months
 *         schema:
 *           type: integer
 *           default: 12
 *         description: Number of months to look back
 *     responses:
 *       200:
 *         description: Monthly trends retrieved
 */
router.get('/trends', authorize('analyst', 'admin'), DashboardController.getMonthlyTrends);

/**
 * @swagger
 * /api/dashboard/recent:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get recent activity (All authenticated users)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of recent records to return
 *     responses:
 *       200:
 *         description: Recent activity retrieved
 */
router.get('/recent', DashboardController.getRecentActivity);

module.exports = router;
