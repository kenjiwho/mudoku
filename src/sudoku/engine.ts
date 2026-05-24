import initWasm from '../assets/sudoku.wasm?init';

export interface SudokuApi {
  memory: WebAssembly.Memory;
  getBoardPointer(): number;
  generate(seed: bigint): void;
}

let sudokuEngine: SudokuApi | null = null;

export async function initSudokuEngine(): Promise<SudokuApi> {
  if (sudokuEngine) return sudokuEngine;

  try {
    const wasmModule = await initWasm();
    sudokuEngine = wasmModule.exports as unknown as SudokuApi;

    console.log('Sudoku engine loaded.');
    return sudokuEngine;
  } catch (error) {
    console.error('Failed to load WebAssembly Sudoku engine:', error);
    throw error;
  }
}

export function getBoard(): number[] {
  if (!sudokuEngine) throw new Error('Sudoku engine has not been initialized yet!');

  const pointer = sudokuEngine.getBoardPointer();
  const memoryView = new Uint8Array(sudokuEngine.memory.buffer, pointer, 81);

  return Array.from(memoryView);
}
