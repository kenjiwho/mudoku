import initWasm from '../assets/sudoku.wasm?init';

export interface SudokuApi {
  memory: WebAssembly.Memory;
  getBoardPointer(): number;
  generate(seed: bigint): void;
}

let wasmEngine: SudokuApi | null = null;

export async function initSudokuEngine(): Promise<SudokuApi> {
  if (wasmEngine) return wasmEngine;

  try {
    const wasmModule = await initWasm();
    wasmEngine = wasmModule.exports as unknown as SudokuApi;

    console.log('Sudoku engine loaded.');
    return wasmEngine;
  } catch (error) {
    console.error('Failed to load WebAssembly Sudoku engine:', error);
    throw error;
  }
}

export function getBoardView(): Uint8Array {
  if (!wasmEngine) throw new Error('Sudoku engine has not been initialized yet!');

  const pointer = wasmEngine.getBoardPointer();
  return new Uint8Array(wasmEngine.memory.buffer, pointer, 81);
}
