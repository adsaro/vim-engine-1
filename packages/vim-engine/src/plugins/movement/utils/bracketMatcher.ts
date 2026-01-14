/**
 * Bracket Matching Utilities
 *
 * Provides functions for finding matching brackets in text content.
 * Used by the percent keybinding for bracket matching.
 */

import { TextBuffer } from '../../../state/TextBuffer';
import { CursorPosition } from '../../../state/CursorPosition';
import {
  isOpenBracket,
  isBracket,
  getBracketPair,
} from './bracketTypes';

/**
 * Represents the result of a bracket matching operation.
 */
export interface MatchResult {
  /** The 0-based line number where the matching bracket was found */
  line: number;
  /** The 0-based column number where the matching bracket was found */
  column: number;
  /** Whether a matching bracket was found */
  found: boolean;
}

/**
 * Find the matching bracket for a given position in a document.
 *
 * This function searches through the document to find the matching bracket
 * for the bracket at the specified position. It handles nested brackets
 * and different bracket types.
 *
 * @param buffer - The TextBuffer containing the document content
 * @param cursor - The cursor position to search from
 * @returns A MatchResult indicating the position of the matching bracket
 *
 * @example
 * ```typescript
 * const buffer = new TextBuffer('(hello world)');
 * const cursor = new CursorPosition(0, 0);
 * findMatchingBracket(buffer, cursor); // { line: 0, column: 12, found: true }
 * ```
 */
export function findMatchingBracket(
  buffer: TextBuffer,
  cursor: CursorPosition
): MatchResult {
  // Handle empty buffer
  if (buffer.isEmpty()) {
    return { line: cursor.line, column: cursor.column, found: false };
  }

  // Validate cursor position
  if (!buffer.isValidLine(cursor.line)) {
    return { line: cursor.line, column: cursor.column, found: false };
  }

  const line = buffer.getLine(cursor.line);
  if (line === null) {
    return { line: cursor.line, column: cursor.column, found: false };
  }

  // Handle invalid column
  if (cursor.column < 0 || cursor.column > line.length) {
    return { line: cursor.line, column: cursor.column, found: false };
  }

  // Get the character at cursor position
  const charAtCursor = cursor.column < line.length ? line[cursor.column] : '';

  // Check if cursor is on a bracket
  if (isBracket(charAtCursor)) {
    const pair = getBracketPair(charAtCursor);
    if (!pair) {
      return { line: cursor.line, column: cursor.column, found: false };
    }

    if (isOpenBracket(charAtCursor)) {
      // Cursor is on opening bracket - search forward for matching close
      return findMatchingClose(buffer, cursor.line, cursor.column, pair.open, pair.close);
    } else {
      // Cursor is on closing bracket - search backward for matching open
      return findMatchingOpen(buffer, cursor.line, cursor.column, pair.open, pair.close);
    }
  }

  // Cursor is not on a bracket - search forward for next bracket pair
  return findNextBracketAndMatch(buffer, cursor.line, cursor.column);
}

/**
 * Find the matching closing bracket for an opening bracket.
 *
 * Searches forward from the opening bracket position, tracking nesting depth.
 *
 * @param buffer - The TextBuffer to search
 * @param startLine - Starting line
 * @param startColumn - Starting column
 * @param openBracket - The opening bracket character
 * @param closeBracket - The matching closing bracket character
 * @returns MatchResult with the position of the matching closing bracket
 */
function findMatchingClose(
  buffer: TextBuffer,
  startLine: number,
  startColumn: number,
  openBracket: string,
  closeBracket: string
): MatchResult {
  const lineCount = buffer.getLineCount();

  // Start at depth 1 (we're on the opening bracket)
  let depth = 1;
  let currentLine = startLine;
  let currentColumn = startColumn + 1;

  while (currentLine < lineCount) {
    const line = buffer.getLine(currentLine);
    if (line === null) break;

    const lineLength = line.length;

    while (currentColumn < lineLength) {
      const char = line[currentColumn];

      if (char === openBracket) {
        // Same type opening bracket - increase depth
        depth++;
      } else if (char === closeBracket) {
        // Matching closing bracket - decrease depth
        depth--;
        if (depth === 0) {
          // Found the matching bracket
          return { line: currentLine, column: currentColumn, found: true };
        }
      }

      currentColumn++;
    }

    // Move to next line
    currentLine++;
    currentColumn = 0;
  }

  // No matching bracket found
  return { line: startLine, column: startColumn, found: false };
}

