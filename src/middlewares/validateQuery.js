import { badRequest } from "../errors/AppError.js";

export const validateQuery = (schema) => (req, res, next) => {
  const parsed = schema.safeParse(req.query);

  if (!parsed.success) {
    return next(badRequest("Invalid query params", parsed.error.flatten()));
  }

  req.query = parsed.data;

  return next();
};
