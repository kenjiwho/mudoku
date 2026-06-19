import initWasm from '../assets/bin/sudoku.wasm?init';
import { randomU64 } from '../helper';

interface SudokuApi {
  memory: WebAssembly.Memory;
  getBoardPointer(): number;
  generate(seed: bigint): void;
}

let sudokuEngine: SudokuApi | null = null;

export async function initSudokuEngine() {
  if (sudokuEngine) return;

  try {
    const wasmModule = await initWasm();
    sudokuEngine = wasmModule.exports as unknown as SudokuApi;

    console.log('Sudoku engine loaded.');
  } catch (error) {
    console.error('Failed to load WebAssembly Sudoku engine:', error);
    throw error;
  }
}

function getBoard(): number[] {
  if (!sudokuEngine) throw new Error('Sudoku engine has not been initialized yet!');

  const pointer = sudokuEngine.getBoardPointer();
  const memoryView = new Uint8Array(sudokuEngine.memory.buffer, pointer, 81);

  return Array.from(memoryView);
}

export function generate(): number[] {
  if (!sudokuEngine) throw new Error('Sudoku engine has not been initialized yet!');

  sudokuEngine.generate(randomU64());

  return getBoard();
}
