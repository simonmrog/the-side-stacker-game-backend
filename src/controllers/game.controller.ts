import { Request, Response } from "express";

class GameController {
  move(_req: Request, res: Response) {
    res.status(200).send("good");
  }
}

export default new GameController();
