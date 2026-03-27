import jwt from "jsonwebtoken";
import { UnauthorizedError, ForbiddenError } from "../utils/errors.js";
import asyncHandler from "../utils/asyncHandler.js";

export const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new UnauthorizedError("No token provided. Please log in.");
  }

  const token = authHeader.split(" ")[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw err; // globalErrorHandler normalizes JWT errors
  }

  req.user = {
    id: decoded.id,
    role: decoded.role,
    lang: decoded.lang,
  };

  next();
});

export const restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      throw new ForbiddenError("access this resource");
    }
    next();
  };
