import { notFoundError } from "../errors/AppError.js";

export function notFound(req, res, next) {
  next(notFoundError(`Route not found: ${req.method} ${req.originalUrl}`));
}
