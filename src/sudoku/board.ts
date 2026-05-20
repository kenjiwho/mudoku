import { Generator } from './generator';
import { Solver } from './solver';

export class Board {
  public board: Uint8Array;
  public readonly startBoard: Uint8Array;

  private generator = new Generator();
  private solver = new Solver();

  public pencilMarks: Int32Array = new Int32Array(81).fill(0);

  constructor(board?: Uint8Array) {
    if (board !== undefined) {
      this.board = new Uint8Array(board);
    } else {
      this.board = this.generator.generate();
    }

    this.startBoard = new Uint8Array(this.board);
    this.board = new Uint8Array(this.board);
  }

  public solve() {
    return this.solver.solve(this.board);
  }

  public logicSolve() {
    return this.solver.logicSolve(this.board);
  }

  toString(boardState?: Uint8Array): string {
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
