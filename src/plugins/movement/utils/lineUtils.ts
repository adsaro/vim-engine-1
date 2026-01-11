/**
 * Line Utilities
 *
 * Provides helper functions for line-based operations used by movement plugins.
 */

/**
 * Clamp a column value to valid bounds for a given line
 *
 * Ensures the column is within the valid range [0, line.length].
 *
 * @param column - The column to clamp
 * @param line - The line content to validate against
 * @returns The clamped column value
 *
 * @example
 * ```typescript
 * clampColumn(-1, 'hello');  // 0
 * clampColumn(3, 'hello');   // 3
 * clampColumn(10, 'hello');  // 5
 * ```
 */
export function clampColumn(column: number, line: string): number {
  return Math.max(0, Math.min(column, line.length));
}

/**
 * Find the first non-whitespace character in a line
 *
 * @param line - The line content to search
 * @returns The column index of the first non-whitespace character, or null if line is empty/whitespace-only
 *
 * @example
 * ```typescript
 * findFirstNonWhitespace('hello world');   // 0
 * findFirstNonWhitespace('  hello');       // 2
 * findFirstNonWhitespace('   ');           // null
 * findFirstNonWhitespace('');              // null
 * ```
 */
export function findFirstNonWhitespace(line: string): number | null {
  const match = line.search(/\S/);
  return match === -1 ? null : match;
}

/**
 * Find the last non-whitespace character in a line
 *
 * @param line - The line content to search
 * @returns The column index of the last non-whitespace character, or null if line is empty/whitespace-only
 *
 * @example
 * ```typescript
 * findLastNonWhitespace('hello world');    // 10
 * findLastNonWhitespace('  hello  ');      // 7
 * findLastNonWhitespace('   ');            // null
 * findLastNonWhitespace('');               // null
 * ```
 */
export function findLastNonWhitespace(line: string): number | null {
  const trimmed = line.trimEnd();
  return trimmed.length === 0 ? null : trimmed.length - 1;
}

/**
 * Check if a line is empty or contains only whitespace
 *
 * @param line - The line content to check
 * @returns True if the line is empty or whitespace-only
 *
 * @example
 * ```typescript
 * isEmptyOrWhitespace('hello');     // false
 * isEmptyOrWhitespace('  ');        // true
 * isEmptyOrWhitespace('');          // true
 * ```
 */
export function isEmptyOrWhitespace(line: string): boolean {
  return line.trim().length === 0;
}

/**
 * Get the effective line length (considering virtual space if enabled)
 *
 * @param line - The line content
 * @param minVirtualColumn - Minimum column position (for virtual space support)
 * @returns The effective line length
 *
 * @example
 * ```typescript
 * getEffectiveLineLength('hello');  // 5
 * getEffectiveLineLength('hello', 10); // 10
 * ```
 */
export function getEffectiveLineLength(line: string, minVirtualColumn: number = 0): number {
  return Math.max(line.length, minVirtualColumn);
}

/**
 * Calculate the movement step considering direction and count
 *
 * @param baseStep - The base step value
 * @param count - The movement count multiplier
 * @param direction - The movement direction
 * @returns The adjusted step value
 *
 * @example
 * ```typescript
 * calculateStep(1, 3, 'forward');  // 3
 * calculateStep(1, 2, 'backward'); // -2
 * ```
 */
export function calculateStep(
  baseStep: number,
  count: number,
  direction: 'forward' | 'backward' | 'left' | 'right' | 'up' | 'down'
): number {
  const step = baseStep * count;
  if (direction === 'backward' || direction === 'left' || direction === 'up') {
    return -step;
  }
  return step;
}
