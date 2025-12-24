export function errorHandler(err, req, res, next) {
  const status = err.status || 500;

  // 개발/운영 환경이 분리되어 있다고 가정
  const isProd = process.env.NODE_ENV == "production";

  // 개발 환경에서는 서버 콘솔에 에러 출력
  if (!isProd) {
    status,
      console.error("[ERROR]", {
        message: err.message,
        detail: err.detail,
        path: err.originalUrl,
        stack: err.stack,
      });
  }

  res.status(status).json({
    success: false,
    error: {
      code:
        err.code || (status === 400 ? "BAD_REQUEST" : "INTERNAL_SERVER_ERROR"),
      message: err.message || "Internal Server Error",
      detail: err.detail,
      path: req.originalUrl,
    },
  });
}
