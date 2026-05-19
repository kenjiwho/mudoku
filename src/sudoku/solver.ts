const sampleBoard = [
  3, 7, 4, 2, 6, 1, 0, 0, 5, 0, 0, 0, 8, 0, 3, 1, 0, 4, 0, 8, 0, 4, 5, 9, 7, 3, 2, 0, 2, 0, 6, 0, 0,
  9, 1, 0, 7, 6, 9, 1, 0, 4, 3, 5, 0, 5, 0, 3, 0, 0, 0, 2, 4, 6, 0, 4, 0, 5, 0, 0, 0, 7, 0, 0, 0, 0,
  3, 4, 8, 0, 0, 1, 0, 3, 0, 7, 1, 0, 0, 0, 0,
];

function printBoard(boardState: number[]) {
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
    const seen = new Array(10).fill(false);

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
    column.push(boardState[idx]);
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
      group.push(boardState[idx_]);
    }
  }
  if (checkDuplicate(column)) {
    return false;
  }

  return true;
}

/**
 * Count solutions to a given sudoku boardState.
 *
 * @param boardState - The sudoku to be solved.
 * @returns The solved board state or null if there is none.
 */
function solve(boardState: number[]): number[] | null {
  function solveInner(boardState: number[]): boolean {
    const idx = boardState.indexOf(0);

    if (idx < 0) {
      return true;
    }

    if (boardState[idx] === undefined) {
      boardState[idx] = 0;
    }

    boardState[idx]++;

    // should first validate and then next solve recursion
    while (!validate(boardState, idx) || !solveInner(boardState)) {
      boardState[idx]++;
      if (boardState[idx] > 9) {
        boardState[idx] = 0;
        return false;
      }
    }
    return true;
  }

  const boardCopy = Object.assign([], boardState);

  const result = solveInner(boardCopy);

  if (result) return boardCopy;

  return null;
}

/**
 * Check if there is only one solution for boardState.
 *
 * @param boardState - The sudoku to be solved.
 * @returns true if single solution, false otherwise.
 */
function singleSolution(boardState: number[]): boolean {
  function singleSolutionInner(boardState: number[], acc: number): number {
    const idx = boardState.indexOf(0);

    if (idx < 0) {
      return acc + 1;
    }

    if (boardState[idx] === undefined) {
      boardState[idx] = 0;
    }

    boardState[idx]++;

    while (true) {
      if (validate(boardState, idx)) {
        acc = singleSolutionInner(boardState, acc);
        // if more than 1 solution found, immediately return
        if (acc > 1) return acc;
      }

      boardState[idx]++;
      if (boardState[idx] > 9) {
        boardState[idx] = 0;
        return acc;
      }
    }
  }

  const boardCopy = Object.assign([], boardState);

  return singleSolutionInner(boardCopy, 0) == 1;
}

const solved = solve(sampleBoard);
if (solved === null) {
  throw 'NO SOLUTION';
}
printBoard(sampleBoard);
printBoard(solved);

console.log(singleSolution(sampleBoard));
