// Client-safe error handler that works in both browser and server environments
const isServer = typeof window === 'undefined';

// Dynamic logger for server-side only
const getLogger = async () => {
  if (isServer) {
    try {
      const winston = (await import('winston')).default;
      return winston;
    } catch (error) {
      console.error('Failed to import Winston:', error);
      return null;
    }
  }
  return null;
};

// Custom Error Classes
export class ValidationError extends Error {
  constructor(message, field = null) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
    this.field = field;
  }
}

export class AuthenticationError extends Error {
  constructor(message = 'Authentication failed') {
    super(message);
    this.name = 'AuthenticationError';
    this.statusCode = 401;
  }
}

export class AuthorizationError extends Error {
  constructor(message = 'Access denied') {
    super(message);
    this.name = 'AuthorizationError';
    this.statusCode = 403;
  }
}

export class NotFoundError extends Error {
  constructor(message = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}

export class ConflictError extends Error {
  constructor(message = 'Resource already exists') {
    super(message);
    this.name = 'ConflictError';
    this.statusCode = 409;
  }
}

export class RateLimitError extends Error {
  constructor(message = 'Too many requests') {
    super(message);
    this.name = 'RateLimitError';
    this.statusCode = 429;
  }
}

export class DatabaseError extends Error {
  constructor(message = 'Database operation failed') {
    super(message);
    this.name = 'DatabaseError';
    this.statusCode = 500;
  }
}

export class ExternalServiceError extends Error {
  constructor(message = 'External service unavailable', service = null) {
    super(message);
    this.name = 'ExternalServiceError';
    this.statusCode = 502;
    this.service = service;
  }
}

// API Error Handler Middleware
export function apiErrorHandler(err, req, res, next) {
  // Log error on server-side
  if (isServer) {
    getLogger().then(winston => {
      if (winston) {
        winston.error('API Error:', {
          error: err.message,
          stack: err.stack,
          url: req.url,
          method: req.method,
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          timestamp: new Date().toISOString()
        });
      } else {
        console.error('API Error:', err);
      }
    });
  }

  // Don't expose internal errors in production
  const isProduction = process.env.NODE_ENV === 'production';
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = isProduction ? 'Invalid input data' : err.message;
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  } else if (err.code === 11000) {
    statusCode = 409;
    message = 'Duplicate entry';
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  } else if (statusCode === 500 && isProduction) {
    message = 'Internal server error';
  }

  const errorResponse = {
    success: false,
    error: message,
    timestamp: new Date().toISOString()
  };

  // Add additional info in development
  if (!isProduction) {
    errorResponse.stack = err.stack;
    errorResponse.details = {
      name: err.name,
      field: err.field,
      service: err.service
    };
  }

  res.status(statusCode).json(errorResponse);
}

// Async error wrapper
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Global error handler
export function globalErrorHandler(error, context = {}) {
  const errorInfo = {
    message: error.message,
    stack: error.stack,
    name: error.name,
    timestamp: new Date().toISOString(),
    context
  };

  if (isServer) {
    getLogger().then(winston => {
      if (winston) {
        winston.error('Application Error:', errorInfo);
      } else {
        console.error('Application Error:', errorInfo);
      }
    });
  } else {
    console.error('Application Error:', errorInfo);
  }

  return errorInfo;
}

// Process event handlers (server-side only)
if (isServer) {
  process.on('SIGTERM', async () => {
    const winston = await getLogger();
    if (winston) {
      winston.info('SIGTERM received. Shutting down gracefully...');
    }
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    const winston = await getLogger();
    if (winston) {
      winston.info('SIGINT received. Shutting down gracefully...');
    }
    process.exit(0);
  });

  process.on('unhandledRejection', async (reason, promise) => {
    const winston = await getLogger();
    if (winston) {
      winston.error('Unhandled Rejection at:', promise, 'reason:', reason);
    } else {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    }
  });

  process.on('uncaughtException', async (error) => {
    const winston = await getLogger();
    if (winston) {
      winston.error('Uncaught Exception:', error);
    } else {
      console.error('Uncaught Exception:', error);
    }
    process.exit(1);
  });
}

// Validation helpers
export function validateRequired(value, fieldName) {
  if (value === undefined || value === null || value === '') {
    throw new ValidationError(`${fieldName} is required`, fieldName);
  }
}

export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError('Invalid email format', 'email');
  }
}

export function validateLength(value, min, max, fieldName) {
  if (value.length < min || value.length > max) {
    throw new ValidationError(
      `${fieldName} must be between ${min} and ${max} characters`,
      fieldName
    );
  }
}

export function validateRange(value, min, max, fieldName) {
  if (value < min || value > max) {
    throw new ValidationError(
      `${fieldName} must be between ${min} and ${max}`,
      fieldName
    );
  }
}

// HTTP status helpers
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503
};

export default {
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  DatabaseError,
  ExternalServiceError,
  apiErrorHandler,
  asyncHandler,
  globalErrorHandler,
  validateRequired,
  validateEmail,
  validateLength,
  validateRange,
  HTTP_STATUS
}; 