/**
 * Randomly shuffle array.
 */
export function shuffle<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i]!;
    array[i] = array[j]!;
    array[j] = temp;
  }
  return array;
}

/**
 * Kernighan popcount.
 */
export function popcount(n: number): number {
  let count = 0;
  while (n !== 0) {
    n &= n - 1;
    count++;
  }
  return count;
}

export function dec2bin(dec: number): string {
  return (dec >>> 0).toString(2);
}

export function locActiveBit(bit: number): number {
  // 31 - Math.clz32(bit) gets the position of the active bit
  // 8: 1000 -> 3
  return 31 - Math.clz32(bit);
}

/**
 * Generate and return a random U64 integer.
 */
export function randomU64(): bigint {
  const arr = new BigUint64Array(1);
  crypto.getRandomValues(arr);
  return arr[0]!;
}

/**
 * Calculate which box a cell belongs to.
 *
 * @param row - Row of cell.
 * @param col - Col of cell.
 * @returns The box index the cell belongs to.
 */
export function getBoxIndex(row: number, col: number): number {
  return Math.trunc(row / 3) * 3 + Math.trunc(col / 3);
}

/**
 * Inplace union of two sets into the first set.
 *
 * @param setA - First set (will be used to store the result).
 * @param setB - Second set.
 */
export function unionInplace<T>(setA: Set<T>, setB: Set<T>) {
  for (const item of setB) {
    setA.add(item);
  }
}
