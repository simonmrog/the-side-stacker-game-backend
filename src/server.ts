import express from "express";
import http from "http";
import * as socketIO from "socket.io";

import config from "./config/config";

import router from "./routes";
import SideStackerGame from "./services/sideStacker/sideStacker";

export default class App {
  private server: http.Server;
  private port: number;
  private io: socketIO.Server;

  constructor(port: number) {
    this.port = port;

    // Server Setup
    const app = express();
    app.use("/", router);
    const game = new SideStackerGame();
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const players: any = {};

    this.io.on("connection", (socket: socketIO.Socket) => {
      console.log(`User ${socket.id} connected successfully`);

      players[socket.id] = {
        message: "hello",
        board: [],
      };

      socket.emit("message", "Hello " + socket.id);

      // socket.broadcast.emit("message", "Everybody, say hello to our new user: " + socket.id);

      socket.on("disconnect", (reason: socketIO.DisconnectReason) => {
        delete players[socket.id];
        console.log("User disconnected successfully: ", reason);
      });

      socket.on("message-response", message => {
        console.log("[message-response event]: ", message);
      });

      this.io.emit("player-connected", players);
    });
  }

  run(): void {
    this.server.listen(this.port, () => console.log(`Server running on port ${this.port}`));
  }
}