/**
 * Find the matching opening bracket for a closing bracket.
 *
 * Searches backward from the closing bracket position, tracking nesting depth.
 *
 * @param buffer - The TextBuffer to search
 * @param startLine - Starting line
 * @param startColumn - Starting column
 * @param openBracket - The matching opening bracket character
 * @param closeBracket - The closing bracket character
 * @returns MatchResult with the position of the matching opening bracket
 */
function findMatchingOpen(
  buffer: TextBuffer,
  startLine: number,
  startColumn: number,
  openBracket: string,
  closeBracket: string
): MatchResult {
  // Start at depth 1 (we're on the closing bracket)
  let depth = 1;
  let currentLine = startLine;
  let currentColumn = startColumn - 1;

  while (currentLine >= 0) {
    const line = buffer.getLine(currentLine);
    if (line === null) break;

    while (currentColumn >= 0) {
      const char = line[currentColumn];

      if (char === closeBracket) {
        // Same type closing bracket - increase depth
        depth++;
      } else if (char === openBracket) {
        // Matching opening bracket - decrease depth
        depth--;
        if (depth === 0) {
          // Found the matching bracket
          return { line: currentLine, column: currentColumn, found: true };
        }
      }

      currentColumn--;
    }

    // Move to previous line
    currentLine--;
    const prevLine = buffer.getLine(currentLine);
    if (prevLine !== null) {
      currentColumn = prevLine.length - 1;
    }
  }

  // No matching bracket found
  return { line: startLine, column: startColumn, found: false };
}

/**
 * Search forward for the next opening bracket and find its matching closing bracket.
 *
 * @param buffer - The TextBuffer to search
 * @param startLine - Starting line
 * @param startColumn - Starting column
 * @returns MatchResult with the position of the matching closing bracket, or not found
 */
function findNextBracketAndMatch(
  buffer: TextBuffer,
  startLine: number,
  startColumn: number
): MatchResult {
  const lineCount = buffer.getLineCount();
  let currentLine = startLine;
  let currentColumn = startColumn;

  while (currentLine < lineCount) {
    const line = buffer.getLine(currentLine);
    if (line === null) break;

    const lineLength = line.length;

    while (currentColumn < lineLength) {
      const char = line[currentColumn];

      if (isOpenBracket(char)) {
        // Found an opening bracket - find its match
        const pair = getBracketPair(char);
        if (pair) {
          const result = findMatchingClose(
            buffer,
            currentLine,
            currentColumn,
            pair.open,
            pair.close
          );
          if (result.found) {
            return result;
          }
        }
      }

      currentColumn++;
    }

    // Move to next line
    currentLine++;
    currentColumn = 0;
  }

  // No bracket pair found
  return { line: startLine, column: startColumn, found: false };
}

/**
 * Legacy function signature for backward compatibility.
 *
 * @deprecated Use findMatchingBracket(buffer: TextBuffer, cursor: CursorPosition) instead
 * @param lines - Array of lines in the document
 * @param startLine - The 0-based line number of the starting bracket
 * @param startColumn - The 0-based column number of the starting bracket
 * @returns A MatchResult indicating the position of the matching bracket
 */
export function findMatchingBracketLegacy(
  lines: string[],
  startLine: number,
  startColumn: number
): MatchResult {
  // Create a temporary buffer from lines
  const buffer = new TextBuffer(lines);
  const cursor = new CursorPosition(startLine, startColumn);
  return findMatchingBracket(buffer, cursor);
}
