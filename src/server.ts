import express from "express";
import http from "http";
import * as socketIO from "socket.io";

import config from "./config/config";
import logger from "./utils/logger";
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
      logger.info(`[Event]: User ${socket.id} connected successfully`);

      if (game?.status === GameStatus.WAITING_FOR_SECOND_USER)
        this.io.emit("waiting-for-second-user", game.getGameState());

      socket.on("new-game", () => {
        logger.info("[Event]: new-game");
        game = new SideStackerGame();
        this.io.emit("game-created", game.getGameState());
      });

      // The game already exists when this event is emmited
      socket.on("join-game", () => {
        logger.info("[Event]: join-game");
        const randomColor = game!.getRandomColor();
        const playerIndex = game!.players.findIndex(p => p.id === socket.id);
        const name = playerIndex !== -1 ? `Player ${playerIndex + 1}` : `Player ${game!.players.length + 1}`;
        const player = new Player(socket.id, randomColor, name);
        game!.addPlayer(player);
        if (game!.players.length === 2) game!.start();
        this.io.emit("player-joined", game!.getGameState());
        socket.emit("player-generated", player);
      });

      // The game already exists when this event is emmited
      socket.on("restart-game", () => {
        logger.info("[Event]: restart-game");
        game!.restart();
        this.io.emit("game-restarted", game!.getGameState());
      });

      socket.on("move", (move: IMove) => {
        try {
          logger.info("[Event]: move");
          game?.handleTurn(socket.id, move);
          this.io.emit("player-moved", game?.getGameState());
          if (game?.status === GameStatus.FINISHED) this.io.emit("game-finished", game.getGameState());
        } catch (err: unknown) {
          console.error("[Move Event Error]", err);
          socket.emit("exception", { errorMessage: (err as Error).message });
        }
      });

      socket.on("disconnect", (reason: socketIO.DisconnectReason) => {
        // remove the user from the game
        const playerFound = game?.players.find(player => player.id === socket.id);
        // if the player is in the game
        if (game && playerFound) {
          game.removePlayer(socket.id);
          // if no players left, remove the game instance
          if (game.players.length !== 2) {
            game = null;
            logger.info("Game disconnected due to lack of players");
            socket.broadcast.emit("game-disconnected", { player: playerFound, gameState: game });
          }
        }
        logger.info("[Event]: User disconnected successfully:", reason);
      });
    });
  }

  run(): void {
    this.server.listen(this.port, () => logger.info(`Server running on port ${this.port}`));
  }
}
