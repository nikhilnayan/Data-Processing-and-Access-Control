const Joi = require('joi');

const updateUserSchema = Joi.object({
  full_name: Joi.string().trim().min(2).max(100).messages({
    'string.min': 'Full name must be at least 2 characters long',
    'string.max': 'Full name must not exceed 100 characters',
  }),
  role: Joi.string().valid('viewer', 'analyst', 'admin').messages({
    'any.only': 'Role must be one of: viewer, analyst, admin',
  }),
  status: Joi.string().valid('active', 'inactive').messages({
    'any.only': 'Status must be one of: active, inactive',
  }),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

const userIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    'number.base': 'User ID must be a number',
    'number.integer': 'User ID must be an integer',
    'number.positive': 'User ID must be positive',
  }),
});

const listUsersQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  role: Joi.string().valid('viewer', 'analyst', 'admin'),
  status: Joi.string().valid('active', 'inactive'),
});

module.exports = { updateUserSchema, userIdParamSchema, listUsersQuerySchema };
