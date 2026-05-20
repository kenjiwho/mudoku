import { shuffle } from './helper';

export enum StepType {
  NAKEDSINGLE,
  HIDDENSINGLE,
  NAKEDPAIR,
  HIDDENPAIR,
}

export class Sudoku {
  public board: number[];

  constructor() {
    this.board = this.generate();
  }

  toString(boardState: number[] | undefined): string {
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

  /**
   * Generate a random sudoku puzzle.
   *
   * @returns The array representing the board state of the sudoku puzzle.
   */
  private generate(): number[] {
    const randomBoard = Array<number>(81).fill(0);

    const generateInner = (boardState: number[]): boolean => {
      const idx = boardState.indexOf(0);
      if (idx == -1) return true;

      for (const num of shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])) {
        if (this.isValidMove(boardState, idx, num)) {
          boardState[idx] = num;
          if (generateInner(boardState)) return true;
        }
      }
      boardState[idx] = 0;
      return false;
    };
    generateInner(randomBoard);

    const indexes = shuffle(Array.from({ length: 81 }, (_, i) => i));
    for (const idx of indexes) {
      const val: number = randomBoard[idx]!;
      randomBoard[idx] = 0;

      if (!this.singleSolution(randomBoard)) {
        randomBoard[idx] = val;
      }
    }

    return randomBoard;
  }

  /**
   * Give a solution to a sudoku boardState.
   *
   * @param boardState - The sudoku to be solved.
   * @returns The solved board state or null if there is none.
   */
  public solve(): number[] | null {
    const solveInner = (boardState: number[]): boolean => {
      const idx = boardState.indexOf(0);
      if (idx == -1) return true;

      for (const num of shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])) {
        if (this.isValidMove(boardState, idx, num)) {
          boardState[idx] = num;
          if (solveInner(boardState)) return true;
        }
      }
      boardState[idx] = 0;
      return false;
    };

    const boardCopy = [...this.board];
    return solveInner(boardCopy) ? boardCopy : null;
  }

  /**
   * Check if there is only one solution for boardState.
   *
   * @param boardState - The sudoku to be solved.
   * @returns true if single solution, false otherwise.
   */
  private singleSolution(boardState: number[]): boolean {
    const singleSolutionInner = (boardState: number[], acc: number): number => {
      const idx = boardState.indexOf(0);
      if (idx == -1) return acc + 1;

      for (let num = 1; num <= 9; num++) {
        if (this.isValidMove(boardState, idx, num)) {
          boardState[idx] = num;
          acc = singleSolutionInner(boardState, acc);
          // if more than 1 solution found, immediately return
          if (acc > 1) {
            boardState[idx] = 0;
            return acc;
          }
        }
      }
      boardState[idx] = 0;
      return acc;
    };

    const boardCopy = [...boardState];

    return singleSolutionInner(boardCopy, 0) == 1;
  }

  /**
   * Checks if a board is valid from the perspective of cell idx.
   *
   * @param boardState - The boardState in question.
   * @param idx - The index of the cell that will be validated.
   * @param num - The number to fill into cell idx.
   * @returns true if the board state is valid, false otherwise
   */
  private isValidMove(boardState: number[], idx: number, num: number): boolean {
    const row = Math.trunc(idx / 9);
    const col = idx % 9;

    const startRow = Math.trunc(row / 3) * 3;
    const startCol = Math.trunc(col / 3) * 3;

    for (let i = 0; i < 9; i++) {
      // 1. Check Row
      if (boardState[row * 9 + i] === num) return false;

      // 2. Check Column
      if (boardState[i * 9 + col] === num) return false;

      // 3. Check 3x3 Box
      const boxRow = startRow + Math.trunc(i / 3);
      const boxCol = startCol + (i % 3);
      if (boardState[boxRow * 9 + boxCol] === num) return false;
    }

    return true;
  }

  /**
   * Get the candidate numbers that can be filled into boardState at index idx.
   *
   * @param boardState - The boardState in quesiton.
   * @param idx - The index to search for candidates.
   * @returns An array of candidates.
   */
  private getCandidates(boardState: number[], idx: number): number[] {
    const candidates: number[] = [];
    for (let num = 1; num <= 9; num++) {
      if (this.isValidMove(boardState, idx, num)) {
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
  private solved(boardState: number[]) {
    return !boardState.includes(0);
  }

  /**
   * Find a naked single.
   *
   * @param boardState - The boardState to check.
   * @returns The index of the naked single, -1 if none were found, and the number
   *          that can be inserted.
   */
  private findNakedSingle(boardState: number[]): [StepType, number, number] {
    for (let idx = 0; idx < boardState.length; idx++) {
      if (boardState[idx] != 0) {
        continue;
      }

      const candidates = this.getCandidates(boardState, idx);

      if (candidates.length == 1) {
        return [StepType.NAKEDSINGLE, idx, candidates[0]!];
      }
    }

    return [StepType.NAKEDSINGLE, -1, 0];
  }

  private findHiddenSingle(boardState: number[]): [StepType, number, number] {
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
        if (boardState[rowIdx] === 0) {
          const candidates = this.getCandidates(boardState, rowIdx);
          for (const num of candidates) {
            rowCounts[num]++;
            rowLastSeen[num] = rowIdx;
          }
        }

        // 2. Check Column
        const colIdx = i * 9 + col;
        if (boardState[colIdx] === 0) {
          const candidates = this.getCandidates(boardState, colIdx);
          for (const num of candidates) {
            colCounts[num]++;
            colLastSeen[num] = colIdx;
          }
        }

        // 3. Check 3x3 Box
        const boxRow = startRow + Math.trunc(i / 3);
        const boxCol = startCol + (i % 3);
        const boxIdx = boxRow * 9 + boxCol;
        if (boardState[boxIdx] === 0) {
          const candidates = this.getCandidates(boardState, boxIdx);
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

  private findNakedPair(boardState: number[]): [StepType, number, number] {
    return [StepType.NAKEDPAIR, -1, 0];
  }

  /**
   * Find a sequence of moves based on logic (naked singles/doubles, hidden singles, etc.) that solves a puzzle.
   *
   * @param boardState - The boardState to solve.
   * @returns Sequence of moves that solves the puzzle.
   */
  public logicSolve() {
    const boardCopy = [...this.board];

    // (step type, index, candidate)
    const solution: [StepType, number, number][] = [];
    while (!this.solved(boardCopy)) {
      // level 1:
      // - naked singles
      let step = this.findNakedSingle(boardCopy);
      if (step[1] != -1) {
        solution.push(step);
        boardCopy[step[1]] = step[2];
        continue;
      }

      // - hidden singles
      step = this.findHiddenSingle(boardCopy);
      if (step[1] != -1) {
        solution.push(step);
        boardCopy[step[1]] = step[2];
        continue;
      }

      // level 2:
      // - naked pairs
      step = this.findNakedPair(boardCopy);
      if (step[1] != -1) {
        solution.push(step);
        boardCopy[step[1]] = step[2];
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

    return solution;
  }
}
