import { shuffle } from './helper';

export class Generator {
  public board: Uint8Array = new Uint8Array(81).fill(0);

  // bitmask cache
  private rowMasks: Int32Array = new Int32Array(9).fill(0);
  private colMasks: Int32Array = new Int32Array(9).fill(0);
  private boxMasks: Int32Array = new Int32Array(9).fill(0);

  public generate(): number[] {
    this.board = new Uint8Array(81).fill(0);
    // generate random sudoku puzzle
    const generateInner = (): boolean => {
      const idx = this.board.indexOf(0);
      if (idx == -1) return true;

      for (const num of shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])) {
        if (this.isValidMove(idx, num)) {
          this.placeNumber(idx, num);
          if (generateInner()) return true;
          this.removeNumber(idx, num);
        }
      }
      return false;
    };
    generateInner();

    const indexes = shuffle(Array.from({ length: this.board.length }, (_, i) => i));
    for (const idx of indexes) {
      const num: number = this.board[idx]!;
      this.removeNumber(idx, num);

      if (!this.singleSolution()) {
        this.placeNumber(idx, num);
      }
    }

    return Array.from(this.board);
  }

  /**
   * Create copy of this.board and its masks.
   *
   * @returns A copy of this.board and its masks.
   */
  public copyBoard(): [Uint8Array, Int32Array, Int32Array, Int32Array] {
    const boardCopy = new Uint8Array(this.board);
    const rowMasksCopy = new Int32Array(this.rowMasks);
    const colMasksCopy = new Int32Array(this.colMasks);
    const boxMasksCopy = new Int32Array(this.boxMasks);

    return [boardCopy, rowMasksCopy, colMasksCopy, boxMasksCopy];
  }

  /**
   * Reset the internal board to the start state.
   *
   * @param boardState - boardState and masks to revert to.
   */
  public resetBoard(boardInfo: [Uint8Array, Int32Array, Int32Array, Int32Array]) {
    const board = boardInfo[0];
    const rowMasks = boardInfo[1];
    const colMasks = boardInfo[2];
    const boxMasks = boardInfo[3];
    this.board = new Uint8Array(board);
    this.rowMasks = new Int32Array(rowMasks);
    this.colMasks = new Int32Array(colMasks);
    this.boxMasks = new Int32Array(boxMasks);
  }

  /**
   * Add number to board and update cache.
   *
   * @param idx - index where num will be placed.
   * @param num - number that will be placed.
   */
  private placeNumber(idx: number, num: number) {
    const row = Math.trunc(idx / 9);
    const col = idx % 9;
    const box = this.getBoxIndex(row, col);

    this.board[idx] = num;

    const bit = 1 << num;
    this.rowMasks[row]! |= bit;
    this.colMasks[col]! |= bit;
    this.boxMasks[box]! |= bit;
  }

  /**
   * Remove number from board and update cache.
   *
   * @param idx - index where num will be removed.
   * @param num - number that will be removed.
   */
  private removeNumber(idx: number, num: number) {
    const row = Math.trunc(idx / 9);
    const col = idx % 9;
    const box = this.getBoxIndex(row, col);

    this.board[idx] = 0;

    const bit = 1 << num;
    this.rowMasks[row]! &= ~bit;
    this.colMasks[col]! &= ~bit;
    this.boxMasks[box]! &= ~bit;
  }

  /**
   * Calculate which box a cell belongs to.
   *
   * @param row - Row of cell.
   * @param col - Col of cell.
   * @returns The box index the cell belongs to.
   */
  private getBoxIndex(row: number, col: number): number {
    return Math.trunc(row / 3) * 3 + Math.trunc(col / 3);
  }

  /**
   * Check if there is only one solution for boardState.
   *
   * @returns true if single solution, false otherwise.
   */
  private singleSolution(): boolean {
    const singleSolutionInner = (acc: number): number => {
      const idx = this.board.indexOf(0);
      if (idx == -1) return acc + 1;

      for (let num = 1; num <= 9; num++) {
        if (this.isValidMove(idx, num)) {
          this.placeNumber(idx, num);
          acc = singleSolutionInner(acc);
          this.removeNumber(idx, num);
          // if more than 1 solution found, immediately return
          if (acc > 1) {
            return acc;
          }
        }
      }
      return acc;
    };

    const boardInfo = this.copyBoard();
    const result = singleSolutionInner(0) == 1;
    this.resetBoard(boardInfo);

    return result;
  }

  /**
   * Checks if a board is valid from the perspective of cell idx.
   *
   * @param idx - The index of the cell that will be validated.
   * @param num - The number to fill into cell idx.
   * @returns true if the board state is valid, false otherwise
   */
  private isValidMove(idx: number, num: number): boolean {
    const row = Math.trunc(idx / 9);
    const col = idx % 9;
    const box = this.getBoxIndex(row, col);

    const bit = 1 << num;

    const allTaken = this.rowMasks[row]! | this.colMasks[col]! | this.boxMasks[box]!;

    return (allTaken & bit) === 0;
  }
}
