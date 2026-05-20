import { shuffle } from './helper';

export function printBoard(boardState: number[]) {
  for (let i = 0; i < 9; i++) {
    console.log(boardState.slice(i * 9, i * 9 + 9));
  }
  console.log();
}

/**
 * Checks if a board is valid from the perspective of cell idx.
 *
 * @param boardState - The boardState in question.
 * @param idx - The index of the cell that will be validated.
 * @param num - The number to fill into cell idx.
 * @returns true if the board state is valid, false otherwise
 */
function isValidMove(boardState: number[], idx: number, num: number): boolean {
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
 * Give a solution to a sudoku boardState.
 *
 * @param boardState - The sudoku to be solved.
 * @returns The solved board state or null if there is none.
 */
export function solve(boardState: number[]): number[] | null {
  function solveInner(boardState: number[]): boolean {
    const idx = boardState.indexOf(0);
    if (idx == -1) return true;

    for (const num of shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])) {
      if (isValidMove(boardState, idx, num)) {
        boardState[idx] = num;
        if (solveInner(boardState)) return true;
      }
    }
    boardState[idx] = 0;
    return false;
  }

  const boardCopy = [...boardState];
  return solveInner(boardCopy) ? boardCopy : null;
}

/**
 * Check if there is only one solution for boardState.
 *
 * @param boardState - The sudoku to be solved.
 * @returns true if single solution, false otherwise.
 */
export function singleSolution(boardState: number[]): boolean {
  function singleSolutionInner(boardState: number[], acc: number): number {
    const idx = boardState.indexOf(0);
    if (idx == -1) return acc + 1;

    for (let num = 1; num <= 9; num++) {
      if (isValidMove(boardState, idx, num)) {
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
  }

  const boardCopy = [...boardState];

  return singleSolutionInner(boardCopy, 0) == 1;
}

/**
 * Checks if a boardState is solved.
 *
 * @params - The boardState to check.
 * @returns true if the boardState is solved, false otherwise.
 */
function solved(boardState: number[]) {
  return !boardState.includes(0);
}

/**
 * Get the candidate numbers that can be filled into boardState at index idx.
 *
 * @param boardState - The boardState in quesiton.
 * @param idx - The index to search for candidates.
 * @returns An array of candidates.
 */
function getCandidates(boardState: number[], idx: number): number[] {
  const candidates: number[] = [];
  for (let num = 1; num <= 9; num++) {
    if (isValidMove(boardState, idx, num)) {
      candidates.push(num);
    }
  }
  return candidates;
}

/**
 * Find a naked single.
 *
 * @param boardState - The boardState to check.
 * @returns The index of the naked single, -1 if none were found, and the number
 *          that can be inserted.
 */
function findNakedSingle(boardState: number[]): [number, number] {
  for (let idx = 0; idx < boardState.length; idx++) {
    if (boardState[idx] != 0) {
      continue;
    }

    const candidates = getCandidates(boardState, idx);

    if (candidates.length == 1) {
      return [idx, candidates[0]!];
    }
  }

  return [-1, 0];
}

/**
 * Find a sequence of moves based on logic (naked singles/doubles, hidden singles, etc.) that solves a puzzle.
 *
 * @param boardState - The boardState to solve.
 * @returns Sequence of moves that solves the puzzle.
 */
export function logicSolve(boardState: number[]) {
  const boardCopy = [...boardState];

  while (!solved(boardCopy)) {
    // level 1:
    // - naked singles
    const [idx, candidate] = findNakedSingle(boardCopy);
    if (idx != -1) {
      boardCopy[idx] = candidate;
    }

    // - hidden singles

    // level 2:
    // - pointing pairs/pointing triples
    // - box/line reduction
    //
    // level 3:
    // - naked pairs
    // - naked triples/quads
    // - hidden pairs
    // - hidden triples/quads
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
  }

  printBoard(boardCopy);
}
