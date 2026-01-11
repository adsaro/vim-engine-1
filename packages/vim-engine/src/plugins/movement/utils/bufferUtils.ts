/**
 * Buffer Utilities
 *
 * Provides helper functions for buffer-based operations used by movement plugins.
 */
import { CursorPosition } from '../../../state/CursorPosition';
import { TextBuffer } from '../../../state/TextBuffer';

/**
 * Navigate to a specific line while preserving column position
 *
 * Moves the cursor to the target line, clamping the column to the
 * target line's length if necessary.
 *
 * @param cursor - The current cursor position
 * @param targetLine - The line number to navigate to
 * @param buffer - The text buffer
 * @returns The new cursor position, or a clone of the original if invalid
 *
 * @example
 * ```typescript
 * const cursor = new CursorPosition(0, 5);
 * const buffer = new TextBuffer(['hello', 'world']);
 * navigateToLine(cursor, 1, buffer);  // CursorPosition(1, 5) - clamped to 'world'.length
 * ```
 */
export function navigateToLine(
  cursor: CursorPosition,
  targetLine: number,
  buffer: TextBuffer
): CursorPosition {
  const lineCount = buffer.getLineCount();
  if (targetLine < 0 || targetLine >= lineCount) {
    return cursor.clone();
  }

  const targetLineContent = buffer.getLine(targetLine);
  const clampedColumn = Math.min(cursor.column, targetLineContent?.length ?? 0);

  return new CursorPosition(targetLine, clampedColumn);
}

/**
 * Check if the cursor is at the start of the buffer
 *
 * @param cursor - The cursor position to check
 * @param buffer - The text buffer
 * @returns True if at buffer start (line 0, column 0)
 *
 * @example
 * ```typescript
 * const cursor = new CursorPosition(0, 0);
 * const buffer = new TextBuffer(['hello']);
 * isAtBufferStart(cursor, buffer);  // true
 * ```
 */
export function isAtBufferStart(cursor: CursorPosition, _buffer: TextBuffer): boolean {
  // buffer parameter预留 for potential future use (e.g., virtual space support)
  return cursor.line === 0 && cursor.column === 0;
}

/**
 * Check if the cursor is at the end of the buffer
 *
 * @param cursor - The cursor position to check
 * @param buffer - The text buffer
 * @returns True if at buffer end (last line, last column)
 *
 * @example
 * ```typescript
 * const cursor = new CursorPosition(0, 5);
 * const buffer = new TextBuffer(['hello']);
 * isAtBufferEnd(cursor, buffer);  // true
 * ```
 */
export function isAtBufferEnd(cursor: CursorPosition, buffer: TextBuffer): boolean {
  const lineCount = buffer.getLineCount();
  if (lineCount === 0) {
    return true;
  }
  const lastLine = buffer.getLine(lineCount - 1);
  return cursor.line === lineCount - 1 && cursor.column === lastLine?.length;
}

/**
 * Find the next non-empty line in a given direction
 *
 * Searches forward or backward from the start line for a line that
 * contains non-whitespace content.
 *
 * @param startLine - The line to start searching from
 * @param buffer - The text buffer
 * @param direction - The search direction ('forward' or 'backward')
 * @returns The line number of the next non-empty line, or null if not found
 *
 * @example
 * ```typescript
 * const buffer = new TextBuffer(['', 'hello', '', 'world', '']);
 * findNextNonEmptyLine(0, buffer, 'forward');  // 1
 * findNextNonEmptyLine(2, buffer, 'forward');  // 3
 * findNextNonEmptyLine(4, buffer, 'forward');  // null
 * findNextNonEmptyLine(3, buffer, 'backward'); // 1
 * ```
 */
export function findNextNonEmptyLine(
  startLine: number,
  buffer: TextBuffer,
  direction: 'forward' | 'backward' = 'forward'
): number | null {
  const lineCount = buffer.getLineCount();
  const step = direction === 'forward' ? 1 : -1;

  for (let line = startLine + step; line >= 0 && line < lineCount; line += step) {
    const content = buffer.getLine(line);
    if (content && content.trim().length > 0) {
      return line;
    }
  }

  return null;
}

/**
 * Check if a line index is valid
 *
 * @param lineNumber - The line index to check
 * @param buffer - The text buffer
 * @returns True if the line index is valid
 *
 * @example
 * ```typescript
 * const buffer = new TextBuffer(['hello', 'world']);
 * isValidLine(0, buffer);   // true
 * isValidLine(1, buffer);   // true
 * isValidLine(2, buffer);   // false
 * isValidLine(-1, buffer);  // false
 * ```
 */
export function isValidLine(lineNumber: number, buffer: TextBuffer): boolean {
  return lineNumber >= 0 && lineNumber < buffer.getLineCount();
}

/**
 * Get the maximum valid column for a line
 *
 * @param line - The line content
 * @param allowVirtualSpace - Whether to allow virtual space beyond line end
 * @returns The maximum valid column index
 *
 * @example
 * ```typescript
 * getMaxColumn('hello', false);  // 5
 * ```
 */
export function getMaxColumn(line: string, allowVirtualSpace: boolean = false): number {
  return allowVirtualSpace ? Math.max(line.length, 0) : line.length;
}
