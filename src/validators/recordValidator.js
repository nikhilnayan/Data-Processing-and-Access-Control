const Joi = require('joi');

const createRecordSchema = Joi.object({
  amount: Joi.number().positive().precision(2).required().messages({
    'number.base': 'Amount must be a number',
    'number.positive': 'Amount must be greater than zero',
    'any.required': 'Amount is required',
  }),
  type: Joi.string().valid('income', 'expense').required().messages({
    'any.only': 'Type must be either income or expense',
    'any.required': 'Type is required',
  }),
  category: Joi.string().trim().min(1).max(50).required().messages({
    'string.min': 'Category must not be empty',
    'string.max': 'Category must not exceed 50 characters',
    'any.required': 'Category is required',
  }),
  date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required().messages({
    'string.pattern.base': 'Date must be in YYYY-MM-DD format',
    'any.required': 'Date is required',
  }),
  description: Joi.string().trim().max(500).allow('', null).messages({
    'string.max': 'Description must not exceed 500 characters',
  }),
});

const updateRecordSchema = Joi.object({
  amount: Joi.number().positive().precision(2).messages({
    'number.base': 'Amount must be a number',
    'number.positive': 'Amount must be greater than zero',
  }),
  type: Joi.string().valid('income', 'expense').messages({
    'any.only': 'Type must be either income or expense',
  }),
  category: Joi.string().trim().min(1).max(50).messages({
    'string.min': 'Category must not be empty',
    'string.max': 'Category must not exceed 50 characters',
  }),
  date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).messages({
    'string.pattern.base': 'Date must be in YYYY-MM-DD format',
  }),
  description: Joi.string().trim().max(500).allow('', null).messages({
    'string.max': 'Description must not exceed 500 characters',
  }),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

const recordIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    'number.base': 'Record ID must be a number',
    'number.integer': 'Record ID must be an integer',
    'number.positive': 'Record ID must be positive',
  }),
});

const listRecordsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  type: Joi.string().valid('income', 'expense'),
  category: Joi.string().trim().max(50),
  startDate: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/),
  endDate: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/),
  search: Joi.string().trim().max(100),
  sort: Joi.string().valid('date', 'amount', 'type', 'category', 'created_at').default('date'),
  order: Joi.string().valid('asc', 'desc').default('desc'),
});

module.exports = { createRecordSchema, updateRecordSchema, recordIdParamSchema, listRecordsQuerySchema };
