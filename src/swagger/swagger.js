import swaggerJSDoc from "swagger-jsdoc";

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "ES Proxy API",
      version: "1.0.0",
      description: "Elasticsearch 조회 결과를 그대로 반환하는 간단 API",
    },
    servers: [{ url: "http://localhost:3000" }],
  },
  apis: ["./src/routes/*.js"],
});
