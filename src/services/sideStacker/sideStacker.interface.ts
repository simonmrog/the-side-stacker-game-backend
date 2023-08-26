export interface Game {
  start(): void;
  restart(): void;
  endGame(result: string): void;
  handleTurn(player: string, move: Move): void;
  checkForDraw(): boolean;
  checkForWin(player: string, row: number, column: number): boolean;
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
