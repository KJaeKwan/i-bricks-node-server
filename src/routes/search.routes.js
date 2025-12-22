import express from "express";
import {
  search,
  getAllDocs,
  getAllDocs2,
  getAllDocs3,
} from "../controllers/search.controller.js";

const router = express.Router();

router.get("/search", search);

router.get("/indices/scholarship", getAllDocs);

router.get("/indices/scholarship2", getAllDocs2);

router.get("/indices/scholarship3", getAllDocs3);

export default router;
