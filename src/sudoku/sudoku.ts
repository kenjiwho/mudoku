import { shuffle } from './helper';

export enum StepType {
  NAKEDSINGLE,
  HIDDENSINGLE,
  NAKEDPAIR,
  HIDDENPAIR,
}

export class Sudoku {
  public board: Uint8Array;
  public readonly startBoard: Uint8Array;

  // bitmask cache
  private rowMasks: Int32Array;
  private colMasks: Int32Array;
  private boxMasks: Int32Array;
  private startRowMasks: Int32Array;
  private startColMasks: Int32Array;
  private startBoxMasks: Int32Array;

  constructor(board?: Uint8Array) {
    this.rowMasks = new Int32Array(9);
    this.colMasks = new Int32Array(9);
    this.boxMasks = new Int32Array(9);

    if (board !== undefined) {
      this.board = new Uint8Array(board);
      this.initializeMasks();
    } else {
      this.board = new Uint8Array(81).fill(0);
      this.initializeMasks();

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

      const indexes = shuffle(Array.from({ length: 81 }, (_, i) => i));
      for (const idx of indexes) {
        const num: number = this.board[idx]!;
        this.removeNumber(idx, num);

        if (!this.singleSolution()) {
          this.placeNumber(idx, num);
        }
      }
    }

    this.startBoard = new Uint8Array(this.board);
    this.startRowMasks = new Int32Array(this.rowMasks);
    this.startColMasks = new Int32Array(this.colMasks);
    this.startBoxMasks = new Int32Array(this.boxMasks);
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
  public resetBoard(boardInfo?: [Uint8Array, Int32Array, Int32Array, Int32Array]) {
    if (boardInfo === undefined) {
      boardInfo = [this.startBoard, this.startRowMasks, this.startColMasks, this.startBoxMasks];
    }
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
   * Initialize the masks used to check for isValidMove
   */
  private initializeMasks() {
    for (let i = 0; i < 81; i++) {
      const num = this.board[i]!;
      if (num != 0) {
        const row = Math.trunc(i / 9);
        const col = i % 9;
        const box = this.getBoxIndex(row, col);

        const bit = 1 << num;
        this.rowMasks[row]! |= bit;
        this.colMasks[col]! |= bit;
        this.boxMasks[box]! |= bit;
      }
    }
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
    this.rowMasks[row]! ^= bit;
    this.colMasks[col]! ^= bit;
    this.boxMasks[box]! ^= bit;
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
   * Give a solution to a sudoku boardState.
   *
   * @param boardState - The sudoku to be solved.
   * @returns The solved board state or null if there is none.
   */
  public solve() {
    const solveInner = (): boolean => {
      const idx = this.board.indexOf(0);
      if (idx == -1) return true;

      for (const num of shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])) {
        if (this.isValidMove(idx, num)) {
          this.placeNumber(idx, num);
          if (solveInner()) return true;
          this.removeNumber(idx, num);
        }
      }
      return false;
    };

    solveInner();
  }

  /**
   * Check if there is only one solution for boardState.
   *
   * @param boardState - The sudoku to be solved.
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
   * @param boardState - The boardState in question.
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

  /**
   * Get the candidate numbers that can be filled into boardState at index idx.
   *
   * @param boardState - The boardState in quesiton.
   * @param idx - The index to search for candidates.
   * @returns An array of candidates.
   */
  private getCandidates(idx: number): number[] {
    const row = Math.trunc(idx / 9);
    const col = idx % 9;
    const box = this.getBoxIndex(row, col);

    const allTaken = this.rowMasks[row]! | this.colMasks[col]! | this.boxMasks[box]!;
    const available = ~allTaken;

    const candidates: number[] = [];
    for (let num = 1; num <= 9; num++) {
      if ((available & (1 << num)) !== 0) {
        candidates.push(num);
      }
    }

    return candidates;
  }

  /**
   * Checks if a boardState is solved.
   *
   * @params - The boardState to check.
   * @returns true if the boardState is solved, false otherwise.
   */
  private solved() {
    return !this.board.includes(0);
  }

  /**
   * Find a naked single.
   *
   * @param boardState - The boardState to check.
   * @returns The index of the naked single, -1 if none were found, and the number
   *          that can be inserted.
   */
  private findNakedSingle(): [StepType, number, number] {
    for (let idx = 0; idx < this.board.length; idx++) {
      if (this.board[idx] != 0) {
        continue;
      }

      const candidates = this.getCandidates(idx);

      if (candidates.length == 1) {
        return [StepType.NAKEDSINGLE, idx, candidates[0]!];
      }
    }

    return [StepType.NAKEDSINGLE, -1, 0];
  }

  private findHiddenSingle(): [StepType, number, number] {
    const rowCols: [number, number][] = [
      [0, 0],
      [1, 3],
      [2, 6],
      [3, 1],
      [4, 4],
      [5, 7],
      [6, 2],
      [7, 5],
      [8, 8],
    ];

    for (const [row, col] of rowCols) {
      const startRow = Math.trunc(row / 3) * 3;
      const startCol = Math.trunc(col / 3) * 3;

      const rowCounts = Array(10).fill(0);
      const rowLastSeen = Array(10).fill(0);
      const colCounts = Array(10).fill(0);
      const colLastSeen = Array(10).fill(0);
      const boxCounts = Array(10).fill(0);
      const boxLastSeen = Array(10).fill(0);

      for (let i = 0; i < 9; i++) {
        // 1. Check Row
        const rowIdx = row * 9 + i;
        if (this.board[rowIdx] === 0) {
          const candidates = this.getCandidates(rowIdx);
          for (const num of candidates) {
            rowCounts[num]++;
            rowLastSeen[num] = rowIdx;
          }
        }

        // 2. Check Column
        const colIdx = i * 9 + col;
        if (this.board[colIdx] === 0) {
          const candidates = this.getCandidates(colIdx);
          for (const num of candidates) {
            colCounts[num]++;
            colLastSeen[num] = colIdx;
          }
        }

        // 3. Check 3x3 Box
        const boxRow = startRow + Math.trunc(i / 3);
        const boxCol = startCol + (i % 3);
        const boxIdx = boxRow * 9 + boxCol;
        if (this.board[boxIdx] === 0) {
          const candidates = this.getCandidates(boxIdx);
          for (const num of candidates) {
            boxCounts[num]++;
            boxLastSeen[num] = boxIdx;
          }
        }
      }

      // Check for number that appears once
      for (let num = 1; num <= 9; num++) {
        if (rowCounts[num] === 1) {
          const targetIndex = rowLastSeen[num];
          return [StepType.HIDDENSINGLE, targetIndex, num];
        } else if (colCounts[num] === 1) {
          const targetIndex = colLastSeen[num];
          return [StepType.HIDDENSINGLE, targetIndex, num];
        } else if (boxCounts[num] === 1) {
          const targetIndex = boxLastSeen[num];
          return [StepType.HIDDENSINGLE, targetIndex, num];
        }
      }
    }
    return [StepType.HIDDENSINGLE, -1, 0];
  }

  private findNakedPair(): [StepType, number, number] {
    return [StepType.NAKEDPAIR, -1, 0];
  }

  /**
   * Find a sequence of moves based on logic (naked singles/doubles, hidden singles, etc.) that solves a puzzle.
   *
   * @param boardState - The boardState to solve.
   * @returns Sequence of moves that solves the puzzle.
   */
  public logicSolve() {
    const boardInfo = this.copyBoard();
    // (step type, index, candidate)
    const solution: [StepType, number, number][] = [];
    while (!this.solved()) {
      // level 1:
      // - naked singles
      let step = this.findNakedSingle();
      if (step[1] != -1) {
        solution.push(step);
        this.placeNumber(step[1], step[2]);
        continue;
      }

      // - hidden singles
      step = this.findHiddenSingle();
      if (step[1] != -1) {
        solution.push(step);
        this.placeNumber(step[1], step[2]);
        continue;
      }

      // level 2:
      // - naked pairs
      step = this.findNakedPair();
      if (step[1] != -1) {
        solution.push(step);
        this.placeNumber(step[1], step[2]);
        continue;
      }

      // - naked triples
      // - hidden pairs
      // - hidden triples
      //
      // level 3:
      // - pointing pairs/pointing triples
      // - box/line reduction
      // - naked quad
      // - hidden quad
      //
      // level 4:
      // - X-wing
      // - Y-wing
      // - swordfish
      // - XYZ-wing
      //
      // level 5:
      // - simple colors (single's chain)
      // - XY-chain
      // - forcing chains
      // - jellyfish
      // - unique rectangles (might not)

      throw 'NO SOLUTION';
    }

    console.log();
    console.log(this.toString());
    console.log();
    this.resetBoard(boardInfo);

    return solution;
  }

  toString(boardState?: Uint8Array): string {
    if (boardState === undefined) {
      boardState = this.board;
    }

    let str = '';
    for (let j = 0; j < 9; j++) {
      for (let i = 0; i < 9; i++) {
        const idx = j * 9 + i;
        if (i !== 0) {
          str = str + ' ';
        }
        str = str + `${boardState[idx]}`;
        if ((i + 1) % 3 === 0) {
          str = str + ' ';
        }
      }
      if (j === 8) {
        break;
      }
      str = str + '\n';
      if ((j + 1) % 3 === 0) {
        str = str + '\n';
      }
    }

    return str;
  }
}
