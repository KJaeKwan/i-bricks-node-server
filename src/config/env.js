import dotenv from "dotenv";
dotenv.config();

export const env = {
  PORT: Number(process.env.PORT || 3000),
  ELASTICSEARCH_URL: process.env.ELASTICSEARCH_URL || "http://localhost:9200",
  ALLOWED_INDICES: (process.env.ALLOWED_INDICES || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
};
