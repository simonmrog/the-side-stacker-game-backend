import { promises as fs } from "fs";
import path from "path";

import { errorCatalog } from "../../../src/config/errorCatalog";
import { GameStatus, IMove } from "../../../src/services/GameService/game.interface";
import GameService from "../../../src/services/GameService/game.service";

describe("GameService service tests", () => {
  let game: GameService;
  const casesDir = path.join(__dirname, "/useCases");

  beforeEach(() => {
    game = new GameService();
  });

  test("getRandomColor function should return a hsla color", () => {
    const color = game.getRandomColor();
    expect(color.includes("hsla")).toBe(true);
  });

  test("getRandomTurn function should return null when there are no players in the game", () => {
    const turn = game.getRandomTurn();
    expect(turn).toBe(null);
  });

  test("getRandomTurn function should return either 0 or 1 when there are players in the game", () => {
    game.players = [
      {
        id: "some-id-1",
        color: "some-color",
        name: "some-name",
      },
      {
        id: "some-id-2",
        color: "some-color",
        name: "some-name",
      },
    ];

    const turn = game.getRandomTurn();

    expect(turn === "some-id-1" || turn === "some-id-2").toBe(true);
  });

  test("start function should change the status of the game", () => {
    game.start();

    const gameState = game.getGameState();
    expect(gameState.status).toBe(GameStatus.STARTED);
  });

  test("restart function should change the status of the game", () => {
    game.restart();

    const gameState = game.getGameState();
    expect(gameState.status).toBe(GameStatus.STARTED);
  });

  test("endGame function should change the status of the game", () => {
    game.endGame("some-winner-id");

    const gameState = game.getGameState();
    expect(gameState.status).toBe(GameStatus.FINISHED);
  });

  test("addPlayer function should add a player to the game", () => {
    const player = { id: "some-id", color: "some-color", name: "some-name" };

    game.addPlayer(player);

    expect(game.players.length).toEqual(1);
    expect(game.players[0]).toStrictEqual(player);
  });

  test("addPlayer function should change the game status to 'waiting-for-second-user'", () => {
    const player = { id: "some-id", color: "some-color", name: "some-name" };

    game.addPlayer(player);

    const gameState = game.getGameState();
    expect(gameState.status).toBe(GameStatus.WAITING_FOR_SECOND_USER);
  });

  test("removePlayer function should remove the player from the game", () => {
    const playerToRemove = { id: "some-id-1", color: "some-color-1", name: "some-name-1" };
    game.players = [playerToRemove, { id: "some-id-2", color: "some-color-2", name: "some-name-2" }];

    game.removePlayer(playerToRemove.id);

    expect(game.players.length).toEqual(1);
    expect(game.players.find(p => p.id === playerToRemove.id)).toBeUndefined();
  });

  test("removePlayer function should change the game status to 'waiting-for-second-user'", () => {
    const playerToRemove = { id: "some-id-1", color: "some-color-1", name: "some-name-1" };
    game.players = [playerToRemove, { id: "some-id-2", color: "some-color-2", name: "some-name-2" }];

    game.removePlayer(playerToRemove.id);

    const gameState = game.getGameState();
    expect(gameState.status).toBe(GameStatus.WAITING_FOR_SECOND_USER);
  });

  test("fullRow function should return false when a row does have null values", () => {
    const somePlayer = { id: "some-id-1", color: "some-color-1", name: "some-name-1" };
    game.board = [[null, somePlayer, null]];

    const isFull = game.fullRow(0);

    expect(isFull).toBe(false);
  });

  test("fullRow function should return true when a row does not have any null values", () => {
    game.board = [
      [
        { id: "some-id-1", color: "some-color-1", name: "some-name-1" },
        { id: "some-id-2", color: "some-color-2", name: "some-name-2" },
        { id: "some-id-3", color: "some-color-3", name: "some-name-3" },
      ],
    ];

    const isFull = game.fullRow(0);

    expect(isFull).toBe(true);
  });

  test("stackPiece function should right-place a player in the board", () => {
    const player = { id: "some-id-1", color: "some-color-1", name: "some-name-1" };
    const move: IMove = { row: 2, side: "right" };

    game.stackPiece(player, move);

    expect(game.board[2][6]).toStrictEqual(player);
  });

  test("stackPiece function should left-place a player in the board", () => {
    const player = { id: "some-id-1", color: "some-color-1", name: "some-name-1" };
    const move = { row: 4, side: "left" };

    game.stackPiece(player, move as IMove);

    expect(game.board[4][0]).toStrictEqual(player);
  });

  test("toggleTurn function should toggle the game", () => {
    game.players = [
      { id: "some-id-1", color: "some-color-1", name: "some-name-1" },
      { id: "some-id-2", color: "some-color-2", name: "some-name-2" },
    ];
    game.start();
    const gameState = game.getGameState();
    const currentPlayer = gameState.currentPlayer;
    const expectedTurn = currentPlayer === "some-id-1" ? "some-id-2" : "some-id-1";

    game.toggleTurn();

    const newState = game.getGameState();
    expect(newState.currentPlayer).toBe(expectedTurn);
  });

  test("toggleTurn function should throw an error when there are not enough players in the game", () => {
    try {
      const player1 = { id: "some-id-1", color: "some-color-1", name: "some-name-1" };
      const player2 = { id: "some-id-2", color: "some-color-2", name: "some-name-2" };
      game.addPlayer(player1);
      game.addPlayer(player2);
      game.start();
      // removing at purpose one of the players to cause the exception
      game.players = [player1];

      game.toggleTurn();
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(Error);
      // the random condition the turns leads to two error scenarios:
      // 1) the current player is not in the game => PLAYER_NOT_FOUND
      // 2) the next player is not in the game => NOT_ENOUGH_PLAYERS
      // this condition won't happend in the flow of the game though
      const condition =
        (err as Error).message === errorCatalog.INVALID_PLAYER.PLAYER_NOT_FOUND ||
        (err as Error).message === errorCatalog.INVALID_GAME.NOT_ENOUGH_PLAYERS;
      expect(condition).toBe(true);
    }
  });

  test("handleTurn should not do anything if the player does not exist", () => {
    const playerId = "some-id";
    const move: IMove = { row: 2, side: "right" };
    const spy = jest.spyOn(game, "stackPiece");

    game.handleTurn(playerId, move);

    expect(spy).not.toBeCalled();
  });

  test("handleTurn should throw an error when the row is full", () => {
    try {
      const somePlayer = { id: "some-id-1", color: "some-color-1", name: "some-name-1" };
      const move: IMove = { row: 0, side: "left" };
      game.addPlayer(somePlayer);
      game.start();
      game.board = [[somePlayer, somePlayer, somePlayer]];

      game.handleTurn(somePlayer.id, move);
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(Error);
      expect((err as Error).message).toBe(errorCatalog.INVALID_MOVE.FULL_ROW);
    }
  });

  test("handleTurn should call checkForWin and checkForDraw functions when the game is not over", () => {
    const player1 = { id: "some-id-1", color: "some-color-1", name: "some-name-1" };
    const player2 = { id: "some-id-2", color: "some-color-2", name: "some-name-2" };
    const move: IMove = { row: 0, side: "left" };
    const winSpy = jest.spyOn(game, "checkForWin");
    const drawSpy = jest.spyOn(game, "checkForDraw");
    game.addPlayer(player1);
    game.addPlayer(player2);
    game.start();

    game.handleTurn(player1.id, move);

    expect(winSpy).toBeCalled();
    expect(drawSpy).toBeCalled();
  });

  test("handleTurn should call the endGame function when the player wins the game", async () => {
    const boardData = await fs.readFile(`${casesDir}/winAfterTurn.json`, "utf-8");
    const win = JSON.parse(boardData);
    const player1 = { id: "some-id-1", color: "some-color-1", name: "some-name-1" };
    const player2 = { id: "some-id-2", color: "some-color-2", name: "some-name-2" };
    const move: IMove = { row: 0, side: "left" };
    const endSpy = jest.spyOn(game, "endGame");
    const drawSpy = jest.spyOn(game, "checkForDraw");
    game.addPlayer(player1);
    game.addPlayer(player2);
    game.start();
    game.board = win;

    game.handleTurn(player1.id, move);

    expect(endSpy).toBeCalled();
    expect(drawSpy).not.toBeCalled();
  });

  test("handleTurn should call the endGame function when the game is a draw after a move", async () => {
    const boardData = await fs.readFile(`${casesDir}/drawAfterTurn.json`, "utf-8");
    const win = JSON.parse(boardData);
    const player1 = { id: "some-id-1", color: "some-color-1", name: "some-name-1" };
    const player2 = { id: "some-id-2", color: "some-color-2", name: "some-name-2" };
    const move: IMove = { row: 0, side: "left" };
    const drawSpy = jest.spyOn(game, "checkForDraw");
    const endSpy = jest.spyOn(game, "endGame");
    game.addPlayer(player1);
    game.addPlayer(player2);
    game.start();
    game.board = win;

    game.handleTurn(player1.id, move);

    expect(drawSpy).toBeCalled();
    expect(endSpy).toBeCalled();
  });

  test("handleTurn should call toggleTurn when everything goes well", () => {
    const player1 = { id: "some-id-1", color: "some-color-1", name: "some-name-1" };
    const player2 = { id: "some-id-2", color: "some-color-2", name: "some-name-2" };

    const move: IMove = { row: 0, side: "left" };
    const spy = jest.spyOn(game, "toggleTurn");
    game.addPlayer(player1);
    game.addPlayer(player2);
    game.start();

    game.handleTurn(player1.id, move);

    expect(spy).toBeCalled();
  });

  test("checkForWin should return true when there is a horizontal win", async () => {
    const playerId = "some-id-1";
    const row = 0;
    const column = 1;
    const winData = await fs.readFile(`${casesDir}/horizontalWin.json`, "utf-8");
    const win = JSON.parse(winData);
    game.board = win;

    const result = game.checkForWin(playerId, row, column);

    expect(result).toBe(true);
  });

  test("checkForWin should return true when there is a vertical win", async () => {
    const playerId = "some-id-1";
    const row = 1;
    const column = 0;
    const winData = await fs.readFile(`${casesDir}/verticalWin.json`, "utf-8");
    const win = JSON.parse(winData);
    game.board = win;

    const result = game.checkForWin(playerId, row, column);

    expect(result).toBe(true);
  });

  test("checkForWin should return true when there is a diagonal win", async () => {
    const playerId = "some-id-1";
    const row = 2;
    const column = 2;
    const winData = await fs.readFile(`${casesDir}/diagonalWin.json`, "utf-8");
    const win = JSON.parse(winData);
    game.board = win;

    const result = game.checkForWin(playerId, row, column);

    expect(result).toBe(true);
  });

  test("checkForWin should return false when there is no win", async () => {
    const playerId = "some-id-1";
    const row = 2;
    const column = 1;
    const winData = await fs.readFile(`${casesDir}/noWin.json`, "utf-8");
    const win = JSON.parse(winData);
    game.board = win;

    const result = game.checkForWin(playerId, row, column);

    expect(result).toBe(false);
  });

  test("checkForDraw should return true when there is a draw", async () => {
    const winData = await fs.readFile(`${casesDir}/draw.json`, "utf-8");
    const win = JSON.parse(winData);
    game.board = win;

    const result = game.checkForDraw();

    expect(result).toBe(true);
  });
});
