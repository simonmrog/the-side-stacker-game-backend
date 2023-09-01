import { IErrorCatalog } from "./errorCatalog.interface";

export const errorCatalog: IErrorCatalog = {
  INVALID_MOVE: {
    FULL_ROW: "INVALID_MOVE: The current row is full",
  },
  INVALID_GAME: {
    NOT_ENOUGH_PLAYERS: "NOT_ENOUGH_PLAYERS: The game is not available because lack of players",
  },
  INVALID_PLAYER: {
    PLAYER_NOT_FOUND: "PLAYER_NOT_FOUND: Player is not available",
  },
};
