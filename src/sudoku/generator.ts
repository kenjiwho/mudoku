import { solve, singleSolution, printBoard } from './solver';
import { shuffle } from './helper';

enum Difficulty {
  EASY,
  NORMAL,
  HARD,
}

/**
 * Generate a random sudoku puzzle.
 *
 * @returns The array representing the board state of the sudoku puzzle.
 */
function generate(difficulty: Difficulty): number[] {
  // Easy: ~38 to 42 clues
  // Medium: ~30 to 35 clues
  // Hard: ~24 to 28 clues
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

const randomBoard = generate(Difficulty.EASY);

printBoard(randomBoard);
