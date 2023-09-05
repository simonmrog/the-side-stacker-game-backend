import express from "express";
import http from "http";

import logger from "./utils/logger";
import router from "./routes";
import SocketService from "./services/SocketService/socket.service";

export default class App {
  public server: http.Server;
  private port: number;

  constructor(port: number) {
    this.port = port;

    // Server Setup
    const app = express();
    app.use("/", router);
    this.server = http.createServer(app);

    // Socket Setup
    const socketService = new SocketService(this.server);
    socketService.run();
  }

  run(): void {
    this.server.listen(this.port, () => logger.info(`Server running on port ${this.port}`));
  }

  close(): void {
    this.server.close();
  }
}
