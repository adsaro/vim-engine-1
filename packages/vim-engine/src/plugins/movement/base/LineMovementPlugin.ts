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
    config: Required<MovementConfig>
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
  protected handleCountMovement(
    cursor: CursorPosition,
    buffer: TextBuffer,
    count: number
  ): CursorPosition {
    // Handle invalid counts (0 or negative)
    if (count <= 1) {
      // Count of 1 means no line movement, just apply line movement
      return this.calculateNewPosition(cursor, buffer, this.config);
    }

    // Calculate target line (move down count - 1 lines)
    const targetLine = cursor.line + (count - 1);

    // Clamp to buffer bounds
    const lineCount = buffer.getLineCount();
    const clampedLine = Math.min(Math.max(0, targetLine), lineCount - 1);

    // Get the target line
    const line = buffer.getLine(clampedLine);
    if (line === null) {
      return cursor;
    }

    // Calculate target column on the new line
    const targetColumn = this.calculateLinePosition(line, cursor);
    const clampedColumn = clampColumn(targetColumn, line);

    // Return new position
    return new CursorPosition(clampedLine, clampedColumn);
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
