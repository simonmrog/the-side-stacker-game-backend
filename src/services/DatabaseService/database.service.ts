import { DataSource } from "typeorm";

import logger from "../../utils/logger";
import config from "../../config/config";
import { Game } from "../../entities/Game";
import { Player } from "../../entities/Player";
import { Move } from "../../entities/Move";
import { IGameState, IMove } from "../GameService/game.interface";
import { IPlayer } from "../../interfaces/player.interface";
class DatabaseService {
  dataSource: DataSource;

  constructor() {
    this.dataSource = new DataSource({
      type: "postgres",
      host: config.POSTGRES_HOST,
      port: config.POSTGRES_PORT,
      username: config.POSTGRES_USER,
      password: config.POSTGRES_PASSWORD,
      database: config.POSTGRES_DB,
      entities: [Game, Player, Move],
      synchronize: true,
    });
  }

  connect() {
    logger.info("Connecting to database...");
    return this.dataSource.initialize();
  }

  async createGame(game: IGameState) {
    const newGame = Game.create({
      id: game.id, // comment this to error handling
      status: game.status,
      board: game.board ? JSON.stringify(game.board) : null,
      current_player: game.currentPlayer,
      winner_socket_id: game.winnerId,
    });

    await newGame.save();
    logger.info("Game saved in database successfully");
  }

  async createPlayer(gameId: string, player: IPlayer) {
    const game = await Game.findOne({ where: { id: gameId } });
    if (!game) throw new Error("[Database Service] Game not found while creating player");

    const newPlayer = Player.create({
      id: player.id,
      name: player.name,
      color: player.color,
      game,
    });

    newPlayer.save();
    logger.info("Player saved in database successfully");
  }

  async createMove(playerId: string, move: IMove) {
    const player = await Player.findOne({ where: { id: playerId } });
    if (!player) throw new Error("Player not found while creating move");

    const newMove = Move.create({
      row: move.row,
      side: move.side,
      player,
    });

    newMove.save();
    logger.info("Move saved in database successfully");
  }

  async updateGame(game: IGameState) {
    const gameInDB = await Game.findOne({ where: { id: game.id } });
    if (!gameInDB) throw new Error("Game not found while updating it");

    const newGameState = {
      ...gameInDB,
      status: game.status,
      board: game.board ? JSON.stringify(game.board) : null,
      current_player: game.currentPlayer,
      winner_socket_id: game.winnerId,
    } as Game;

    Game.save(newGameState);
  }
}

export default new DatabaseService();
