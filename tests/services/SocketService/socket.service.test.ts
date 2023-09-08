jest.mock("../.../../../../src/services/DatabaseService/database.service.ts");

import { createServer, Server as httpServer } from "http";
import * as socketIO from "socket.io";
import Client from "socket.io-client";

import { IMove } from "../../../src/services/GameService/game.interface";
import SocketService from "../../../src/services/SocketService/socket.service";

describe("SocketService tests", () => {
  let httpServer: httpServer;
  let socket: SocketService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let ioClient: any;

  beforeAll(() => {
    httpServer = createServer().listen();
    ioClient = Client();
  });

  afterAll(() => {
    // close the server instance after each test
    httpServer.close();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (ioClient as any).close();
    jest.restoreAllMocks();
  });

  test("should create a SocketIO instance and set the game property to null", () => {
    socket = new SocketService(httpServer);

    expect(socket.game).toBeNull();
    expect(socket.io instanceof socketIO.Server).toBe(true);
  });

  test("onCreateGameEvent function should create a new instance of the game and emit a 'loading' event while it adds the game to DB", () => {
    socket = new SocketService(httpServer);
    const emitSpy = jest.spyOn(socket.io, "emit");

    socket.onNewGameEvent();

    expect(socket.game).not.toBeNull();
    expect(socket.io instanceof socketIO.Server).toBe(true);
    expect(emitSpy).toBeCalledWith("loading", true);
  });

  test("onJoinGameEvent function should add a player to the game and emit a 'loading' event", async () => {
    socket = new SocketService(httpServer);
    const emitSpy = jest.spyOn(socket.io, "emit");

    socket.onNewGameEvent(); // we need to create the game first

    expect(socket.io instanceof socketIO.Server).toBe(true);
    expect(emitSpy).toBeCalledWith("loading", true);
  });

  test("onRestartGameEvent function should call the restart function and emit a 'loading' event", () => {
    socket = new SocketService(httpServer);

    socket.onNewGameEvent(); // we need to create the game first
    const restartSpy = jest.spyOn(socket.game!, "restart");
    const emitSpy = jest.spyOn(socket.io, "emit");

    socket.onRestartGameEvent();

    expect(socket.io instanceof socketIO.Server).toBe(true);
    expect(restartSpy).toBeCalled();
    expect(emitSpy).toBeCalledWith("loading", true);
  });

  test("onMoveEvent function should call the handleTurn function and emit a 'player-moved' event", () => {
    socket = new SocketService(httpServer);
    const emitSpy = jest.spyOn(socket.io, "emit");
    const move = { row: 0, side: "left" } as IMove;

    socket.onNewGameEvent(); // we need to create the game first
    const handleSpy = jest.spyOn(socket.game!, "handleTurn");
    socket.onMoveEvent("some-id", move);

    expect(socket.io instanceof socketIO.Server).toBe(true);
    expect(handleSpy).toBeCalledWith("some-id", move);
    expect(emitSpy).toBeCalledWith("player-moved", socket.game?.getGameState());
  });

  test("onDisconnectEvent should remove the player disconnected", () => {
    socket = new SocketService(httpServer);
    const socketMock = {
      id: "some-id",
      emit: jest.fn(),
    } as unknown as socketIO.Socket;

    socket.onNewGameEvent(); // start the game instance first
    const removePlayerSpy = jest.spyOn(socket.game!, "removePlayer");
    socket.onJoinGameEvent(socketMock); // adds the player to the game

    socket.onDisconnectEvent(socketMock.id); // should remove the player from the game

    expect(removePlayerSpy).toBeCalled();
    expect(socket.game!.players.length).toBe(0);
  });

  test("run function should execute the io.on method", () => {
    socket = new SocketService(httpServer);
    const onSpy = jest.spyOn(socket.io, "on");

    socket.run();

    expect(onSpy).toBeCalled();
  });
});
