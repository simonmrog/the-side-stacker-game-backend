import express from "express";
import http from "http";
import * as socketIO from "socket.io";

import config from "./config/config";
import router from "./routes";
import { GameStatus } from "./services/sideStacker/sideStacker.interface";
import SideStackerGame from "./services/sideStacker/sideStacker";

let game: SideStackerGame | null = null;
export default class App {
  private server: http.Server;
  private port: number;
  private io: socketIO.Server;

  constructor(port: number) {
    this.port = port;

    // Server Setup
    const app = express();
    app.use("/", router);
    game = new SideStackerGame();
    app.set("game", game);
    this.server = http.createServer(app);

    // Socket Setup
    this.io = new socketIO.Server(this.server, {
      pingInterval: 2000, // ping the backend every two seconds
      pingTimeout: 5000, // if the backend does not receive a response between 5 seconds disconnects the user
      cors: {
        origin: config.FRONTEND_URL,
      },
    });

    this.io.on("connection", (socket: socketIO.Socket) => {
      console.log(`[Event]: User ${socket.id} connected successfully`);

      if (game?.status === GameStatus.WAITING_FOR_SECOND_USER)
        this.io.emit("waiting-for-second-user", game.gameStatus());

      socket.on("new-game", () => {
        console.log("[Event]: new-game");
        game = new SideStackerGame();
        game.addPlayer(socket.id);
        this.io.emit("game-created", game.gameStatus());
      });

      socket.on("join-game", () => {
        console.log("[Event]: join-game");
        game?.addPlayer(socket.id);
        if (game?.players.length === 2) game?.start();
        this.io.emit("player-joined", game?.gameStatus());
      });

      socket.on("restart-game", () => {
        console.log("[Event]: restart-game");
        game?.restart();
        this.io.emit("game-restarted", game?.gameStatus());
      });

      socket.on("disconnect", (reason: socketIO.DisconnectReason) => {
        // remove the user from the game
        if (game && game.players.includes(socket.id)) game.removePlayer(socket.id);
        // if no players left, remove the game instance
        if (!game?.players.length) {
          game = null;
          console.log("Game disconnected due to lack of players");
        }
        console.log("[Event]: User disconnected successfully:", reason);
      });
    });
  }

  run(): void {
    this.server.listen(this.port, () => console.log(`Server running on port ${this.port}`));
  }
}
