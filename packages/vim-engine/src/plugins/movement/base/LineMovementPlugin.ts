/**
 * LineMovementPlugin - Base class for line-based movement plugins
 *
 * Provides common functionality for plugins that move the cursor to specific
 * positions on the current line, such as:
 * - 0: Move to column 0 (absolute start of line)
 * - ^: Move to first non-whitespace character
 * - $: Move to last character of line
 * - g_: Move to last non-whitespace character
 *
 * @example
 * ```typescript
 * import { LineMovementPlugin } from './base/LineMovementPlugin';
 * import { CursorPosition } from '../../../state/CursorPosition';
 * import { VIM_MODE } from '../../../state/VimMode';
 *
 * class ZeroMovementPlugin extends LineMovementPlugin {
 *   constructor() {
 *     super('movement-0', 'Move to start of line', '0', [VIM_MODE.NORMAL]);
 *   }
 *
 *   protected calculateLinePosition(line: string, cursor: CursorPosition): number {
 *     return 0; // Always return column 0
 *   }
 * }
 * ```
 *
 * @see MovementPlugin For the base class
 */
import { MovementPlugin, MovementConfig } from './MovementPlugin';
import { ExecutionContext } from '../../../plugin/ExecutionContext';
import { VimMode } from '../../../state/VimMode';
import { CursorPosition } from '../../../state/CursorPosition';
import { TextBuffer } from '../../../state/TextBuffer';
import { clampColumn } from '../utils/lineUtils';

/**
 * LineMovementPlugin - Base class for line-based movement plugins
 *
 * Extends MovementPlugin to provide common functionality for movements that
 * position the cursor at specific columns on the current line.
 *
 * Key features:
 * - Abstract method for subclasses to implement specific line position logic
 * - Template method that handles common logic (line retrieval, validation)
 * - Support for count-based movements (e.g., 3$ moves 3 lines down then to end)
 * - Edge case handling (empty lines, whitespace-only lines, empty buffer)
 */
export abstract class LineMovementPlugin extends MovementPlugin {
  /**
   * Create a new line movement plugin
   *
   * @param name - Unique plugin name
   * @param description - Plugin description
   * @param pattern - Keystroke pattern this plugin handles
   * @param modes - Vim modes this plugin is active in
   * @param config - Optional movement configuration
   */
  constructor(
    name: string,
    description: string,
    pattern: string,
    modes: VimMode[],
    config?: MovementConfig
  ) {
    super(name, description, pattern, modes, config);
  }

  /**
   * Calculate the target column position on the current line
   *
   * Subclasses must implement this method to define their specific line
   * positioning logic.
   *
   * @param line - The current line content
   * @param cursor - The current cursor position
   * @returns The target column position (will be clamped to valid range)
   *
   * @example
   * ```typescript
   * // For 0 command (move to start of line)
   * protected calculateLinePosition(line: string, cursor: CursorPosition): number {
   *   return 0;
   * }
   *
   * // For ^ command (move to first non-whitespace)
   * protected calculateLinePosition(line: string, cursor: CursorPosition): number {
   *   const firstNonWhitespace = findFirstNonWhitespace(line);
   *   return firstNonWhitespace !== null ? firstNonWhitespace : 0;
   * }
   *
   * // For $ command (move to end of line)
   * protected calculateLinePosition(line: string, cursor: CursorPosition): number {
   *   return Math.max(0, line.length - 1);
   * }
   * ```
   */
  protected abstract calculateLinePosition(
    line: string,
    cursor: CursorPosition
  ): number;

