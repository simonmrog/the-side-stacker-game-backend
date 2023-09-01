export interface IErrorCatalog {
  INVALID_MOVE: IInvalidMoveCatalog;
  INVALID_GAME: IInvalidGameCatalog;
  INVALID_PLAYER: IInvalidPlayerCatalog;
}

interface IInvalidMoveCatalog {
  FULL_ROW: string;
}

interface IInvalidGameCatalog {
  NOT_ENOUGH_PLAYERS: string;
}

interface IInvalidPlayerCatalog {
  PLAYER_NOT_FOUND: string;
}
