import { Router } from "express";

import healthRouter from "./health.routes";
import gameRouter from "./game.routes";

const router = Router();

router.use("/health", healthRouter);
router.use("/api", gameRouter);
router.use("*", function (_req, res) {
  res.status(404).send("(404) Not Found");
});

export default router;
