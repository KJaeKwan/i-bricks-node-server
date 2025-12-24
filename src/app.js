import express from "express";
import swaggerUi from "swagger-ui-express";
import routes from "./routes/index.js";
import { errorHandler } from "./middlewares/errorHandler.js";

import YAML from "yamljs";
import path from "path";
import { fileURLToPath } from "url";
import { notFound } from "./middlewares/notFound.js";

export function createApp() {
  const app = express();
  app.use(express.json());

  app.use("/api", routes);

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const openapiPath = path.join(__dirname, "swagger", "openapi.yaml");
  const openapiSpec = YAML.load(openapiPath);

  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openapiSpec));

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
