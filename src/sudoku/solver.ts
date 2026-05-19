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
