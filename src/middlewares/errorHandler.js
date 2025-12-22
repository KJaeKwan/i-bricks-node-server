export function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || "Internal Server Error",
    // 개발 중에는 원인 파악용
    detail: err.detail,
  });
}
