import logger from "../utils/logger.js";
import {
  AppError,
  NotFoundError,
  ConflictError,
  BadRequestError,
  ValidationError,
  UnauthorizedError,
} from "../utils/errors.js";

const sendError = (res, err, requestId) => {
  const isDev = process.env.NODE_ENV === "development";

  res.status(err.statusCode || 500).json({
    error: {
      code: err.code || "INTERNAL_ERROR",
      message: err.isOperational
        ? err.message
        : "Something went wrong. Please try again.",
      details: err.details || {},
      requestId,
      ...(isDev && !err.isOperational && { stack: err.stack }),
    },
  });
};

const handleDBError = (err) => {
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    return new ConflictError(`${field} already exists`);
  }
  if (err.name === "CastError")
    return new BadRequestError(`Invalid value for ${err.path}`);
  if (err.name === "ValidationError") {
    const fields = Object.fromEntries(
      Object.entries(err.errors).map(([k, v]) => [k, v.message]),
    );
    return new ValidationError(fields);
  }
  return err;
};

const handleJWTError = (err) => {
  if (err.name === "JsonWebTokenError")
    return new UnauthorizedError("Invalid token. Please log in again.");
  if (err.name === "TokenExpiredError")
    return new UnauthorizedError("Token expired. Please log in again.");
  return err;
};

export const notFoundHandler = (req, res, next) => {
  next(new NotFoundError(`Route ${req.method} ${req.path}`, null));
};

export const globalErrorHandler = (err, req, res, next) => {
  const requestId = req.requestId || req.headers["x-request-id"];

  let error = err;
  if (
    err.code === 11000 ||
    err.name === "CastError" ||
    err.name === "ValidationError"
  )
    error = handleDBError(err);
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError")
    error = handleJWTError(err);

  if (error.isOperational) {
    logger.warn({
      requestId,
      code: error.code,
      status: error.statusCode,
      path: req.path,
      message: error.message,
    });
  } else {
    logger.error({
      requestId,
      path: req.path,
      message: error.message,
      stack: error.stack,
    });
  }

  sendError(res, error, requestId);
};
