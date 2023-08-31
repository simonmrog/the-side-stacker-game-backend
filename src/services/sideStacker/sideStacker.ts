import { errorCatalog } from "../../config/errorCatalog";
import { Player } from "../../models/player";
import { IGame, GameStatus, TBoard, TRow, TCell, IMove, IPositionInBoard } from "./sideStacker.interface";

export default class SideStackerGame implements IGame {
  public status: GameStatus = GameStatus.NOT_STARTED;
  public board: TBoard;
  public players: Array<Player>;
  public currentPlayer: string | null;
  public moves: Array<string>;
  public winnerId: string | null;

  constructor() {
    this.status = GameStatus.NOT_STARTED;
    this.board = Array.from({ length: 7 }, () => Array(7).fill(""));
    this.players = [];
    this.currentPlayer = null;
    this.moves = [];
    this.winnerId = null;
  }

  start() {
    this.status = GameStatus.STARTED;
  }

  restart() {
    this.status = GameStatus.STARTED;
    this.board = Array.from({ length: 7 }, () => Array(7).fill(""));
    this.currentPlayer = this.players.length ? this.players[0].id : null;
    this.moves = [];
    this.winnerId = null;
  }

  endGame(winnerId: string) {
    this.status = GameStatus.FINISHED;
    this.winnerId = winnerId;
  }

  addPlayer(player: Player) {
    this.players.push(player);
    if (this.players.length === 1) this.status = GameStatus.WAITING_FOR_SECOND_USER;
    if (!this.currentPlayer) this.currentPlayer = player.id;
  }

  removePlayer(playerId: string) {
    const playerIndex = this.players.findIndex(player => player.id === playerId);
    this.players.splice(playerIndex, 1);
    if (this.players.length === 1) this.status = GameStatus.WAITING_FOR_SECOND_USER;
    if (this.currentPlayer === playerId) this.currentPlayer = null;
  }

  fullRow(rIndex: number): boolean {
    return this.board[rIndex].every((cell: TCell) => cell !== "");
  }

  stackPiece(player: string, move: IMove): IPositionInBoard | null {
    let column;
    const { row, side } = move;
    if (this.fullRow(row)) return null;
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
    const currentPlayerIndex = this.players.findIndex(player => player.id === this.currentPlayer);
    const nextIndex = 1 - currentPlayerIndex;
    this.currentPlayer = this.players[nextIndex].id;
  }

  handleTurn(player: string, move: IMove): void {
    const moveIndices = this.stackPiece(player, move);
    // no move was performed because the row is full
    if (!moveIndices) throw new Error(errorCatalog.INVALID_MOVE.FULL_ROW);
    const playersMove = `Player ${player} played (${move.row}, ${move.side})`;
    this.moves.push(playersMove);
    if (this.checkForWin(player, moveIndices.row, moveIndices.column)) {
      this.endGame(player);
    } else if (this.checkForDraw()) {
      this.endGame("draw");
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
      winnerId: this.winnerId,
    };
  }
}
