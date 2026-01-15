/**
 * WordMovementPlugin - Base class for word-based movement plugins
 *
 * Provides common functionality for word boundary traversal movements like
 * w (word forward), W (WORD forward), b (word backward), e (word end), etc.
 *
 * @example
 * ```typescript
 * import { WordMovementPlugin } from '../base/WordMovementPlugin';
 * import { findNextWordStart } from '../utils/wordBoundary';
 * import { CursorPosition } from '../../../state/CursorPosition';
 * import { TextBuffer } from '../../../state/TextBuffer';
 * import { VimMode } from '../../../state/VimMode';
 *
 * class WMovementPlugin extends WordMovementPlugin {
 *   readonly name = 'movement-w';
 *   readonly version = '1.0.0';
 *   readonly description = 'Move cursor to start of next word (w key)';
 *   readonly patterns = ['w'];
 *   readonly modes: VimMode[] = [VIM_MODE.NORMAL, VIM_MODE.VISUAL];
 *
 *   protected get direction(): 'forward' | 'backward' {
 *     return 'forward';
 *   }
 *
 *   protected findBoundary(line: string, column: number): number | null {
 *     return findNextWordStart(line, column);
 *   }
 * }
 * ```
 *
 * @see MovementPlugin For the base class
 */
import { MovementPlugin, MovementConfig } from './MovementPlugin';
import { CursorPosition } from '../../../state/CursorPosition';
import { TextBuffer } from '../../../state/TextBuffer';

/**
 * WordMovementPlugin - Abstract base for word-based movements
 *
 * Extends MovementPlugin to provide common logic for word boundary detection
 * and multi-line traversal. Subclasses implement specific boundary finding
 * strategies for different word movement types.
 */
export abstract class WordMovementPlugin extends MovementPlugin {
  /**
   * Calculate new cursor position using word boundary traversal
   *
   * First attempts to find a boundary on the current line. If not found,
   * traverses other lines in the configured direction to find the next
   * word boundary.
   *
   * @param cursor - The current cursor position
   * @param buffer - The text buffer
   * @param config - The movement configuration
   * @returns The new cursor position
   */
  protected calculateNewPosition(
    cursor: CursorPosition,
    buffer: TextBuffer,
    config: Required<MovementConfig>
  ): CursorPosition {
    // Handle empty buffer
    if (buffer.isEmpty()) {
      return cursor.clone();
    }

    const currentLine = buffer.getLine(cursor.line);
    if (currentLine === null) {
      return cursor.clone();
    }

    // Try finding boundary on current line
    const boundary = this.findBoundary(currentLine, cursor.column, false);
    if (boundary !== null) {
      // Update desiredColumn to preserve this column position for vertical movement
      return new CursorPosition(cursor.line, boundary, boundary);
    }

    // Multi-line traversal
    return this.findInOtherLines(cursor, buffer, config);
  }

  /**
   * Find boundary in other lines
   *
   * Searches in the configured direction (forward or backward) for a line
   * containing a word boundary. Stops at empty lines, returning cursor position
   * at the beginning of the empty line.
   *
   * @param cursor - The current cursor position
   * @param buffer - The text buffer
   * @param config - The movement configuration
   * @returns The new cursor position, or original if no boundary found
   */
  private findInOtherLines(
    cursor: CursorPosition,
    buffer: TextBuffer,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _config: Required<MovementConfig>
    // config parameter reserved for future use (e.g., count-based multi-step word movement)
  ): CursorPosition {
    const { startLine, endLine, step } = this.getLoopParameters(cursor, buffer);

    for (let line = startLine; line !== endLine; line += step) {
      const lineContent = buffer.getLine(line) ?? '';

      const result = this.searchLineForBoundary(line, lineContent);
      if (result !== null) {
        return result;
      }
    }

    return cursor.clone();
  }

  /**
   * Calculate loop parameters for multi-line traversal
   * @returns Object containing startLine, endLine, and step values
   */
  private getLoopParameters(
    cursor: CursorPosition,
    buffer: TextBuffer
  ): { startLine: number; endLine: number; step: number } {
    const lineCount = buffer.getLineCount();

    if (this.direction === 'forward') {
      return {
        startLine: cursor.line + 1,
        endLine: lineCount,
        step: 1,
      };
    }

    return {
      startLine: cursor.line - 1,
      endLine: -1,
      step: -1,
    };
  }

  /**
   * Search a single line for a word boundary
   * @param line - The line number
   * @param lineContent - The content of the line
   * @returns CursorPosition if boundary found, null otherwise
   */
  private searchLineForBoundary(
    line: number,
    lineContent: string
  ): CursorPosition | null {
    if (this.direction === 'forward') {
      return this.searchForward(line, lineContent);
    }

    return this.searchBackward(line, lineContent);
  }

  /**
   * Search forward for the first non-whitespace character
   * Matches Vim's behavior where w moves to the start of the next WORD
   * @param line - The line number
   * @param lineContent - The content of the line
   * @returns CursorPosition if boundary found, null otherwise
   */
  private searchForward(
    line: number,
    lineContent: string
  ): CursorPosition | null {
    const boundary = this.findBoundary(lineContent, 0, true);

    if (boundary !== null && boundary < lineContent.length) {
      return new CursorPosition(line, boundary, boundary);
    }

    return null;
  }

  /**
   * Search backward starting from the end of the line
   * @param line - The line number
   * @param lineContent - The content of the line
   * @returns CursorPosition if boundary found, null otherwise
   */
  private searchBackward(
    line: number,
    lineContent: string
  ): CursorPosition | null {
    const boundary = this.findBoundary(lineContent, lineContent.length, true);

    if (boundary !== null) {
      return new CursorPosition(line, boundary, boundary);
    }

    return null;
  }

  /**
   * Find word boundary on a line
   *
   * Must be implemented by subclasses to define boundary detection behavior.
   *
   * @param line - The line content to search
   * @param column - The starting column position
   * @returns The column index of the boundary, or null if not found
   */
  protected abstract findBoundary(line: string, column: number, rolling: boolean): number | null;

  /**
   * Get the movement direction
   *
   * Must be implemented by subclasses to specify traversal direction.
   *
   * @returns 'forward' for w, W, e, E; 'backward' for b, B, ge, gE
   */
  protected abstract get direction(): 'forward' | 'backward';
}
