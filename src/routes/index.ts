import { Router } from "express";

import healthRouter from "./health.routes";

const router = Router();

router.use("/health", healthRouter);
router.use("*", function (_req, res) {
  res.status(404).send("(404) Not Found");
});

export default router;
