import { Game, Board, Move, PositionInBoard } from "./sideStacker.interface";

const gameState = {
  currentPlayer: "Player 1",
};

export default class SideStackerGame implements Game {
  board: Board;

  constructor() {
    this.board = Array.from({ length: 7 }, () => Array(7).fill(""));
  }

  start() {
    this.board = Array.from({ length: 7 }, () => Array(7).fill(""));
  }

  restart() {
    this.start();
  }

  endGame(result: string) {
    console.log(result);
    this.restart();
  }

  stackPiece(player: string, move: Move): PositionInBoard {
    let column;
    const { row, side } = move;
    if (side === "right") {
      const rowLength = this.board[row].length;
      const columnRev = Array.from(this.board[row]).reverse().indexOf("");
      column = rowLength - 1 - columnRev;
      this.board[row][column] = player;
    } else {
      column = this.board[row].indexOf("");
      this.board[row][column] = player;
    }

    return { row, column };
  }

  toggleTurn() {
    gameState.currentPlayer = gameState.currentPlayer === "Player 1" ? "Player 2" : "Player 1";
  }

  handleTurn(player: string, move: Move): void {
    const { row, column } = this.stackPiece(player, move);
    if (this.checkForWin(player, row, column)) {
      this.endGame(`[EVENT] ${player} Won`);
    } else if (this.checkForDraw()) {
      this.endGame("[EVENT] Draw");
    } else this.toggleTurn();
    this.printBoard();
  }

  checkHorizontalWin(player: string, row: number, column: number): boolean {
    const checkByDirection = (
      winCondition: number,
      noOverflowCheck: (r: number, c: number) => boolean,
      direction: number
    ): void => {
      for (let step = 1, shouldStep = true; shouldStep && count < winCondition; step++) {
        const c = column + direction * step;
        if (noOverflowCheck(row, c) && this.board[row][c] === player) count++;
        else shouldStep = false;
      }
    };

    // should start at 1 to count the position (row, column) itself
    let count = 1;

    const minColumn = 0;
    const maxColumn = this.board[0].length;
    const winCondition = 4;

    const rightCheck = (c: number) => c < maxColumn;
    const leftCheck = (c: number) => c >= minColumn;

    // right check
    checkByDirection(winCondition, rightCheck, 1);
    // left check
    checkByDirection(winCondition, leftCheck, -1);

    return count === winCondition;
  }

  checkVerticalWin(player: string, row: number, column: number): boolean {
    const checkByDirection = (
      winCondition: number,
      noOverflowCheck: (r: number, c: number) => boolean,
      direction: number
    ): void => {
      for (let step = 1, shouldStep = true; shouldStep && count < winCondition; step++) {
        const r = row + direction * step;
        if (noOverflowCheck(r, column) && this.board[r][column] === player) count++;
        else shouldStep = false;
      }
    };

    // should start at 1 to count the position (row, column) itself
    let count = 1;

    const minRow = 0;
    const maxRow = this.board.length;
    const winCondition = 4;

    const upCheck = (r: number) => r >= minRow;
    const downCheck = (r: number) => r < maxRow;

    // up check
    checkByDirection(winCondition, upCheck, -1);
    // down check
    checkByDirection(winCondition, downCheck, 1);

    return count === winCondition;
  }

  checkDiagonalWin(player: string, row: number, column: number): boolean {
    const checkByDiagonal = (
      winCondition: number,
      noOverflowCheck: (r: number, c: number) => boolean,
      direction: [number, number]
    ): void => {
      for (let step = 1, shouldStep = true; shouldStep && count < winCondition; step++) {
        const r = row + direction[0] * step;
        const c = column + direction[1] * step;
        if (noOverflowCheck(r, c) && this.board[r][c] === player) count++;
        else shouldStep = false;
      }
    };

    // should start at 1 to count the position (row, column) itself
    let count = 1;

    const minRow = 0;
    const minColumn = 0;
    const maxRow = this.board.length;
    const maxColumn = this.board[0].length;
    const winCondition = 4;

    const upRightCheck = (r: number, c: number) => r >= minRow && c < maxColumn;
    const downRightCheck = (r: number, c: number) => r < maxRow && c < maxColumn;
    const upLeftCheck = (r: number, c: number) => r >= minRow && c >= minColumn;
    const downLeftCheck = (r: number, c: number) => r < maxRow && c >= minColumn;

    // up right check
    checkByDiagonal(winCondition, upRightCheck, [-1, 1]);
    // down right check
    checkByDiagonal(winCondition, downRightCheck, [1, 1]);
    // up left check
    checkByDiagonal(winCondition, upLeftCheck, [-1, -1]);
    // down left check
    checkByDiagonal(winCondition, downLeftCheck, [1, -1]);

    // the count starts at 1 because is the position in which we currently are
    return count === winCondition;
  }

  checkForDraw(): boolean {
    return this.board.reduce((draw, row) => {
      return draw && row.every(cell => cell !== "");
    }, true);
  }

  checkForWin(player: string, row: number, column: number): boolean {
    return (
      this.checkHorizontalWin(player, row, column) ||
      this.checkVerticalWin(player, row, column) ||
      this.checkDiagonalWin(player, row, column)
    );
  }

  printBoard(): void {
    console.log(this.board);
  }
}
