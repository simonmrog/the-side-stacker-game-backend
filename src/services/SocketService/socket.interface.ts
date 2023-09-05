import { Server } from "socket.io";

export interface ISocketService {
  io: Server;
  run: () => void;
}
