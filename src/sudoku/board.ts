import { getBoxIndex, unionInplace } from './helper';
import { Solver, StepType } from './solver';

export class Board {
  public board: number[];
  public initialClues: boolean[];
  public mistakes = new Set<number>();
  public pencilMarks: number[] = Array(81).fill(0);

  private solver = new Solver();

  constructor(board: number[]) {
    this.board = board;

    this.initialClues = Array.from(this.board).map(
      (val: number, _idx: number, _arr: number[]) => val > 0,
    );
  }

  /**
   * Place a number on the board.
   *
   * @param idx - The index where to place the number.
   * @param num - The number to place
   * @returns true if success, false otherwise.
   */
  public placeNumber(idx: number, num: number, pencil: boolean = false) {
    if (this.initialClues[idx]) {
      return false;
    }
    if (pencil) {
      // Do not toggle mark if board has a number in it
      if (this.board[idx] !== 0) return false;
      const bit = 1 << num;
      this.pencilMarks[idx]! ^= bit; // toggle mark on or off
      return true;
    }

    this.board[idx] = num;
    // remove all marks after placing number
    this.pencilMarks[idx] = 0;
    this.evalMistakes();
    return true;
  }

  /**
   * Remove a number on the board.
   *
   * @param idx - The index where to remove a number.
   * @returns true if success, false otherwise.
   */
  public removeNumber(idx: number) {
    if (this.initialClues[idx]) {
      return false;
    }
    // Always remove everything.
    if (this.board[idx] !== 0) {
      this.board[idx] = 0;
      this.evalMistakes();
      return true;
    } else {
      this.pencilMarks[idx] = 0;
      return true;
    }
  }

  /**
   * Place pencil marks on the board.
   *
   * @param idx - The index where to place pencil marks.
   * @param marks - The pencil marks to place.
   */
  public placePencilMarks(idx: number, marks: number) {
    this.pencilMarks[idx] = marks;
  }

  /**
   * Add the mistakes for a specific index and number.
   *
   * @param idx - Index of num.
   * @param num - The number on the board.
   */
  private addMistakes(set: Set<number>, idx: number, num: number) {
    const row = Math.trunc(idx / 9);
    const col = idx % 9;
    const box = getBoxIndex(row, col);
    const boxStartRow = Math.trunc(box / 3) * 3;
    const boxStartCol = (box % 3) * 3;

    for (let i = 0; i < 9; i++) {
      const rowIdx = row * 9 + i;
      const colIdx = i * 9 + col;
      const boxIdx = (boxStartRow + Math.trunc(i / 3)) * 9 + (boxStartCol + (i % 3));

      for (const groupIdx of [rowIdx, colIdx, boxIdx]) {
        // ignore self
        if (groupIdx === idx) {
          continue;
        }
        if (this.board[groupIdx]! === num) {
          set.add(groupIdx);
          set.add(idx);
        }
      }
    }
  }

  /**
   * Check mistakes were solved by removing a number.
   *
   * This performs a full re-evaluation of the board.
   */
  private evalMistakes() {
    const mistakes = new Set<number>();

    for (const [idx, num] of this.board.entries()) {
      // ignore if no number entered
      if (num === 0) {
        continue;
      }
      this.addMistakes(mistakes, idx, num);
    }

    this.mistakes.clear();
    for (const idx of mistakes) {
      this.mistakes.add(idx);
    }
  }

  /**
   * Solve sudoku with the solver using backtracking.
   */
  public solve(): number[] | null {
    return this.solver.solve(this.board);
  }

  /**
   * Solve sudoku with the solver using logic and inference.
   */
  public logicSolve(): [StepType, number, number][] | null {
    return this.solver.logicSolve(this.board);
  }

  toString(boardState?: number[]): string {
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
