import express from "express";
import {
  search,
  getAllDocs,
  getAllDocs2,
  getAllDocs3,
  getScholarshipStats,
} from "../controllers/search.controller.js";

const router = express.Router();

router.get("/search", search);

router.get("/indices/scholarship", getAllDocs);

router.get("/indices/scholarship/query", getAllDocs2);

router.get("/indices/scholarship/custom-response", getAllDocs3);

router.get("/indices/scholarship/stats", getScholarshipStats);

export default router;
