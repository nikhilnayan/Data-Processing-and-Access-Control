const { errorResponse } = require('../utils/apiResponse');

/**
 * Request validation middleware factory using Joi schemas.
 *
 * @param {Object} schemas - Object with optional `body`, `query`, and `params` Joi schemas.
 * @returns {Function} Express middleware function.
 *
 * @example
 * router.post('/', validate({ body: createRecordSchema }), controller.create);
 * router.get('/', validate({ query: filterSchema }), controller.list);
 */
function validate(schemas) {
  return (req, res, next) => {
    const targets = ['body', 'query', 'params'];

    for (const target of targets) {
      if (schemas[target]) {
        const { error, value } = schemas[target].validate(req[target], {
          abortEarly: false,       // Report all errors, not just the first
          stripUnknown: true,      // Remove unknown fields
          convert: true,           // Auto-convert types (e.g., string → number for query params)
        });

        if (error) {
          const details = error.details.map((d) => ({
            field: d.path.join('.'),
            message: d.message.replace(/"/g, ''),
          }));

          return errorResponse(res, 400, 'Validation failed.', { errors: details });
        }

        // Replace with validated & sanitized values
        req[target] = value;
      }
    }

    next();
  };
}

module.exports = { validate };
