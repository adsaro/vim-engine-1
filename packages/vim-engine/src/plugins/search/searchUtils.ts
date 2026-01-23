/**
 * Search Utilities - Helper functions for search operations
 *
 * Provides functions for finding pattern matches in text buffers.
 * All searches are performed using regular expressions for consistency.
 */

import { TextBuffer } from '../../state/TextBuffer';

/**
 * Find next occurrence of pattern in buffer
 *
 * Searches forward from the given position with wrap-around support.
 * All patterns are treated as regular expressions.
 *
 * @param buffer - The text buffer to search
 * @param pattern - The search pattern (will be used as regexp)
 * @param startLine - Line to start searching from
 * @param startColumn - Column to start searching from (exclusive)
 * @returns Position of match or null if not found
 *
 * @example
 * ```typescript
 * // Text search (will be escaped and treated as literal)
 * const match = findNextMatch(buffer, 'hello', 0, 0);
 *
 * // Regexp search (whole word with boundaries)
 * const match = findNextMatch(buffer, '\\bhello\\b', 0, 0);
 *
 * // Regexp search (complex pattern)
 * const match = findNextMatch(buffer, '[0-9]+', 0, 0);
 *
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

  // Create regexp from pattern
  let regexp: RegExp | null = null;
  try {
    regexp = new RegExp(pattern, 'g');
  } catch (e) {
    // If regexp is invalid, return null
    console.warn('Invalid regexp pattern:', pattern);
    return null;
  }

  // Search from current position to end of buffer
  for (let line = startLine; line < lineCount; line++) {
    const lineContent = buffer.getLine(line) || '';
    const searchStartColumn = line === startLine ? startColumn + 1 : 0;
    const searchText = lineContent.slice(searchStartColumn);

    regexp.lastIndex = 0;
    const match = regexp.exec(searchText);

    if (match) {
      const matchIndex = match.index;
      if (matchIndex !== -1) {
        return { line, column: searchStartColumn + matchIndex };
      }
    }
  }

  // Wrap around to beginning of buffer
  // We need to search from line 0 up to and including startLine
  for (let line = 0; line <= startLine; line++) {
    const lineContent = buffer.getLine(line) || '';

    // For the startLine, only search up to startColumn (not beyond)
    let searchText: string;
    if (line === startLine) {
      searchText = lineContent.slice(0, startColumn);
    } else {
      searchText = lineContent;
    }

    regexp.lastIndex = 0;
    const match = regexp.exec(searchText);

    if (match) {
      const matchIndex = match.index;
      if (matchIndex !== -1) {
        return { line, column: matchIndex };
      }
    }
  }

  return null;
}

/**
 * Find previous occurrence of pattern in buffer
 *
 * Searches backward from the given position with wrap-around support.
 * All patterns are treated as regular expressions.
 *
 * @param buffer - The text buffer to search
 * @param pattern - The search pattern (will be used as regexp)
 * @param startLine - Line to start searching from
 * @param startColumn - Column to start searching from (exclusive)
 * @returns Position of match or null if not found
 *
 * @example
 * ```typescript
 * // Text search (will be escaped and treated as literal)
 * const match = findPreviousMatch(buffer, 'hello', 5, 10);
 *
 * // Regexp search (whole word with boundaries)
 * const match = findPreviousMatch(buffer, '\\bhello\\b', 5, 10);
 *
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

  // Create regexp from pattern
  let regexp: RegExp | null = null;
  try {
    regexp = new RegExp(pattern, 'g');
  } catch (e) {
    // If regexp is invalid, return null
    console.warn('Invalid regexp pattern:', pattern);
    return null;
  }

  // Helper function to find all matches in a string
  const findAllMatches = (text: string): number[] => {
    const matches: number[] = [];
    regexp!.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = regexp!.exec(text)) !== null) {
      matches.push(match.index);
    }
    return matches;
  };

  // Search backward from current position to beginning of buffer
  for (let line = startLine; line >= 0; line--) {
    const lineContent = buffer.getLine(line) || '';
    const searchEndColumn = line === startLine ? startColumn : lineContent.length;
    const searchText = lineContent.slice(0, searchEndColumn);

    const allMatches = findAllMatches(searchText);
    if (allMatches.length > 0) {
      // Get the last match (rightmost) in the search range
      const matchIndex = allMatches[allMatches.length - 1];
      return { line, column: matchIndex };
    }
  }

  // Wrap around to end of buffer
  for (let line = lineCount - 1; line >= startLine; line--) {
    const lineContent = buffer.getLine(line) || '';
    
    // For the startLine, only search from startColumn to end (not including already searched range)
    let searchText: string;
    if (line === startLine) {
      searchText = lineContent.slice(startColumn);
    } else {
      searchText = lineContent;
    }
    
    const allMatches = findAllMatches(searchText);
    if (allMatches.length > 0) {
      // Get the last match (rightmost) in the search range
      const matchIndex = allMatches[allMatches.length - 1];
      const columnOffset = line === startLine ? startColumn : 0;
      return { line, column: columnOffset + matchIndex };
    }
  }

  return null;
}

/**
 * Check if a pattern exists in the buffer
 *
 * @param buffer - The text buffer to search
 * @param pattern - The search pattern (will be used as regexp)
 * @returns True if the pattern exists in the buffer
 */
export function patternExists(buffer: TextBuffer, pattern: string): boolean {
  if (!pattern || pattern.length === 0) {
    return false;
  }

  // Create regexp from pattern
  let regexp: RegExp | null = null;
  try {
    regexp = new RegExp(pattern);
  } catch (e) {
    // If regexp is invalid, return false
    return false;
  }

  const lineCount = buffer.getLineCount();
  for (let line = 0; line < lineCount; line++) {
    const lineContent = buffer.getLine(line) || '';
    if (regexp!.test(lineContent)) {
      return true;
    }
  }

  return false;
}
