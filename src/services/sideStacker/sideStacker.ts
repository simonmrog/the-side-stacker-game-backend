import { IGame, GameStatus, TBoard, TRow, TCell, IMove, IPositionInBoard } from "./sideStacker.interface";

export default class SideStackerGame implements IGame {
  public status: GameStatus = GameStatus.NOT_STARTED;
  public board: TBoard;
  public players: Array<string>;
  public currentPlayer: string | null;
  public moves: Array<string>;
  public result: string | null;

  constructor() {
    this.status = GameStatus.NOT_STARTED;
    this.board = Array.from({ length: 7 }, () => Array(7).fill(""));
    this.players = [];
    this.currentPlayer = null;
    this.moves = [];
    this.result = null;
  }

  start() {
    this.status = GameStatus.STARTED;
  }

  restart() {
    this.status = GameStatus.STARTED;
    this.board = Array.from({ length: 7 }, () => Array(7).fill(""));
    this.currentPlayer = this.players.length ? this.players[0] : null;
    this.moves = [];
    this.result = null;
  }

  endGame(result: string) {
    this.status = GameStatus.FINISHED;
    this.result = result;
  }

  addPlayer(player: string) {
    this.players.push(player);
    if (this.players.length === 1) this.status = GameStatus.WAITING_FOR_SECOND_USER;
    if (!this.currentPlayer) this.currentPlayer = player;
  }

  removePlayer(player: string) {
    const playerIndex = this.players.indexOf(player);
    this.players.splice(playerIndex, 1);
    if (this.players.length === 1) this.status = GameStatus.WAITING_FOR_SECOND_USER;
    if (this.currentPlayer === player) this.currentPlayer = null;
  }

  stackPiece(player: string, move: IMove): IPositionInBoard {
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
    // if the toggle turn occurs but there are no players in the game
    const currentPlayerIndex = this.players.indexOf(this.currentPlayer!);
    const nextIndex = 1 - currentPlayerIndex;
    this.currentPlayer = this.players[nextIndex];
  }

  handleTurn(player: string, move: IMove): void {
    const { row, column } = this.stackPiece(player, move);
    const playersMove = `Player ${player} played (${move.row}, ${move.side})`;
    this.moves.push(playersMove);
    if (this.checkForWin(player, row, column)) {
      this.endGame(`${player} Won`);
    } else if (this.checkForDraw()) {
      this.endGame("The Game is a Draw");
    } else this.toggleTurn();
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
    return this.board.reduce((draw: boolean, row: TRow) => {
      return draw && row.every((cell: TCell) => cell !== "");
    }, true);
  }

  checkForWin(player: string, row: number, column: number): boolean {
    return (
      this.checkHorizontalWin(player, row, column) ||
      this.checkVerticalWin(player, row, column) ||
      this.checkDiagonalWin(player, row, column)
    );
  }

  gameStatus() {
    return {
      status: this.status,
      players: this.players,
      board: this.board,
      currentPlayer: this.currentPlayer,
      moves: this.moves,
      result: this.result,
    };
  }
}
