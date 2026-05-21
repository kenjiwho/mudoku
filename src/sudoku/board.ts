import { Generator } from './generator';
import { Solver, StepType } from './solver';

export class Board {
  public board: number[];
  public initialClues: boolean[];

  private generator = new Generator();
  private solver = new Solver();

  public pencilMarks: Int32Array = new Int32Array(81).fill(0);

  constructor(board?: number[]) {
    if (board !== undefined) {
      this.board = board;
    } else {
      this.board = this.generator.generate();
    }

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
  public placeNumber(idx: number, num: number) {
    if (this.initialClues[idx]) {
      return false;
    }
    this.board[idx] = num;
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
    this.board[idx] = 0;
    return true;
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
