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
function validate(boardState: number[], idx: number): boolean {
  const x = idx % 9;
  const y = Math.trunc(idx / 9);

  /**
   * Check if there are duplicates in an array of numbers.
   */
  function checkDuplicate(arr: number[]): boolean {
    const seen = new Array<boolean>(10).fill(false);

    for (let i = 0; i < arr.length; i++) {
      const num = arr[i];
      if (num === undefined) {
        return false;
      }

      if (num == 0) continue;

      if (seen[num]) {
        return true;
      }

      seen[num] = true;
    }

    return false;
  }

  // check row
  const rowStart = y * 9;
  const row = boardState.slice(rowStart, rowStart + 9);
  if (checkDuplicate(row)) {
    return false;
  }

  // check column
  const column: number[] = [];
  for (let y_ = 0; y_ < 9; y_++) {
    const idx = y_ * 9 + x;
    column.push(boardState[idx]!);
  }
  if (checkDuplicate(column)) {
    return false;
  }

  // check group
  const group: number[] = [];
  const groupX = Math.trunc(x / 3);
  const groupY = Math.trunc(y / 3);

  const startIdx = groupY * 27 + groupX * 3;
  for (let y_ = 0; y_ < 3; y_++) {
    for (let x_ = 0; x_ < 3; x_++) {
      const idx_ = startIdx + y_ * 9 + x_;
      group.push(boardState[idx_]!);
    }
  }
  if (checkDuplicate(group)) {
    return false;
  }

  return true;
}

function getCandidates(boardState: number[], idx: number): number[] {
  const candidates: number[] = [];
  for (let num = 1; num <= 9; num++) {
    boardState[idx] = num;
    if (validate(boardState, idx)) {
      candidates.push(num);
    }
  }
  boardState[idx] = 0;
  return candidates;
}

/**
 * Find the empty cell with the fewest valid candidates (MRV heuristic).
 * Returns null if the board is solved, or an object with the chosen
 * cell index and its candidate list.
 */
function findBestCell(boardState: number[]): { idx: number; candidates: number[] } | null {
  let bestIdx = -1;
  let bestCandidates: number[] = [];

  for (let i = 0; i < 81; i++) {
    if (boardState[i] === 0) {
      const candidates = getCandidates(boardState, i);
      if (candidates.length === 0) return { idx: i, candidates: [] }; // dead end
      if (candidates.length === 1) return { idx: i, candidates }; // forced move
      if (bestIdx === -1 || candidates.length < bestCandidates.length) {
        bestIdx = i;
        bestCandidates = candidates;
      }
    }
  }

  if (bestIdx === -1) return null; // solved
  return { idx: bestIdx, candidates: bestCandidates };
}

/**
 * Give a solution to a sudoku boardState.
 *
 * @param boardState - The sudoku to be solved.
 * @returns The solved board state or null if there is none.
 */
export function solve(boardState: number[]): number[] | null {
  function solveInner(boardState: number[]): boolean {
    const best = findBestCell(boardState);
    if (best === null) return true;
    if (best.candidates.length === 0) return false;

    const idx = best.idx;
    const shuffledNums = shuffle([...best.candidates]);
    let currNum = 0;
    boardState[idx] = shuffledNums[currNum];

    for (const num of shuffle([...best.candidates])) {
      boardState[idx] = num;
      if (solveInner(boardState)) return true;
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
    const best = findBestCell(boardState);
    if (best === null) return acc + 1;
    if (best.candidates.length === 0) return acc;

    const idx = best.idx;

    for (const num of best.candidates) {
      boardState[idx] = num;
      acc = singleSolutionInner(boardState, acc);
      // if more than 1 solution found, immediately return
      if (acc > 1) {
        boardState[idx] = 0;
        return acc;
      }
    }
    boardState[idx] = 0;
    return acc;
  }

  const boardCopy = Object.assign([], boardState);

  return singleSolutionInner(boardCopy, 0) == 1;
}
