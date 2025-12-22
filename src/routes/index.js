import express from "express";
import searchRoutes from "./search.routes.js";

const router = express.Router();

router.get("/health", (req, res) => res.json({ ok: true }));
router.use("/v1", searchRoutes);

export default router;