  /**
   * Calculate new cursor position
   *
   * Template method that handles common logic:
   * 1. Get current line from buffer
   * 2. Call calculateLinePosition() to get target column
   * 3. Clamp column to valid range [0, line.length]
   * 4. Return new CursorPosition
   *
   * @param cursor - The current cursor position
   * @param buffer - The text buffer
   * @param config - The movement configuration
   * @returns The new cursor position
   */
  protected calculateNewPosition(
    cursor: CursorPosition,
    buffer: TextBuffer,
    _config: Required<MovementConfig>
  ): CursorPosition {
    // Get current line from buffer
    const line = buffer.getLine(cursor.line);

    // If line doesn't exist (shouldn't happen with validation), return current position
    if (line === null) {
      return cursor;
    }

    // Calculate target column using subclass implementation
    const targetColumn = this.calculateLinePosition(line, cursor);

    // Clamp column to valid range [0, line.length]
    const clampedColumn = clampColumn(targetColumn, line);

    // Return new position on same line
    return new CursorPosition(cursor.line, clampedColumn);
  }

  /**
   * Handle count-based movements
   *
   * For line movements, a count moves down (count - 1) lines, then applies
   * the line movement. For example:
   * - 0: Move to column 0 on current line
   * - 30: Move to column 0 on line 2 (current line + 2)
   * - $: Move to end of current line
   * - 3$: Move to end of line 2 (current line + 2)
   *
   * @param cursor - The current cursor position
   * @param buffer - The text buffer
   * @param count - The movement count (number of lines to move down - 1)
   * @returns The new cursor position after count-based movement
   *
   * @example
   * ```typescript
   * // Move 3 lines down then to column 0
   * const newPosition = plugin.handleCountMovement(cursor, buffer, 3);
   * // newPosition.line will be cursor.line + 2
   * // newPosition.column will be 0
   * ```
   */
  /**
   * Check if count requires line movement
   * Returns true if count > 1 (requires moving to a different line)
   */
  private requiresLineMovement(count: number): boolean {
    return count > 1;
  }

  /**
   * Calculate target line number with count applied
   * Moves down (count - 1) lines from current position
   */
  private calculateTargetLine(cursor: CursorPosition, count: number): number {
    return cursor.line + (count - 1);
  }

  /**
   * Clamp line number to valid buffer bounds
   * Ensures line is within [0, lineCount - 1]
   */
  private clampLineToBuffer(line: number, lineCount: number): number {
    return Math.min(Math.max(0, line), lineCount - 1);
  }

  /**
   * Get line content or return null if line doesn't exist
   */
  private getLineOrReturnNull(buffer: TextBuffer, line: number): string | null {
    return buffer.getLine(line);
  }

  /**
   * Calculate final cursor position on a specific line
   * Applies line movement logic and clamps column to valid range
   */
  private calculatePositionOnLine(
    line: string,
    lineNum: number,
    cursor: CursorPosition
  ): CursorPosition {
    const targetColumn = this.calculateLinePosition(line, cursor);
    const clampedColumn = clampColumn(targetColumn, line);
    return new CursorPosition(lineNum, clampedColumn);
  }

  protected handleCountMovement(
    cursor: CursorPosition,
    buffer: TextBuffer,
    count: number
  ): CursorPosition {
    // Handle counts that don't require line movement
    if (!this.requiresLineMovement(count)) {
      return this.calculateNewPosition(cursor, buffer, this.config);
    }

    // Calculate and clamp target line
    const targetLine = this.calculateTargetLine(cursor, count);
    const lineCount = buffer.getLineCount();
    const clampedLine = this.clampLineToBuffer(targetLine, lineCount);

    // Get the target line content
    const line = this.getLineOrReturnNull(buffer, clampedLine);
    if (line === null) {
      return cursor;
    }

    // Calculate final position on the target line
    return this.calculatePositionOnLine(line, clampedLine, cursor);
  }

  /**
   * Perform the movement action with count support
   *
   * Overrides the base implementation to handle count-based movements.
   *
   * @param context - The execution context
   */
  protected performAction(context: ExecutionContext): void {
    const cursor = context.getCursor();
    const buffer = context.getBuffer();

    // Check if buffer is empty
    if (buffer.isEmpty()) {
      return;
    }

    // Get count from context (default to 1)
    const count = context.getCount() || 1;

    // Handle count-based movement
    const newPosition = this.handleCountMovement(cursor, buffer, count);

    // Validate and update cursor
    if (this.validateMove(newPosition, buffer)) {
      context.setCursor(newPosition);
    }
  }
}
