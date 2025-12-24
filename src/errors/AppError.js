export class AppError extends Error {
  constructor(
    message,
    { status = 500, code = "INTERNAL_ERROR", detail = null } = {}
  ) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
    this.detail = detail;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const badRequest = (message, detail) =>
  new AppError(message, { status: 400, code: "BAD_REQUEST", detail });

export const forbidden = (message, detail) =>
  new AppError(message, { status: 403, code: "FORBIDDEN", detail });

export const notFoundError = (message, detail) =>
  new AppError(message, { status: 404, code: "NOT_FOUND", detail });
