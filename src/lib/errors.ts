/**
 * Custom error classes for better error handling
 */

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public fields?: Record<string, string>) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'You do not have permission to perform this action') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT_ERROR');
  }
}

export class RateLimitError extends AppError {
  constructor(
    message: string = 'Too many requests',
    public retryAfter?: number
  ) {
    super(message, 429, 'RATE_LIMIT_ERROR');
  }
}

export class FileUploadError extends AppError {
  constructor(message: string) {
    super(message, 400, 'FILE_UPLOAD_ERROR');
  }
}

export class ExternalServiceError extends AppError {
  constructor(message: string, public service?: string) {
    super(message, 502, 'EXTERNAL_SERVICE_ERROR');
  }
}

/**
 * Checks if an error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Formats an error for API response
 */
export function formatErrorResponse(error: unknown) {
  if (isAppError(error)) {
    return {
      success: false,
      error: error.code || 'ERROR',
      message: error.message,
      statusCode: error.statusCode,
      ...(error instanceof ValidationError && { fields: error.fields }),
      ...(error instanceof RateLimitError && error.retryAfter && { retryAfter: error.retryAfter }),
    };
  }

  // Unknown error
  console.error('Unexpected error:', error);
  return {
    success: false,
    error: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred',
    statusCode: 500,
  };
}
