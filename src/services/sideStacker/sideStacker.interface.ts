export interface Game {
  start(): void;
  endGame(result: string): void;
  handleTurn(player: string, move: Move): void;
  checkForDraw(): boolean;
  checkForWin(player: string, row: number, column: number): boolean;
}

export interface GameState {
  status: GameStatus;
  players: Array<string>;
  board: Board;
  currentPlayer: string;
}

export enum GameStatus {
  NOT_STARTED = "not-started",
  WAITING_FOR_SECOND_USER = "waiting-for-second-user",
  STARTED = "started",
}

export type Board = Array<Row>;

export type Row = Array<string>;

export interface Move {
  row: number;
  side: "right" | "left";
}

export interface PositionInBoard {
  row: number;
  column: number;
}
