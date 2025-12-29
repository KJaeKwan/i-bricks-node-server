import express from "express";
import { z } from "zod";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { validateQuery } from "../middlewares/validateQuery.js";

import {
  search,
  getAllDocs,
  getAllDocs2,
  getAllDocs3,
  getScholarshipStats,
  getScholarshipStatsByStdno,
} from "../controllers/search.controller.js";

const router = express.Router();

const searchQuerySchema = z.object({
  index: z.string().min(1),
  q: z.string().optional(),
  from: z.coerce.number().int().min(0).default(0),
  size: z.coerce.number().int().min(1).max(100).default(10),
});

router.get("/search", validateQuery(searchQuerySchema), asyncHandler(search));
router.get("/indices/scholarship", asyncHandler(getAllDocs));
router.get("/indices/scholarship/query", asyncHandler(getAllDocs2));
router.get("/indices/scholarship/custom-response", asyncHandler(getAllDocs3));
router.get("/indices/scholarship/stats", asyncHandler(getScholarshipStats));
router.get(
  "/indices/scholarship/stats/:stdno",
  asyncHandler(getScholarshipStatsByStdno)
);

export default router;
