/**
 * Search Utilities
 *
 * Provides core search utility functions for search movement operations.
 * These functions are shared across search plugins for finding patterns,
 * navigating between matches, and extracting search terms.
 */

import { TextBuffer } from '../../../state/TextBuffer';
import { CursorPosition } from '../../../state/CursorPosition';
import { isWordChar } from './wordBoundary';

/**
 * Find all occurrences of a pattern in the buffer
 *
 * Searches through the buffer for all matches of the given regex pattern.
 * Supports both forward and backward search directions. Handles zero-width
 * matches to prevent infinite loops.
 *
 * @param buffer - The text buffer to search
 * @param pattern - The regex pattern to search for
 * @param startLine - Line to start searching from (default: 0)
 * @param direction - Search direction: 'forward' or 'backward' (default: 'forward')
 * @returns Array of positions where pattern was found
 *
 * @example
 * ```typescript
 * const buffer = new TextBuffer('hello world hello');
 * const pattern = /hello/g;
 * const matches = findAllMatches(buffer, pattern, 0, 'forward');
 * // Returns: [CursorPosition(0, 0), CursorPosition(0, 12)]
 * ```
 */
export function findAllMatches(
  buffer: TextBuffer,
  pattern: RegExp,
  startLine: number = 0,
  direction: 'forward' | 'backward' = 'forward'
): CursorPosition[] {
  const matches: CursorPosition[] = [];
  const lineCount = buffer.getLineCount();

  // Handle empty buffer
  if (lineCount === 0) {
    return matches;
  }

  // Validate startLine
  if (startLine < 0) {
    startLine = 0;
  } else if (startLine >= lineCount) {
    startLine = lineCount - 1;
  }

  // Determine line iteration order based on direction
  const lines: number[] = [];
  if (direction === 'forward') {
    for (let i = startLine; i < lineCount; i++) {
      lines.push(i);
    }
  } else {
    // For backward direction, if startLine is 0, search all lines
    // Otherwise search from startLine down to 0
    if (startLine === 0) {
      for (let i = lineCount - 1; i >= 0; i--) {
        lines.push(i);
      }
    } else {
      for (let i = startLine; i >= 0; i--) {
        lines.push(i);
      }
    }
  }

  // Search each line
  for (const lineNum of lines) {
    const line = buffer.getLine(lineNum);
    if (line === null) {
      continue;
    }

    // Reset regex state for each line
    pattern.lastIndex = 0;

    let match: RegExpExecArray | null;
    let lastMatchIndex = -1;

    // Find all matches on this line
    while ((match = pattern.exec(line)) !== null) {
      const matchIndex = match.index;

      // Prevent infinite loops for zero-width matches
      if (matchIndex === lastMatchIndex) {
        // Advance by one character to avoid infinite loop
        pattern.lastIndex = matchIndex + 1;
        continue;
      }

      lastMatchIndex = matchIndex;
      matches.push(new CursorPosition(lineNum, matchIndex));

      // For zero-width matches, advance to avoid infinite loop
      if (match[0].length === 0) {
        pattern.lastIndex = matchIndex + 1;
      }
    }
  }

  // For backward direction with single line, reverse matches to get last-to-first order
  // For multiple lines, matches are already in correct order due to reverse line iteration
  if (direction === 'backward' && lines.length === 1) {
    return matches.reverse();
  }

  return matches;
}

/**
 * Find next match from current cursor position
 *
 * Given an array of all match positions, finds the next match based on
 * the current cursor position and search direction. Supports wrap behavior
 * to cycle through matches when reaching the end or beginning.
 *
 * @param matches - Array of all match positions
 * @param cursor - Current cursor position
 * @param direction - Search direction: 'forward' or 'backward'
 * @param wrap - Whether to wrap around buffer (default: false)
 * @returns Next match position or null if no more matches
 *
 * @example
 * ```typescript
 * const matches = [new CursorPosition(0, 0), new CursorPosition(0, 5)];
 * const cursor = new CursorPosition(0, 0);
 * const next = findNextMatch(matches, cursor, 'forward', false);
 * // Returns: CursorPosition(0, 5)
 * ```
 */
