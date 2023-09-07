import { Server as HTTPServer } from "http";
import * as socketIO from "socket.io";

import logger from "../../utils/logger";
import { Player } from "../../models/player.interface";
import { ISocketService } from "./socket.interface";
import { GameStatus, IMove } from "../GameService/game.interface";
import GameService from "../GameService/game.service";

export default class SocketService implements ISocketService {
  public io: socketIO.Server;
  public game: GameService | null;

  constructor(server: HTTPServer) {
    this.game = null;
    this.io = new socketIO.Server(server, {
      pingInterval: 2000, // ping the backend every two seconds
      pingTimeout: 5000, // if the backend does not receive a response between 5 seconds disconnects the user
      cors: {
        origin: "*",
      },
    });
    logger.info("Socket connection established");
  }

  onNewGameEvent(): void {
    logger.info("[Event]: new-game");
    this.game = new GameService();
    this.io.emit("game-created", this.game.getGameState());
  }

  onJoinGameEvent(playerId: string): Player | null {
    logger.info("[Event]: join-game");
    if (!this.game) return null;
    const randomColor = this.game.getRandomColor();
    const playerIndex = this.game.players.findIndex(p => p.id === playerId);
    const name = playerIndex !== -1 ? `Player ${playerIndex + 1}` : `Player ${this.game.players.length + 1}`;
    const player = new Player(playerId, randomColor, name);
    this.game.addPlayer(player);
    if (this.game.players.length === 2) this.game.start();
    this.io.emit("player-joined", this.game.getGameState());
    return player;
  }

  onRestartGameEvent(): void {
    logger.info("[Event]: restart-game");
    if (!this.game) return;
    this.game.restart();
    this.io.emit("game-restarted", this.game.getGameState());
  }

  onMoveEvent(playerId: string, move: IMove): void {
    logger.info("[Event]: move");
    if (!this.game) return;
    this.game.handleTurn(playerId, move);
    this.io.emit("player-moved", this.game.getGameState());
    if (this.game?.status === GameStatus.FINISHED) this.io.emit("game-finished", this.game.getGameState());
  }

  onDisconnectEvent(playerId: string) {
    const playerFound = this.game?.players.find(player => player.id === playerId);
    if (this.game && playerFound) this.game.removePlayer(playerId);
  }

  run() {
    this.io.on("connection", (socket: socketIO.Socket) => {
      logger.info(`[Event]: User ${socket.id} connected successfully; ${this.io.engine.clientsCount} connected`);

      // Update the state in the frontend when there is only one player in the game
      if (this.game?.status === GameStatus.WAITING_FOR_SECOND_USER)
        this.io.emit("waiting-for-second-user", this.game.getGameState());
      else if (this.game?.status === GameStatus.STARTED || this.game?.status === GameStatus.FINISHED)
        this.io.emit("game-busy");

      // Event triggered when the player presses the "new game" button
      socket.on("new-game", this.onNewGameEvent.bind(this));

      // Event triggered when the player presses the "join game" button
      socket.on("join-game", () => {
        const player = this.onJoinGameEvent.call(this, socket.id);
        socket.emit("player-generated", player);
      });

      // Event triggered when the player presses the restart button
      socket.on("restart-game", this.onRestartGameEvent.bind(this));

      // Event triggered when the player presses the right or left button
      socket.on("move", (move: IMove) => {
        try {
          this.onMoveEvent(socket.id, move);
        } catch (err: unknown) {
          console.error("[Move Event Error]", err);
          socket.emit("exception", { errorMessage: (err as Error).message });
        }
      });

      // Event triggered when a player disconnects from the frontend
      socket.on("disconnect", (reason: socketIO.DisconnectReason) => {
        const playerFound = this.game?.players.find(player => player.id === socket.id);
        if (playerFound) {
          // if the player is in the game then remove it
          this.onDisconnectEvent.call(this, playerFound.id);
          if (this.game?.players.length !== 2) {
            // if a player disconnected from the game (and not from the socket coonection
            // then, remove the game instance
            this.game = null;
            logger.info("Game disconnected due to lack of players");
            socket.broadcast.emit("game-disconnected", { player: socket.id, gameState: null });
          }
        }
        logger.info("[Event]: User disconnected successfully:", reason);
      });
    });
  }
}
