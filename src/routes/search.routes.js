import express from "express";
import { asyncHandler } from "../middlewares/asyncHandler.js";

import {
  search,
  getAllDocs,
  getAllDocs2,
  getAllDocs3,
  getScholarshipStats,
} from "../controllers/search.controller.js";

const router = express.Router();

router.get("/search", asyncHandler(search));
router.get("/indices/scholarship", asyncHandler(getAllDocs));
router.get("/indices/scholarship/query", asyncHandler(getAllDocs2));
router.get("/indices/scholarship/custom-response", asyncHandler(getAllDocs3));
router.get("/indices/scholarship/stats", asyncHandler(getScholarshipStats));

export default router;
