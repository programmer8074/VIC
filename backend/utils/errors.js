export class AppError extends Error {
  constructor(message, statusCode, code, details = {}) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(resource, id) {
    super(`${resource} not found`, 404, "NOT_FOUND", { resource, id });
  }
}

export class ValidationError extends AppError {
  constructor(fields) {
    super("Validation failed", 422, "VALIDATION_ERROR", { fields });
  }
}

export class UnauthorizedError extends AppError {
  constructor(reason = "Authentication required") {
    super(reason, 401, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends AppError {
  constructor(action = "perform this action") {
    super(`You are not allowed to ${action}`, 403, "FORBIDDEN");
  }
}

export class ConflictError extends AppError {
  constructor(message) {
    super(message, 409, "CONFLICT");
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(service) {
    super(`${service} is temporarily unavailable`, 503, "SERVICE_UNAVAILABLE");
  }
}

export class BadRequestError extends AppError {
  constructor(message) {
    super(message, 400, "BAD_REQUEST");
  }
}
