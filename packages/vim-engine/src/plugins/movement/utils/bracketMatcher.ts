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
 * Represents an intermediate result when scanning for a matching bracket.
 * Used internally to track nesting depth during the search.
 */
interface DepthResult {
  /** Current nesting depth */
  depth: number;
  /** Whether a matching bracket was found */
  found: false;
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
 * Process a character while searching for matching closing bracket.
 *
 * Updates the depth based on the character type and returns a result
 * if the matching bracket is found.
 *
 * @param char - The character to process
 * @param openBracket - The opening bracket character
 * @param closeBracket - The closing bracket character
 * @param depth - Current nesting depth
 * @param line - Current line number
 * @param column - Current column number
 * @returns MatchResult if found, DepthResult otherwise
 */
function processCharacterForClose(
  char: string,
  openBracket: string,
  closeBracket: string,
  depth: number,
  line: number,
  column: number
): MatchResult | DepthResult {
  if (char === openBracket) {
    return { depth: depth + 1, found: false };
  }

  if (char === closeBracket) {
    const newDepth = depth - 1;
    if (newDepth === 0) {
      return { line, column, found: true };
    }
    return { depth: newDepth, found: false };
  }

  return { depth, found: false };
}

/**
 * Process a character while searching for matching opening bracket.
 *
 * Updates the depth based on the character type and returns a result
 * if the matching bracket is found.
 *
 * @param char - The character to process
 * @param openBracket - The opening bracket character
 * @param closeBracket - The closing bracket character
 * @param depth - Current nesting depth
 * @param line - Current line number
 * @param column - Current column number
 * @returns MatchResult if found, DepthResult otherwise
 */
function processCharacterForOpen(
  char: string,
  openBracket: string,
  closeBracket: string,
  depth: number,
  line: number,
  column: number
): MatchResult | DepthResult {
  if (char === closeBracket) {
    // Same type closing bracket - increase depth
    return { depth: depth + 1, found: false };
  }

  if (char === openBracket) {
    // Matching opening bracket - decrease depth
    const newDepth = depth - 1;
    if (newDepth === 0) {
      return { line, column, found: true };
    }
    return { depth: newDepth, found: false };
  }

  return { depth, found: false };
}

/**
 * Scan a single line for matching closing bracket.
 *
 * @param line - The line content
 * @param startColumn - Starting column in the line
 * @param openBracket - The opening bracket character
 * @param closeBracket - The closing bracket character
 * @param initialDepth - Initial nesting depth
 * @param lineNumber - The line number
 * @returns MatchResult if found, or DepthResult if not found on this line
 */
function scanLineForClose(
  line: string,
  startColumn: number,
  openBracket: string,
  closeBracket: string,
  initialDepth: number,
  lineNumber: number
): MatchResult | DepthResult {
  let depth = initialDepth;

  for (let column = startColumn; column < line.length; column++) {
    const char = line[column];
    const result = processCharacterForClose(
      char,
      openBracket,
      closeBracket,
      depth,
      lineNumber,
      column
    );

    if (result.found) {
      return result;
    }

    // Update depth for next iteration
    depth = (result as DepthResult).depth;
  }

  return { depth, found: false };
}

/**
 * Scan a single line for matching opening bracket.
 *
 * Scans backward from the starting column to find the matching opening bracket.
 *
 * @param line - The line content
 * @param startColumn - Starting column in the line (inclusive)
 * @param openBracket - The opening bracket character
 * @param closeBracket - The closing bracket character
 * @param initialDepth - Initial nesting depth
 * @param lineNumber - The line number
 * @returns MatchResult if found, or DepthResult if not found on this line
 */
function scanLineForOpen(
  line: string,
  startColumn: number,
  openBracket: string,
  closeBracket: string,
  initialDepth: number,
  lineNumber: number
): MatchResult | DepthResult {
  let depth = initialDepth;

  for (let column = startColumn; column >= 0; column--) {
    const char = line[column];
    const result = processCharacterForOpen(
      char,
      openBracket,
      closeBracket,
      depth,
      lineNumber,
      column
    );

    if (result.found) {
      return result;
    }

    // Update depth for next iteration
    depth = (result as DepthResult).depth;
  }

  return { depth, found: false };
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
  let currentLine = startLine;
  let currentColumn = startColumn + 1;
  let depth = 1;

  while (currentLine < lineCount) {
    const line = buffer.getLine(currentLine);
    if (line === null) break;

    const result = scanLineForClose(
      line,
      currentColumn,
      openBracket,
      closeBracket,
      depth,
      currentLine
    );

    if (result.found) {
      return result;
    }

    // Update depth for next iteration
    depth = (result as DepthResult).depth;
    currentLine++;
    currentColumn = 0;
  }

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

    // Scan current line for matching opening bracket
    const result = scanLineForOpen(
      line,
      currentColumn,
      openBracket,
      closeBracket,
      depth,
      currentLine
    );

    if (result.found) {
      return result;
    }

    // Update depth for next iteration
    depth = (result as DepthResult).depth;

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
 * Try to find a matching bracket at the current position.
 *
 * Checks if the character at the given position is an opening bracket,
 * and if so, finds its matching closing bracket.
 *
 * @param buffer - The TextBuffer to search
 * @param currentLine - Current line number
 * @param currentColumn - Current column number
 * @returns MatchResult if found, null otherwise
 */
function tryFindMatchAtPosition(
  buffer: TextBuffer,
  currentLine: number,
  currentColumn: number
): MatchResult | null {
  const line = buffer.getLine(currentLine);
  if (line === null) {
    return null;
  }

  const char = line[currentColumn];

  if (!isOpenBracket(char)) {
    return null;
  }

  const pair = getBracketPair(char);
  if (!pair) {
    return null;
  }

  const result = findMatchingClose(
    buffer,
    currentLine,
    currentColumn,
    pair.open,
    pair.close
  );

  return result.found ? result : null;
}

/**
 * Scan a line starting from a given column to find a matching bracket.
 *
 * Iterates through each position in the line starting from the specified column,
 * attempting to find a bracket and its match.
 *
 * @param buffer - The TextBuffer to search
 * @param line - The line content
 * @param startColumn - Starting column
 * @param lineNumber - Line number
 * @returns MatchResult if found, null otherwise
 */
function scanLineForNextBracket(
  buffer: TextBuffer,
  line: string,
  startColumn: number,
  lineNumber: number
): MatchResult | null {
  const lineLength = line.length;

  for (let column = startColumn; column < lineLength; column++) {
    const result = tryFindMatchAtPosition(buffer, lineNumber, column);
    if (result) {
      return result;
    }
  }

  return null;
}

/**
 * Search forward for the next opening bracket and find its matching closing bracket.
 *
 * Iterates through lines starting from the specified position, scanning each line
 * for an opening bracket and finding its matching closing bracket.
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
    if (line === null) {
      break;
    }

    const result = scanLineForNextBracket(buffer, line, currentColumn, currentLine);
    if (result) {
      return result;
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
