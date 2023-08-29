export interface Game {
  start(): void;
  endGame(result: string): void;
  handleTurn(player: string, move: Move): void;
  checkForDraw(): boolean;
  checkForWin(player: string, row: number, column: number): boolean;
}

export interface GameState {
  status: GameStatus;
  board: Board;
  players: Array<string>;
  currentPlayer: string;
  moves: Array<string>;
  result: string | null;
}

export enum GameStatus {
  NOT_STARTED = "not-started",
  WAITING_FOR_SECOND_USER = "waiting-for-second-user",
  STARTED = "started",
  FINISHED = "finished",
}

export type Board = Array<Row>;

export type Row = Array<string>;

export interface Move {
  row: number;
  side: Side;
}

export type Side = "left" | "right";

export interface PositionInBoard {
  row: number;
  column: number;
}
