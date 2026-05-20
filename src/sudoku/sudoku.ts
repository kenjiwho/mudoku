import { dec2bin, locActiveBit, shuffle } from './helper';

export enum StepType {
  NAKEDSINGLE,
  HIDDENSINGLE,
  NAKEDPAIR,
  HIDDENPAIR,
}

export class Board {
  public userBoard: Uint8Array;
  private solverBoard: Uint8Array;
  public readonly startBoard: Uint8Array;

  public pencilMarks: Int32Array = new Int32Array(81).fill(0);

  // bitmask cache
  private rowMasks: Int32Array = new Int32Array(9).fill(0);
  private colMasks: Int32Array = new Int32Array(9).fill(0);
  private boxMasks: Int32Array = new Int32Array(9).fill(0);

  constructor(board?: Uint8Array) {
    if (board !== undefined) {
      this.solverBoard = new Uint8Array(board);
    } else {
      this.solverBoard = new Uint8Array(81).fill(0);

      // generate random sudoku puzzle
      const generateInner = (): boolean => {
        const idx = this.solverBoard.indexOf(0);
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

      const indexes = shuffle(Array.from({ length: this.solverBoard.length }, (_, i) => i));
      for (const idx of indexes) {
        const num: number = this.solverBoard[idx]!;
        this.removeNumber(idx, num);

        if (!this.singleSolution()) {
          this.placeNumber(idx, num);
        }
      }
    }

    this.startBoard = new Uint8Array(this.solverBoard);
    this.userBoard = new Uint8Array(this.solverBoard);
  }

  /**
   * Create copy of this.board and its masks.
   *
   * @returns A copy of this.board and its masks.
   */
  public copyBoard(): [Uint8Array, Int32Array, Int32Array, Int32Array, Int32Array] {
    const boardCopy = new Uint8Array(this.solverBoard);
    const pencilMarksCopy = new Int32Array(this.pencilMarks);
    const rowMasksCopy = new Int32Array(this.rowMasks);
    const colMasksCopy = new Int32Array(this.colMasks);
    const boxMasksCopy = new Int32Array(this.boxMasks);

    return [boardCopy, pencilMarksCopy, rowMasksCopy, colMasksCopy, boxMasksCopy];
  }

  /**
   * Reset the internal board to the start state.
   *
   * @param boardState - boardState and masks to revert to.
   */
  public resetBoard(boardInfo: [Uint8Array, Int32Array, Int32Array, Int32Array, Int32Array]) {
    const board = boardInfo[0];
    const pencilMarks = boardInfo[1];
    const rowMasks = boardInfo[2];
    const colMasks = boardInfo[3];
    const boxMasks = boardInfo[4];
    this.solverBoard = new Uint8Array(board);
    this.pencilMarks = new Int32Array(pencilMarks);
    this.rowMasks = new Int32Array(rowMasks);
    this.colMasks = new Int32Array(colMasks);
    this.boxMasks = new Int32Array(boxMasks);
  }

  /**
   * Initialize the masks used to check for isValidMove.
   */
  private initializeMasks() {
    this.rowMasks = new Int32Array(9).fill(0);
    this.colMasks = new Int32Array(9).fill(0);
    this.boxMasks = new Int32Array(9).fill(0);

    for (let i = 0; i < this.solverBoard.length; i++) {
      const num = this.solverBoard[i]!;
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
   * Initialize the pencil marks.
   */
  private initializePencilMarks() {
    this.pencilMarks = new Int32Array(81).fill(0);

    for (let i = 0; i < this.solverBoard.length; i++) {
      if (this.solverBoard[i] === 0) {
        const row = Math.trunc(i / 9);
        const col = i % 9;
        const box = this.getBoxIndex(row, col);

        const taken = this.rowMasks[row]! | this.colMasks[col]! | this.boxMasks[box]!;
        // make sure only the relevant 9 bits can be active
        this.pencilMarks[i] = ~taken & 0b1111111110;
      }
    }
  }

  /**
   * Add number to board and update cache.
   *
   * @param idx - index where num will be placed.
   * @param num - number that will be placed.
   */
  private placeNumber(idx: number, num: number, updatePencilMarks: boolean = false) {
    const row = Math.trunc(idx / 9);
    const col = idx % 9;
    const box = this.getBoxIndex(row, col);

    this.solverBoard[idx] = num;

    const bit = 1 << num;
    this.rowMasks[row]! |= bit;
    this.colMasks[col]! |= bit;
    this.boxMasks[box]! |= bit;
    if (updatePencilMarks) {
      this.pencilMarks[idx] = 0;
      this.updateNeighborPencilMarks(row, col, box, bit, false);
    }
  }

  /**
   * Remove number from board and update cache.
   *
   * @param idx - index where num will be removed.
   * @param num - number that will be removed.
   */
  private removeNumber(idx: number, num: number, updatePencilMarks: boolean = false) {
    const row = Math.trunc(idx / 9);
    const col = idx % 9;
    const box = this.getBoxIndex(row, col);

    this.solverBoard[idx] = 0;

    const bit = 1 << num;
    this.rowMasks[row]! &= ~bit;
    this.colMasks[col]! &= ~bit;
    this.boxMasks[box]! &= ~bit;
    if (updatePencilMarks) {
      const taken = this.rowMasks[row]! | this.colMasks[col]! | this.boxMasks[box]!;
      // make sure only the relevant 9 bits can be active
      this.pencilMarks[idx] = ~taken & 0b1111111110;
      this.updateNeighborPencilMarks(row, col, box, bit, true);
    }
  }

  private updateNeighborPencilMarks(
    row: number,
    col: number,
    box: number,
    bit: number,
    add: boolean,
  ) {
    const startRow = Math.trunc(box / 3) * 3;
    const startCol = (box % 3) * 3;

    for (let i = 0; i < 9; i++) {
      const rowIdx = row * 9 + i;
      const colIdx = i * 9 + col;
      const boxRow = startRow + Math.trunc(i / 3);
      const boxCol = startCol + (i % 3);
      const boxIdx = boxRow * 9 + boxCol;

      this.updateCellPencilMarks(rowIdx, row, col, box, bit, add);
      this.updateCellPencilMarks(colIdx, row, col, box, bit, add);
      this.updateCellPencilMarks(boxIdx, row, col, box, bit, add);
    }
  }

  private updateCellPencilMarks(
    idx: number,
    row: number,
    col: number,
    box: number,
    bit: number,
    add: boolean,
  ) {
    if (this.solverBoard[idx] !== 0) return;

    if (add) {
      const taken = this.rowMasks[row]! | this.colMasks[col]! | this.boxMasks[box]!;
      if ((taken & bit) === 0) this.pencilMarks[idx]! |= bit;
    } else {
      this.pencilMarks[idx]! &= ~bit;
    }
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
   * @returns The solved board state or null if there is none.
   */
  public solve(): Uint8Array | null {
    const solveInner = (): boolean => {
      const idx = this.solverBoard.indexOf(0);
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

    this.solverBoard = new Uint8Array(this.userBoard);
    this.initializeMasks();

    return solveInner() ? this.solverBoard : null;
  }

  /**
   * Check if there is only one solution for boardState.
   *
   * @returns true if single solution, false otherwise.
   */
  private singleSolution(): boolean {
    const singleSolutionInner = (acc: number): number => {
      const idx = this.solverBoard.indexOf(0);
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

  /**
   * Get the candidate numbers that can be filled into boardState at index idx.
   *
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
   * @returns true if the boardState is solved, false otherwise.
   */
  private solved() {
    return !this.solverBoard.includes(0);
  }

  /**
   * Find a naked single.
   *
   * @returns The index of the naked single, -1 if none were found, and the
   *          number that can be inserted.
   */
  private findNakedSingle(): [StepType, number, number] {
    for (let idx = 0; idx < this.solverBoard.length; idx++) {
      if (this.solverBoard[idx] !== 0) {
        continue;
      }

      const marks = this.pencilMarks[idx]!;
      // (n & (n - 1)) === 0 means that it only has 1 active bit
      // 8: 1000
      // 8 - 1: 0111
      // n & (n - 1) -> 1000 & 0111 = 0
      if (marks > 0 && (marks & (marks - 1)) === 0) {
        return [StepType.NAKEDSINGLE, idx, locActiveBit(marks)];
      }
    }

    return [StepType.NAKEDSINGLE, -1, 0];
  }

  /**
   * Find a hidden single.
   *
   * @returns The index of the hiddne single, -1 if none were found, and the
   *          number that can be inserted.
   */
  private findHiddenSingle(): [StepType, number, number] {
    let [idx, num] = [0, 0];

    // check rows
    for (let i = 0; i < 9; i++) {
      const arrStart = i * 9;
      const row = Array.from({ length: 9 }, (_, j) => arrStart + j);

      [idx, num] = this.findHiddenSingleGroup(row);
      if (idx !== -1) return [StepType.HIDDENSINGLE, idx, num];
    }

    // check columns
    for (let i = 0; i < 9; i++) {
      const col = Array.from({ length: 9 }, (_, j) => j * 9 + i);

      [idx, num] = this.findHiddenSingleGroup(col);
      if (idx !== -1) return [StepType.HIDDENSINGLE, idx, num];
    }

    // check boxes
    for (let i = 0; i < 9; i++) {
      const startRow = Math.trunc(i / 3) * 3;
      const startCol = (i % 3) * 3;
      const box = Array.from(
        { length: 9 },
        (_, j) => (startRow + Math.trunc(j / 3)) * 9 + (startCol + (j % 3)),
      );

      [idx, num] = this.findHiddenSingleGroup(box);
      if (idx !== -1) return [StepType.HIDDENSINGLE, idx, num];
    }

    return [StepType.HIDDENSINGLE, -1, 0];
  }

  /**
   * Find a hidden single in an array.
   *
   * @param groupIndices - The group in which to search for a hidden single.
   * @returns The index of the hidden single, -1 if none were found, and the
   *          number that can be inserted.
   */
  private findHiddenSingleGroup(groupIndices: number[]): [number, number] {
    let all = 0;
    let duplicate = 0;

    for (const idx of groupIndices) {
      if (this.solverBoard[idx] !== 0) continue;

      const cellPencilMarks = this.pencilMarks[idx]!;

      duplicate |= all & cellPencilMarks;
      all |= cellPencilMarks;
    }

    const unique = all & ~duplicate;

    if (unique !== 0) {
      for (const idx of groupIndices) {
        if (this.solverBoard[idx] !== 0) continue;

        const foundBit = this.pencilMarks[idx]! & unique;
        if (foundBit !== 0) return [idx, locActiveBit(foundBit)];
      }
    }

    return [-1, 0];
  }

  private findNakedPair(): [StepType, number, number] {
    return [StepType.NAKEDPAIR, -1, 0];
  }

  /**
   * Find a sequence of moves based on logic (naked singles/doubles, hidden singles, etc.) that solves a puzzle.
   *
   * @param boardState - The boardState to solve.
   * @returns Sequence of moves that solves the puzzle, null if none exists.
   */
  public logicSolve(): [StepType, number, number][] | null {
    this.solverBoard = new Uint8Array(this.userBoard);
    this.initializeMasks();
    this.initializePencilMarks();

    // (step type, index, candidate)
    const solution: [StepType, number, number][] = [];
    while (!this.solved()) {
      // level 1:
      // - naked singles
      let step = this.findNakedSingle();
      if (step[1] != -1) {
        solution.push(step);
        this.placeNumber(step[1], step[2], true);
        continue;
      }

      // - hidden singles
      step = this.findHiddenSingle();
      if (step[1] != -1) {
        solution.push(step);
        this.placeNumber(step[1], step[2], true);
        continue;
      }

      // level 2:
      // - naked pairs
      step = this.findNakedPair();
      if (step[1] != -1) {
        solution.push(step);
        this.placeNumber(step[1], step[2], true);
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

      return null;
    }

    console.log();
    console.log(this.toString(this.solverBoard));
    console.log();

    return solution;
  }

  toString(boardState?: Uint8Array): string {
    if (boardState === undefined) {
      boardState = this.userBoard;
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
