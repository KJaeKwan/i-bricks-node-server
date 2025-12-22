import express from "express";
import {
  search,
  getAllDocs,
  getAllDocs2,
} from "../controllers/search.controller.js";

const router = express.Router();

router.get("/search", search);

router.get("/indices/scholarship", getAllDocs);

router.get("/indices/scholarship2", getAllDocs2);

export default router;
