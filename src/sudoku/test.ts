import { Board } from './board';
import { Generator } from './generator';

import initWasm from '../assets/sudoku.wasm?init';

interface SudokuApi {
  add(a: number, b: number): number;
}

let wasmEngine: SudokuApi | null = null;

export async function initSudokuEngine(): Promise<SudokuApi> {
  if (wasmEngine) return wasmEngine;

  try {
    const wasmModule = await initWasm();
    wasmEngine = wasmModule.exports as unknown as SudokuApi;

    console.log('⚡ Native Zig Sudoku Engine Ready!');
    return wasmEngine;
  } catch (error) {
    console.error('Failed to load WebAssembly Sudoku engine:', error);
    return error;
  }
}

export function getEngine() {
  if (!wasmEngine) throw new Error('Sudoku engine has not been initialized yet!');
  return wasmEngine;
}

// const engine = await initSudokuEngine();
// const result = engine.add(1, 2);
// console.log(result);
// process.exit();
//
// let sampleBoard = [
//   3, 7, 4, 2, 6, 1, 0, 0, 5, 0, 0, 0, 8, 0, 3, 1, 0, 4, 0, 8, 0, 4, 5, 9, 7, 3, 2, 0, 2, 0, 6, 0, 0,
//   9, 1, 0, 7, 6, 9, 1, 0, 4, 3, 5, 0, 5, 0, 3, 0, 0, 0, 2, 4, 6, 0, 4, 0, 5, 0, 0, 0, 7, 0, 0, 0, 0,
//   3, 4, 8, 0, 0, 1, 0, 3, 0, 7, 1, 0, 0, 0, 0,
// ];
//
// const generator = new Generator();
//
// const board = generator.generate();
//
// const sudoku = new Board(board);
//
// console.log(sudoku.toString());
