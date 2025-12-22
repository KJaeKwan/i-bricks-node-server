import express from "express";
import { search, getAllDocs } from "../controllers/search.controller.js";

const router = express.Router();

/**
 * @openapi
 * /api/v1/search:
 *   get:
 *     summary: Elasticsearch search 결과 반환 API
 *     description: index와 q를 받아 Elasticsearch 조회 결과를 그대로 반환합니다.
 *     parameters:
 *       - in: query
 *         name: index
 *         required: true
 *         schema: { type: string }
 *         example: scholarship
 *       - in: query
 *         name: q
 *         required: false
 *         schema: { type: string }
 *         example: "STDNO:202010766"
 *       - in: query
 *         name: from
 *         required: false
 *         schema: { type: integer, default: 0 }
 *       - in: query
 *         name: size
 *         required: false
 *         schema: { type: integer, default: 10, maximum: 100 }
 *     responses:
 *       200:
 *         description: ES 응답 원문
 */
router.get("/search", search);

/**
 * @openapi
 * /api/v1/indices/scholarship:
 *   get:
 *     summary: scholarship 인덱스 문서 조회
 *     description: scholarship 인덱스에서 match_all로 조회한 결과를 그대로 반환합니다.
 *     parameters:
 *       - in: query
 *         name: size
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1000
 *           minimum: 1
 *           maximum: 10000
 *         description: 가져올 문서 개수 (최대 10000)
 *     responses:
 *       200:
 *         description: Elasticsearch search 응답 원문
 */
router.get("/indices/scholarship", getAllDocs);

export default router;
