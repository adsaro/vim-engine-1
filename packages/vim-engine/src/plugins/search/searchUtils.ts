/**
 * Search Utilities - Helper functions for search operations
 *
 * Provides functions for finding pattern matches in text buffers.
 */

import { TextBuffer } from '../../state/TextBuffer';

/**
 * Find next occurrence of pattern in buffer
 *
 * Searches forward from the given position with wrap-around support.
 *
 * @param buffer - The text buffer to search
 * @param pattern - The search pattern
 * @param startLine - Line to start searching from
 * @param startColumn - Column to start searching from (exclusive)
 * @returns Position of match or null if not found
 *
 * @example
 * ```typescript
 * const match = findNextMatch(buffer, 'hello', 0, 0);
 * if (match) {
 *   console.log(`Found at line ${match.line}, column ${match.column}`);
 * }
 * ```
 */
export function findNextMatch(
  buffer: TextBuffer,
  pattern: string,
  startLine: number,
  startColumn: number
): { line: number; column: number } | null {
  if (!pattern || pattern.length === 0) {
    return null;
  }

  const lineCount = buffer.getLineCount();
  if (lineCount === 0) {
    return null;
  }

  // Search from current position to end of buffer
  for (let line = startLine; line < lineCount; line++) {
    const lineContent = buffer.getLine(line) || '';
    const searchStartColumn = line === startLine ? startColumn + 1 : 0;
    const searchText = lineContent.slice(searchStartColumn);

    const matchIndex = searchText.indexOf(pattern);
    if (matchIndex !== -1) {
      return { line, column: searchStartColumn + matchIndex };
    }
  }

  // Wrap around to beginning of buffer
  for (let line = 0; line < startLine; line++) {
    const lineContent = buffer.getLine(line) || '';
    const matchIndex = lineContent.indexOf(pattern);
    if (matchIndex !== -1) {
      return { line, column: matchIndex };
    }
  }

  return null;
}

/**
 * Find previous occurrence of pattern in buffer
 *
 * Searches backward from the given position with wrap-around support.
 *
 * @param buffer - The text buffer to search
 * @param pattern - The search pattern
 * @param startLine - Line to start searching from
 * @param startColumn - Column to start searching from (exclusive)
 * @returns Position of match or null if not found
 *
 * @example
 * ```typescript
 * const match = findPreviousMatch(buffer, 'hello', 5, 10);
 * if (match) {
 *   console.log(`Found at line ${match.line}, column ${match.column}`);
 * }
 * ```
 */
export function findPreviousMatch(
  buffer: TextBuffer,
  pattern: string,
  startLine: number,
  startColumn: number
): { line: number; column: number } | null {
  if (!pattern || pattern.length === 0) {
    return null;
  }

  const lineCount = buffer.getLineCount();
  if (lineCount === 0) {
    return null;
  }

  // Search backward from current position to beginning of buffer
  for (let line = startLine; line >= 0; line--) {
    const lineContent = buffer.getLine(line) || '';
    const searchEndColumn = line === startLine ? startColumn : lineContent.length;
    const searchText = lineContent.slice(0, searchEndColumn);

    const matchIndex = searchText.lastIndexOf(pattern);
    if (matchIndex !== -1) {
      return { line, column: matchIndex };
    }
  }

  // Wrap around to end of buffer
  for (let line = lineCount - 1; line > startLine; line--) {
    const lineContent = buffer.getLine(line) || '';
    const matchIndex = lineContent.lastIndexOf(pattern);
    if (matchIndex !== -1) {
      return { line, column: matchIndex };
    }
  }

  return null;
}

/**
 * Check if a pattern exists in the buffer
 *
 * @param buffer - The text buffer to search
 * @param pattern - The search pattern
 * @returns True if the pattern exists in the buffer
 */
export function patternExists(buffer: TextBuffer, pattern: string): boolean {
  if (!pattern || pattern.length === 0) {
    return false;
  }

  const lineCount = buffer.getLineCount();
  for (let line = 0; line < lineCount; line++) {
    const lineContent = buffer.getLine(line) || '';
    if (lineContent.includes(pattern)) {
      return true;
    }
  }

  return false;
}
