import { solve, singleSolution, printBoard } from './solver';
import { shuffle } from './helper';

/**
 * Generate a random sudoku puzzle.
 *
 * @returns The array representing the board state of the sudoku puzzle.
 */
function generate(): number[] {
  const zeros = Array<number>(81).fill(0);
  const randomBoard = solve(zeros)!;
  const indexes = shuffle(Array.from({ length: 81 }, (_, i) => i));

  for (const idx of indexes) {
    const val: number = randomBoard[idx]!;
    randomBoard[idx] = 0;

    if (!singleSolution(randomBoard)) {
      randomBoard[idx] = val;
    }
  }

  return randomBoard;
}

const randomBoard = generate();

printBoard(randomBoard);
