import { Router } from "express";

import gameController from "../controllers/game.controller";

const router = Router();

router.get("/move", gameController.move);

export default router;
