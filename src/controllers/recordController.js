const RecordService = require('../services/recordService');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');

class RecordController {
  /**
   * POST /api/records
   * Create a new financial record.
   */
  static create(req, res, next) {
    try {
      const record = RecordService.create(req.body, req.user.id);
      return successResponse(res, 201, 'Financial record created successfully.', { record });
    } catch (err) {
      if (err.statusCode) {
        return errorResponse(res, err.statusCode, err.message);
      }
      next(err);
    }
  }

  /**
   * GET /api/records
   * List financial records with filtering and pagination.
   */
  static list(req, res, next) {
    try {
      const { records, total } = RecordService.list(req.query);
      return paginatedResponse(res, 'Financial records retrieved successfully.', records, {
        page: req.query.page || 1,
        limit: req.query.limit || 20,
        total,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/records/:id
   * Get a single financial record by ID.
   */
  static getById(req, res, next) {
    try {
      const record = RecordService.getById(parseInt(req.params.id, 10));
      return successResponse(res, 200, 'Financial record retrieved successfully.', { record });
    } catch (err) {
      if (err.statusCode) {
        return errorResponse(res, err.statusCode, err.message);
      }
      next(err);
    }
  }

  /**
   * PUT /api/records/:id
   * Update a financial record.
   */
  static update(req, res, next) {
    try {
      const record = RecordService.update(parseInt(req.params.id, 10), req.body);
      return successResponse(res, 200, 'Financial record updated successfully.', { record });
    } catch (err) {
      if (err.statusCode) {
        return errorResponse(res, err.statusCode, err.message);
      }
      next(err);
    }
  }

  /**
   * DELETE /api/records/:id
   * Soft-delete a financial record.
   */
  static delete(req, res, next) {
    try {
      RecordService.delete(parseInt(req.params.id, 10));
      return successResponse(res, 200, 'Financial record deleted successfully.');
    } catch (err) {
      if (err.statusCode) {
        return errorResponse(res, err.statusCode, err.message);
      }
      next(err);
    }
  }
}

module.exports = RecordController;
