import { Request, Response } from "express";

import config from "../config/config";

class HealthController {
  check(_req: Request, res: Response) {
    res.status(200).json({
      status: "ok",
      environment: config.ENV,
    });
  }
}

export default new HealthController();
