'use strict';

/**
 * @class AppError
 * @classdesc A custom error class for application-specific errors, extending the built-in Error.
 * This class is designed for operational errors (e.g., validation failures, not-found resources)
 * that can be handled gracefully in production, as opposed to programmer errors (e.g., bugs).
 *
 * @extends Error
 */
class AppError extends Error {
  /**
   * Creates a new AppError instance.
   *
   * @param {string} [message='An error occurred'] - The error message.
   * @param {number} [statusCode=500] - The HTTP status code associated with the error (e.g., 400 for bad request, 500 for internal server error).
   * @param {Object} [options={}] - Additional options.
   * @param {Error} [options.cause] - The underlying cause of the error (for error chaining).
   * @param {any} [options.data] - Additional data to attach to the error (e.g., validation details).
   * @param {string} [options.code] - A custom error code for easier identification (e.g., 'VALIDATION_ERROR').
   */
  constructor(message = 'An error occurred', statusCode = 500, options = {}) {
    super(message, { cause: options.cause });

    // Validate inputs
    if (typeof message !== 'string') {
      throw new TypeError('Message must be a string');
    }
    if (typeof statusCode !== 'number' || !Number.isInteger(statusCode) || statusCode < 100 || statusCode >= 600) {
      throw new TypeError('Status code must be an integer between 100 and 599');
    }

    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.code = options.code || 'GENERIC_ERROR';
    this.data = options.data || null;

    // Capture stack trace, excluding constructor invocation
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Serializes the error to a JSON-friendly object, suitable for API responses.
   * In production, sensitive details like stack traces are omitted.
   *
   * @param {boolean} [isProduction=true] - Whether the environment is production.
   * @returns {Object} - A serialized representation of the error.
   */
  toJSON(isProduction = process.env.NODE_ENV === 'production') {
    const serialized = {
      status: this.status,
      message: this.message,
      code: this.code,
    };

    if (this.data) {
      serialized.data = this.data;
    }

    if (!isProduction) {
      serialized.stack = this.stack;
      if (this.cause) {
        serialized.cause = this.cause instanceof Error ? this.cause.toJSON(isProduction) : this.cause;
      }
    }

    return serialized;
  }

  /**
   * Creates an AppError for bad requests (HTTP 400).
   *
   * @static
   * @param {string} message - The error message.
   * @param {Object} [options={}] - Additional options (see constructor).
   * @returns {AppError} - A new AppError instance.
   */
  static badRequest(message, options = {}) {
    return new AppError(message, 400, options);
  }

  /**
   * Creates an AppError for unauthorized access (HTTP 401).
   *
   * @static
   * @param {string} message - The error message.
   * @param {Object} [options={}] - Additional options (see constructor).
   * @returns {AppError} - A new AppError instance.
   */
  static unauthorized(message, options = {}) {
    return new AppError(message, 401, options);
  }

  /**
   * Creates an AppError for not found resources (HTTP 404).
   *
   * @static
   * @param {string} message - The error message.
   * @param {Object} [options={}] - Additional options (see constructor).
   * @returns {AppError} - A new AppError instance.
   */
  static notFound(message, options = {}) {
    return new AppError(message, 404, options);
  }

  /**
   * Creates an AppError for internal server errors (HTTP 500).
   *
   * @static
   * @param {string} message - The error message.
   * @param {Object} [options={}] - Additional options (see constructor).
   * @returns {AppError} - A new AppError instance.
   */
  static internalServerError(message, options = {}) {
    return new AppError(message, 500, options);
  }
  
}

module.exports = AppError;