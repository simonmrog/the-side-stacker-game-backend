import express from "express";
import http from "http";
import { Server } from "socket.io";

import router from "./routes";
import SideStackerGame from "./services/sideStacker/sideStacker";

export function initServer(): http.Server {
  const app = express();
  const server = http.createServer(app);

  // Routes
  app.use("/", router);

  // Starts a new game
  const game = new SideStackerGame();
  app.set("game", game);

  // Socket Setup
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const io = new Server(server);

  return server;
}
