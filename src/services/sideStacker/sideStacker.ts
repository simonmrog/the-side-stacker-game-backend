import { errorCatalog } from "../../config/errorCatalog";
import { IPlayer, Player } from "../../models/player";
import { IGame, GameStatus, TBoard, TRow, TCell, IMove, IPositionInBoard } from "./sideStacker.interface";

export default class SideStackerGame implements IGame {
  private colorsBag: Array<number>;
  public status: GameStatus = GameStatus.NOT_STARTED;
  public board: TBoard;
  public players: Array<IPlayer>;
  public currentPlayer: string | null;
  public moves: Array<string>;
  public winnerId: string | null;

  constructor() {
    this.colorsBag = [0, 120, 240];
    this.status = GameStatus.NOT_STARTED;
    this.board = Array.from({ length: 7 }, () => Array(7).fill(null));
    this.players = [];
    this.currentPlayer = null;
    this.moves = [];
    this.winnerId = null;
  }

  getRandomColor(): string {
    const randomIndex = Math.floor(Math.random() * this.colorsBag.length);
    const randomHue = this.colorsBag[randomIndex];
    this.colorsBag.splice(randomIndex, 1);
    return `hsla(${randomHue}, 100%, 70%, 1)`;
  }

  getRandomTurn() {
    // generates either 0 or 1 randomly
    const randomIndex = Math.round(Math.random());
    const player = this.players[randomIndex];
    return player.id;
  }

  start() {
    this.status = GameStatus.STARTED;
    this.currentPlayer = this.getRandomTurn();
  }

  restart() {
    this.status = GameStatus.STARTED;
    this.board = Array.from({ length: 7 }, () => Array(7).fill(null));
    this.currentPlayer = this.getRandomTurn();
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
  }

  removePlayer(playerId: string) {
    const playerIndex = this.players.findIndex(player => player.id === playerId);
    this.players.splice(playerIndex, 1);
    if (this.players.length === 1) this.status = GameStatus.WAITING_FOR_SECOND_USER;
  }

  fullRow(rIndex: number): boolean {
    return this.board[rIndex].every((cell: TCell) => cell !== null);
  }

  stackPiece(player: IPlayer, move: IMove): IPositionInBoard | null {
    let column;
    const { row, side } = move;
    if (this.fullRow(row)) return null;
    if (side === "right") {
      const rowLength = this.board[row].length;
      const columnRev = Array.from(this.board[row]).reverse().indexOf(null);
      column = rowLength - 1 - columnRev;
      this.board[row][column] = player;
    } else {
      column = this.board[row].indexOf(null);
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

  handleTurn(playerId: string, move: IMove): void {
    const player = this.players.find(p => p.id === playerId);
    if (!player) return;
    const playerData = { id: player.id, color: player.color };
    const moveIndices = this.stackPiece(playerData, move);
    // no move was performed because the row is full
    if (!moveIndices) throw new Error(errorCatalog.INVALID_MOVE.FULL_ROW);
    const playersMove = `Player ${playerId} played (${move.row}, ${move.side})`;
    this.moves.push(playersMove);
    if (this.checkForWin(playerId, moveIndices.row, moveIndices.column)) {
      this.endGame(playerId);
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
        if (noOverflowCheck(row, c) && this.board[row][c] && this.board[row][c]!.id === player) count++;
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
        if (noOverflowCheck(r, column) && this.board[r][column] && this.board[r][column]!.id === player) count++;
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
    ): number => {
      let count = 0;
      for (let step = 1, shouldStep = true; shouldStep && count < winCondition; step++) {
        const r = row + direction[0] * step;
        const c = column + direction[1] * step;
        if (noOverflowCheck(r, c) && this.board[r][c] && this.board[r][c]!.id === player) count++;
        else shouldStep = false;
      }
      return count;
    };

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
    const upRightCount = checkByDiagonal(winCondition, upRightCheck, [-1, 1]);
    // down right check
    const downRightCount = checkByDiagonal(winCondition, downRightCheck, [1, 1]);
    // up left check
    const upLeftCount = checkByDiagonal(winCondition, upLeftCheck, [-1, -1]);
    // down left check
    const downLeftCount = checkByDiagonal(winCondition, downLeftCheck, [1, -1]);

    // 1 must be summed to the counters because is the position in which we currently are
    const mainDiagonalCount = upRightCount + downLeftCount + 1;
    const secondDiagonalCount = upLeftCount + downRightCount + 1;
    return mainDiagonalCount === winCondition || secondDiagonalCount === winCondition;
  }

  checkForDraw(): boolean {
    return this.board.reduce((draw: boolean, row: TRow) => {
      return draw && row.every((cell: TCell) => cell !== null);
    }, true);
  }

  checkForWin(player: string, row: number, column: number): boolean {
    const horizontalWin = this.checkHorizontalWin(player, row, column);
    const verticalWin = this.checkVerticalWin(player, row, column);
    const diagonalWin = this.checkDiagonalWin(player, row, column);
    return horizontalWin || verticalWin || diagonalWin;
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
