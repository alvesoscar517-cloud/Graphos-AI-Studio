/**
 * Zod Validation Middleware
 * Factory functions for creating Express validation middleware using Zod schemas
 * 
 * @module middleware/zodValidation
 */

const { ZodError } = require('zod');

/**
 * Format Zod errors into structured response
 * @param {ZodError} error - Zod validation error
 * @returns {Object} Formatted error details
 */
function formatZodError(error) {
  const fieldErrors = {};
  const formErrors = [];

  for (const issue of error.issues) {
    const path = issue.path.join('.');
    if (path) {
      if (!fieldErrors[path]) {
        fieldErrors[path] = [];
      }
      fieldErrors[path].push(issue.message);
    } else {
      formErrors.push(issue.message);
    }
  }

  return {
    fieldErrors,
    formErrors
  };
}

/**
 * Create validation middleware for request body
 * @param {import('zod').ZodSchema} schema - Zod schema to validate against
 * @param {Object} options - Middleware options
 * @param {boolean} options.stripUnknown - Remove unknown fields (default: true)
 * @returns {Function} Express middleware
 */
function validate(schema, options = {}) {
  const { stripUnknown = true } = options;

  return (req, res, next) => {
    try {
      const result = schema.safeParse(req.body);
      
      if (!result.success) {
        const details = formatZodError(result.error);
        return res.status(400).json({
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details
        });
      }

      // Replace body with parsed/transformed data
      req.body = result.data;
      req.validated = result.data;
      next();
    } catch (err) {
      next(err);
    }
  };
}

/**
 * Create validation middleware for query parameters
 * @param {import('zod').ZodSchema} schema - Zod schema to validate against
 * @returns {Function} Express middleware
 */
function validateQuery(schema) {
  return (req, res, next) => {
    try {
      const result = schema.safeParse(req.query);
      
      if (!result.success) {
        const details = formatZodError(result.error);
        return res.status(400).json({
          error: 'Invalid query parameters',
          code: 'VALIDATION_ERROR',
          details
        });
      }

      req.query = result.data;
      req.validatedQuery = result.data;
      next();
    } catch (err) {
      next(err);
    }
  };
}

/**
 * Create validation middleware for URL parameters
 * @param {import('zod').ZodSchema} schema - Zod schema to validate against
 * @returns {Function} Express middleware
 */
function validateParams(schema) {
  return (req, res, next) => {
    try {
      const result = schema.safeParse(req.params);
      
      if (!result.success) {
        const details = formatZodError(result.error);
        return res.status(400).json({
          error: 'Invalid URL parameters',
          code: 'VALIDATION_ERROR',
          details
        });
      }

      req.params = result.data;
      req.validatedParams = result.data;
      next();
    } catch (err) {
      next(err);
    }
  };
}

/**
 * Create combined validation middleware for body, query, and params
 * @param {Object} schemas - Object containing schemas for different parts
 * @param {import('zod').ZodSchema} schemas.body - Schema for request body
 * @param {import('zod').ZodSchema} schemas.query - Schema for query parameters
 * @param {import('zod').ZodSchema} schemas.params - Schema for URL parameters
 * @returns {Function} Express middleware
 */
function validateAll(schemas) {
  return (req, res, next) => {
    const errors = {};
    let hasErrors = false;

    if (schemas.body) {
      const result = schemas.body.safeParse(req.body);
      if (!result.success) {
        errors.body = formatZodError(result.error);
        hasErrors = true;
      } else {
        req.body = result.data;
        req.validated = result.data;
      }
    }

    if (schemas.query) {
      const result = schemas.query.safeParse(req.query);
      if (!result.success) {
        errors.query = formatZodError(result.error);
        hasErrors = true;
      } else {
        req.query = result.data;
        req.validatedQuery = result.data;
      }
    }

    if (schemas.params) {
      const result = schemas.params.safeParse(req.params);
      if (!result.success) {
        errors.params = formatZodError(result.error);
        hasErrors = true;
      } else {
        req.params = result.data;
        req.validatedParams = result.data;
      }
    }

    if (hasErrors) {
      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: errors
      });
    }

    next();
  };
}

/**
 * Async validation wrapper for schemas that need async refinements
 * @param {import('zod').ZodSchema} schema - Zod schema to validate against
 * @returns {Function} Express middleware
 */
function validateAsync(schema) {
  return async (req, res, next) => {
    try {
      const result = await schema.safeParseAsync(req.body);
      
      if (!result.success) {
        const details = formatZodError(result.error);
        return res.status(400).json({
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details
        });
      }

      req.body = result.data;
      req.validated = result.data;
      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = {
  validate,
  validateQuery,
  validateParams,
  validateAll,
  validateAsync,
  formatZodError
};
