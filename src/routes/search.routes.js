import express from "express";
import { search, getAllDocs } from "../controllers/search.controller.js";

const router = express.Router();

router.get("/search", search);

router.get("/indices/scholarship", getAllDocs);

export default router;
