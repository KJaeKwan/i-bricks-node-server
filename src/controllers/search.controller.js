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
  const parsed = searchQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    const err = new Error("Invalid query params");
    err.status = 400;
    err.detail = parsed.error.flatten();
    throw err;
  }

  const { index, q, from, size } = parsed.data;
  assertIndexAllowed(index);

  const body = q
    ? { query: { query_string: { query: q } } }
    : { query: { match_all: {} } };

  const result = await esClient.search({ index, from, size, body });

  res.json(result);
}

function unwrapEsResponse(res) {
  return res?.body ?? res;
}

export async function getAllDocs(req, res, next) {
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
}

export async function getAllDocs2(req, res, next) {
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
}

function parseSort(sortStr) {
  if (!sortStr) return undefined;

  const allowed = new Set(["CRT_DTTM", "SCH_YEAR", "STDNO", "SCAL_SEQ"]);
  const [field, dirRaw] = sortStr.split(":");
  const dir = (dirRaw || "asc").toLowerCase();

  if (!allowed.has(field)) {
    const err = new Error(`Invalid sort field: ${field}`);
    err.status = 400;
    throw err;
  }
  if (dir !== "asc" && dir !== "desc") {
    const err = new Error(`Invalid sort direction: ${dir}`);
    err.status = 400;
    throw err;
  }

  return [{ [field]: dir }];
}

function buildScholarshipFilters({ stdno, year, smt, inpart }) {
  const filters = [];
  if (stdno) filters.push({ term: { STDNO: stdno } });
  if (typeof year === "number") filters.push({ term: { SCH_YEAR: year } });
  if (smt) filters.push({ term: { SMT_RCD: smt } });
  if (inpart) filters.push({ term: { INPART: inpart } });
  return filters;
}

function buildQuery(filters) {
  return filters.length === 0
    ? { match_all: {} }
    : { bool: { filter: filters } };
}

const zQueryBool = z.preprocess((v) => {
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    if (s === "true") return true;
    if (s === "false") return false;
  }
  return v;
}, z.boolean());

export async function getAllDocs3(req, res, next) {
  const querySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    size: z.coerce.number().int().min(1).max(1000).default(50),
    sort: z.string().optional(),

    stdno: z.string().trim().min(1).optional(),
    year: z.coerce.number().int().optional(),
    smt: z.string().trim().min(1).optional(),
    inpart: z.string().trim().min(1).optional(),

    sourceOnly: zQueryBool.default(true),
    includeRaw: zQueryBool.default(false),
  });

  const parsed = querySchema.safeParse(req.query);
  if (!parsed.success) {
    const err = new Error("Invalid query params");
    err.status = 400;
    err.detail = parsed.error.flatten();
    throw err;
  }

  const { page, size, sort, stdno, year, smt, inpart, sourceOnly, includeRaw } =
    parsed.data;

  const from = (page - 1) * size;

  if (from + size > 10000) {
    const err = new Error(
      "Too deep pagination: from+size must be <= 10000 (use search_after later)"
    );
    err.status = 400;
    throw err;
  }

  const filters = buildScholarshipFilters({ stdno, year, smt, inpart });
  const query = buildQuery(filters);
  const esSort = parseSort(sort);

  const raw = unwrapEsResponse(
    await esClient.search({
      index: "scholarship",
      from,
      size,
      sort: esSort,
      body: { query },
    })
  );

  const hits = raw.hits?.hits ?? [];
  const total = raw.hits?.total?.value ?? hits.length;

  const items = sourceOnly ? hits.map((h) => h._source) : hits;

  const response = {
    meta: {
      index: "scholarship",
      page,
      size,
      from,
      sort: sort || null,
      filters: {
        stdno: stdno ?? null,
        year: year ?? null,
        smt: smt ?? null,
        inpart: inpart ?? null,
      },
      total,
      took: raw.took,
    },
    items,
  };

  if (includeRaw) response.raw = raw;

  return res.json(response);
}

export async function getScholarshipStats(req, res, next) {
  const querySchema = z.object({
    stdno: z.string().trim().min(1).optional(),
    year: z.coerce.number().int().optional(),
    topN: z.coerce.number().int().min(1).max(50).default(10),
  });

  const parsed = querySchema.safeParse(req.query);
  if (!parsed.success) {
    const err = new Error("Invalid query params");
    err.status = 400;
    err.detail = parsed.error.flatten();
    throw err;
  }

  const { stdno, year, topN } = parsed.data;

  const filters = buildScholarshipFilters({ stdno, year });
  const query = buildQuery(filters);

  const scalNameField = "SCAL_NM.keyword";

  const raw = unwrapEsResponse(
    await esClient.search({
      index: "scholarship",
      size: 0,
      body: {
        query,
        aggs: {
          by_year: { terms: { field: "SCH_YEAR", size: topN } },
          by_nat: { terms: { field: "NAT", size: topN } },
          by_scal_nm: { terms: { field: scalNameField, size: topN } },
        },
      },
    })
  );

  const aggs = raw.aggregations || {};

  return res.json({
    meta: {
      index: "scholarship",
      filters: {
        stdno: stdno ?? null,
        year: year ?? null,
      },
      topN,
      took: raw.took,
    },
    aggregations: {
      by_year: aggs.by_year?.buckets ?? [],
      by_nat: aggs.by_nat?.buckets ?? [],
      by_scal_nm: aggs.by_scal_nm?.buckets ?? [],
    },
  });
}
