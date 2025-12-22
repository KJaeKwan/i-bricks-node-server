import { z } from "zod";
import { esClient } from "../config/esClient.js";
import { env } from "../config/env.js";

const searchQuerySchema = z.object({
  index: z.string().min(1),
  q: z.string().optional(),
  from: z.coerce.number().int().min(0).default(0),
  size: z.coerce.number().int().min(1).max(100).default(10),
});

function assertIndexAllowed(index) {
  // ALLOWED_INDICES를 비워두면(미설정) 전체 허용(개발용)
  if (env.ALLOWED_INDICES.length === 0) return;
  if (!env.ALLOWED_INDICES.includes(index)) {
    const err = new Error(`Index not allowed: ${index}`);
    err.status = 403;
    throw err;
  }
}

export async function search(req, res, next) {
  try {
    const parsed = searchQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      const err = new Error("Invalid query params");
      err.status = 400;
      err.detail = parsed.error.flatten();
      throw err;
    }

    const { index, q, from, size } = parsed.data;
    assertIndexAllowed(index);

    // q가 있으면 query_string, 없으면 match_all
    const body = q
      ? { query: { query_string: { query: q } } }
      : { query: { match_all: {} } };

    const result = await esClient.search({
      index,
      from,
      size,
      body,
    });

    // ES 결과를 "그대로" 내보내기 (요구사항)
    res.json(result);
  } catch (e) {
    next(e);
  }
}

function unwrapEsResponse(res) {
  return res?.body ?? res;
}

export async function getAllDocs(req, res, next) {
  try {
    const querySchema = z.object({
      size: z.coerce.number().int().min(1).max(10000).default(1000),
    });

    const q = querySchema.safeParse(req.query);
    if (!q.success) {
      const err = new Error("Invalid query params");
      err.status = 400;
      err.detail = q.error.flatten();
      throw err;
    }

    const { size } = q.data;

    const result = unwrapEsResponse(
      await esClient.search({
        index: "scholarship",
        size,
        body: { query: { match_all: {} } },
      })
    );

    return res.json(result);
  } catch (e) {
    next(e);
  }
}

export async function getAllDocs2(req, res, next) {
  try {
    const querySchema = z.object({
      size: z.coerce.number().int().min(1).max(10000).default(1000),

      stdno: z.string().trim().min(1).optional(),
      year: z.coerce.number().int().optional(),
      smt: z.string().trim().min(1).optional(),
      inpart: z.string().trim().min(1).optional(),
    });

    const parsed = querySchema.safeParse(req.query);
    if (!parsed.success) {
      const err = new Error("Invalid query params");
      err.status = 400;
      err.detail = parsed.error.flatten();
      throw err;
    }

    const { size, stdno, year, smt, inpart } = parsed.data;

    const filters = [];
    if (stdno) filters.push({ term: { STDNO: stdno } });
    if (typeof year === "number") filters.push({ term: { SCH_YEAR: year } });
    if (smt) filters.push({ term: { SMT_RCD: smt } });
    if (inpart) filters.push({ term: { INPART: inpart } });

    const esQuery =
      filters.length === 0 ? { match_all: {} } : { bool: { filter: filters } };

    const result = unwrapEsResponse(
      await esClient.search({
        index: "scholarship",
        size,
        body: { query: esQuery },
      })
    );

    return res.json(result);
  } catch (e) {
    next(e);
  }
}