export function findNextMatch(
  matches: CursorPosition[],
  cursor: CursorPosition,
  direction: 'forward' | 'backward',
  wrap: boolean = false
): CursorPosition | null {
  // Handle empty matches array
  if (matches.length === 0) {
    return null;
  }

  // Handle single match
  if (matches.length === 1) {
    if (wrap) {
      return matches[0];
    }
    // If cursor is on the match, return null (no next match)
    if (matches[0].equals(cursor)) {
      return null;
    }
    // Otherwise return the match
    return matches[0];
  }

  // Find current match index
  let currentIndex = -1;
  for (let i = 0; i < matches.length; i++) {
    if (matches[i].equals(cursor)) {
      currentIndex = i;
      break;
    }
  }

  if (direction === 'forward') {
    // If cursor is on a match, find the next one
    if (currentIndex !== -1) {
      if (currentIndex + 1 < matches.length) {
        return matches[currentIndex + 1];
      }
      // At last match, wrap if enabled
      if (wrap) {
        return matches[0];
      }
      return null;
    }

    // Cursor is not on a match, find first match after cursor
    for (let i = 0; i < matches.length; i++) {
      if (matches[i].isAfter(cursor)) {
        return matches[i];
      }
    }

    // No match after cursor, wrap if enabled
    if (wrap) {
      return matches[0];
    }
    return null;
  } else {
    // direction === 'backward'
    // If cursor is on a match, find the previous one
    if (currentIndex !== -1) {
      if (currentIndex - 1 >= 0) {
        return matches[currentIndex - 1];
      }
      // At first match, wrap if enabled
      if (wrap) {
        return matches[matches.length - 1];
      }
      return null;
    }

    // Cursor is not on a match, find first match before cursor
    for (let i = matches.length - 1; i >= 0; i--) {
      if (matches[i].isBefore(cursor)) {
        return matches[i];
      }
    }

    // No match before cursor, wrap if enabled
    if (wrap) {
      return matches[matches.length - 1];
    }
    return null;
  }
}

/**
 * Extract word under cursor
 *
 * Finds the word boundaries around the cursor position and extracts
 * the complete word. Uses isWordChar() to identify word characters.
 * Returns null if the cursor is not positioned on a word character.
 *
 * @param buffer - The text buffer
 * @param cursor - Current cursor position
 * @returns The word under cursor or null if not on a word
 *
 * @example
 * ```typescript
 * const buffer = new TextBuffer('hello world');
 * const cursor = new CursorPosition(0, 2);
 * const word = extractWordUnderCursor(buffer, cursor);
 * // Returns: 'hello'
 * ```
 */
export function extractWordUnderCursor(
  buffer: TextBuffer,
  cursor: CursorPosition
): string | null {
  const line = buffer.getLine(cursor.line);
  if (line === null) {
    return null;
  }

  const column = cursor.column;

  // Check if cursor is within line bounds
  if (column < 0 || column >= line.length) {
    return null;
  }

  // Check if cursor is on a word character
  const char = line[column];
  if (!isWordChar(char)) {
    return null;
  }

  // Find word start (move backward while on word characters)
  let start = column;
  while (start > 0 && isWordChar(line[start - 1])) {
    start--;
  }

  // Find word end (move forward while on word characters)
  let end = column;
  while (end < line.length - 1 && isWordChar(line[end + 1])) {
    end++;
  }

  // Extract and return the word
  return line.slice(start, end + 1);
}

/**
 * Convert search pattern to RegExp
 *
 * Converts a user-provided search pattern string into a RegExp object.
 * Handles empty patterns and invalid patterns gracefully by returning null.
 * Always adds the global flag for comprehensive searching.
 *
 * @param pattern - User input pattern
 * @returns RegExp object or null if invalid
 *
 * @example
 * ```typescript
 * const regex = patternToRegex('hello');
 * // Returns: /hello/g
 *
 * const invalid = patternToRegex('[unclosed');
 * // Returns: null
 *
 * const empty = patternToRegex('');
 * // Returns: null
 * ```
 */
export function patternToRegex(pattern: string): RegExp | null {
  // Handle empty patterns
  if (!pattern || pattern.trim() === '') {
    return null;
  }

  try {
    // Try to create RegExp from pattern
    const regex = new RegExp(pattern, 'g');
    return regex;
  } catch (error) {
    // Handle invalid patterns
    return null;
  }
}
