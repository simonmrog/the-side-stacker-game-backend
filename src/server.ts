import express from "express";
import http from "http";
import * as socketIO from "socket.io";

import config from "./config/config";
import router from "./routes";
import { Player } from "./models/player";
import { GameStatus, IMove } from "./services/sideStacker/sideStacker.interface";
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
        this.io.emit("game-created", game.gameStatus());
      });

      // The game already exists when this event is emmited
      socket.on("join-game", () => {
        console.log("[Event]: join-game");
        const randomColor = game!.getRandomColor();
        const player = new Player(socket.id, randomColor);
        game!.addPlayer(player);
        if (game!.players.length === 2) game!.start();
        this.io.emit("player-joined", game!.gameStatus());
        socket.emit("player-generated", player);
      });

      // The game already exists when this event is emmited
      socket.on("restart-game", () => {
        console.log("[Event]: restart-game");
        game!.restart();
        this.io.emit("game-restarted", game!.gameStatus());
      });

      socket.on("move", (move: IMove) => {
        try {
          console.log("[Event]: move");
          game?.handleTurn(socket.id, move);
          this.io.emit("player-moved", game?.gameStatus());
          if (game?.status === GameStatus.FINISHED) this.io.emit("game-finished", game.gameStatus());
        } catch (err: unknown) {
          console.error("[Move Event Error]", err);
          socket.emit("exception", { errorMessage: (err as Error).message });
        }
      });

      socket.on("disconnect", (reason: socketIO.DisconnectReason) => {
        // remove the user from the game
        const playerFound = game?.players.find(player => player.id === socket.id);
        // if the player is in the game
        if (playerFound) {
          game?.removePlayer(socket.id);
          // if no players left, remove the game instance
          if (game?.players.length !== 2) {
            game = null;
            console.log("Game disconnected due to lack of players");
            socket.broadcast.emit("game-disconnected", { player: playerFound, game });
          }
        }
        console.log("[Event]: User disconnected successfully:", reason);
      });
    });
  }

  run(): void {
    this.server.listen(this.port, () => console.log(`Server running on port ${this.port}`));
  }
}
