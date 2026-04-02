const express = require('express');
const router = express.Router();
const RecordController = require('../controllers/recordController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');
const {
  createRecordSchema,
  updateRecordSchema,
  recordIdParamSchema,
  listRecordsQuerySchema,
} = require('../validators/recordValidator');

// All record routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/records:
 *   post:
 *     tags: [Financial Records]
 *     summary: Create a new financial record (Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount, type, category, date]
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 5000.00
 *               type:
 *                 type: string
 *                 enum: [income, expense]
 *               category:
 *                 type: string
 *                 example: Salary
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2026-04-01"
 *               description:
 *                 type: string
 *                 example: Monthly salary
 *     responses:
 *       201:
 *         description: Record created
 *       400:
 *         description: Validation error
 *       403:
 *         description: Access denied
 */
router.post('/', authorize('admin'), validate({ body: createRecordSchema }), RecordController.create);

/**
 * @swagger
 * /api/records:
 *   get:
 *     tags: [Financial Records]
 *     summary: List financial records (All authenticated users)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [income, expense]
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [date, amount, type, category, created_at]
 *           default: date
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Records retrieved
 */
router.get('/', validate({ query: listRecordsQuerySchema }), RecordController.list);

/**
 * @swagger
 * /api/records/{id}:
 *   get:
 *     tags: [Financial Records]
 *     summary: Get a single financial record
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Record retrieved
 *       404:
 *         description: Record not found
 */
router.get('/:id', validate({ params: recordIdParamSchema }), RecordController.getById);

/**
 * @swagger
 * /api/records/{id}:
 *   put:
 *     tags: [Financial Records]
 *     summary: Update a financial record (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               type:
 *                 type: string
 *                 enum: [income, expense]
 *               category:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Record updated
 *       404:
 *         description: Record not found
 */
router.put('/:id', authorize('admin'), validate({ params: recordIdParamSchema, body: updateRecordSchema }), RecordController.update);

/**
 * @swagger
 * /api/records/{id}:
 *   delete:
 *     tags: [Financial Records]
 *     summary: Soft-delete a financial record (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Record deleted
 *       404:
 *         description: Record not found
 */
router.delete('/:id', authorize('admin'), validate({ params: recordIdParamSchema }), RecordController.delete);

module.exports = router;
