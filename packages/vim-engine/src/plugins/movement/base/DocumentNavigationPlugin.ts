/**
 * DocumentNavigationPlugin - Base class for document navigation plugins
 *
 * Provides common functionality for plugins that move the cursor to specific
 * lines in the document, such as:
 * - gg: Jump to the first line of the document
 * - G: Jump to the last line of the document
 * - [count]G: Jump to a specific line number
 *
 * This base class handles:
 * - Line clamping to valid buffer range
 * - Empty buffer handling
 * - Column preservation across line changes (using desiredColumn)
 * - Template method pattern for subclasses to define target line logic
 *
 * @example
 * ```typescript
 * import { DocumentNavigationPlugin } from './base/DocumentNavigationPlugin';
 * import { CursorPosition } from '../../../state/CursorPosition';
 * import { TextBuffer } from '../../../state/TextBuffer';
 * import { VIM_MODE } from '../../../state/VimMode';
 *
 * class GGMovementPlugin extends DocumentNavigationPlugin {
 *   readonly name = 'movement-gg';
 *   readonly version = '1.0.0';
 *   readonly description = 'Jump to first line of document';
 *   readonly patterns = ['gg'];
 *   readonly modes: VIM_MODE[] = [VIM_MODE.NORMAL, VIM_MODE.VISUAL];
 *
 *   protected getTargetLine(
 *     cursor: CursorPosition,
 *     buffer: TextBuffer,
 *     config: Required<MovementConfig>
 *   ): number {
 *     return 0; // Always return first line
 *   }
 * }
 * ```
 *
 * @see MovementPlugin For the base class
 */
import { MovementPlugin, MovementConfig } from './MovementPlugin';
import { CursorPosition } from '../../../state/CursorPosition';
import { TextBuffer } from '../../../state/TextBuffer';
import { VimMode } from '../../../state/VimMode';

/**
 * DocumentNavigationPlugin - Base class for document navigation movements
 *
 * Extends MovementPlugin to provide common functionality for movements that
 * position the cursor at specific lines in the document.
 *
 * Key features:
 * - Abstract method for subclasses to implement specific target line logic
 * - Template method that handles common logic (line clamping, column preservation)
 * - Edge case handling (empty buffers, column clamping to line length)
 * - Support for desiredColumn preservation during vertical movement
 */
export abstract class DocumentNavigationPlugin extends MovementPlugin {
  /**
   * Create a new document navigation plugin
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
   * Clamp a line number to valid buffer range
   *
   * Ensures that the line number is within the valid range [0, lineCount - 1].
   * Handles the empty buffer case by returning 0.
   *
   * @param line - The line number to clamp
   * @param buffer - The text buffer
   * @returns The clamped line number (0 for empty buffer)
   *
   * @example
   * ```typescript
   * // Empty buffer
   * const emptyBuffer = new TextBuffer([]);
   * const clamped = this.clampLine(5, emptyBuffer);
   * // clamped === 0
   *
   * // Buffer with 10 lines
   * const buffer = new TextBuffer(Array(10).fill('line'));
   * this.clampLine(15, buffer); // Returns 9 (last line)
   * this.clampLine(-5, buffer); // Returns 0 (first line)
   * this.clampLine(5, buffer);  // Returns 5 (within range)
   * ```
   */
  protected clampLine(line: number, buffer: TextBuffer): number {
    const lineCount = buffer.getLineCount();

    // Handle empty buffer case
    if (lineCount === 0) {
      return 0;
    }

    // Clamp to valid range [0, lineCount - 1]
    return Math.max(0, Math.min(line, lineCount - 1));
  }

  /**
   * Calculate the target line number
   *
   * Subclasses must implement this method to define their specific target
   * line logic. The returned line number will be clamped to the valid
   * buffer range by the calculateNewPosition method.
   *
   * @param cursor - The current cursor position
   * @param buffer - The text buffer
   * @param config - The movement configuration (includes step/count)
   * @returns The target line number (will be clamped to valid range)
   *
   * @example
   * ```typescript
   * // For gg command (jump to first line)
   * protected getTargetLine(
   *   cursor: CursorPosition,
   *   buffer: TextBuffer,
   *   config: Required<MovementConfig>
   * ): number {
   *   return 0;
   * }
   *
   * // For G command (jump to last line)
   * protected getTargetLine(
   *   cursor: CursorPosition,
   *   buffer: TextBuffer,
   *   config: Required<MovementConfig>
   * ): number {
   *   return buffer.getLineCount() - 1;
   * }
   *
   * // For [count]G command (jump to specific line)
   * protected getTargetLine(
   *   cursor: CursorPosition,
   *   buffer: TextBuffer,
   *   config: Required<MovementConfig>
   * ): number {
   *   // Vim uses 1-based line numbers, config.step is the count
   *   // So 10G means line 10 (0-based: 9)
   *   const targetLine = config.step - 1;
   *   return this.clampLine(targetLine, buffer);
   * }
   * ```
   */
  protected abstract getTargetLine(
    cursor: CursorPosition,
    buffer: TextBuffer,
    config: Required<MovementConfig>
  ): number;

  /**
   * Calculate new cursor position
   *
   * Template method that handles common logic:
   * 1. Handle empty buffer case (return cursor.clone())
   * 2. Get target line using getTargetLine()
   * 3. Clamp target line to valid buffer range
   * 4. Get target line content
   * 5. Preserve desiredColumn for vertical movement
   * 6. Clamp column to target line's length
   * 7. Return new CursorPosition
   *
   * @param cursor - The current cursor position
   * @param buffer - The text buffer
   * @param config - The movement configuration
   * @returns The new cursor position
   *
   * @example
   * ```typescript
   * // Moving from a long line to a shorter line
   * const buffer = new TextBuffer([
   *   'this is a very long line with many characters',
   *   'short'
   * ]);
   * const cursor = new CursorPosition(0, 20, 20);
   * const newPosition = plugin.calculateNewPosition(cursor, buffer, { step: 1 });
   * // newPosition.line === 1
   * // newPosition.column === 5 (clamped to 'short'.length)
   * // newPosition.desiredColumn === 20 (preserved for future vertical moves)
   * ```
   */
  protected calculateNewPosition(
    cursor: CursorPosition,
    buffer: TextBuffer,
    config: Required<MovementConfig>
  ): CursorPosition {
    // Handle empty buffer case
    if (buffer.isEmpty()) {
      return cursor.clone();
    }

    // Get target line using subclass implementation
    const targetLine = this.getTargetLine(cursor, buffer, config);

    // Clamp target line to valid buffer range
    const clampedLine = this.clampLine(targetLine, buffer);

    // Get the target line content
    const lineContent = buffer.getLine(clampedLine);

    // If line doesn't exist (shouldn't happen with clamping), return current position
    if (lineContent === null) {
      return cursor.clone();
    }

    // Preserve desiredColumn for vertical movement
    // Clamp column to target line's length
    const maxColumn = lineContent.length;
    const newColumn = Math.min(cursor.desiredColumn, maxColumn);

    // Return new position with preserved desiredColumn
    return new CursorPosition(clampedLine, newColumn, cursor.desiredColumn);
  }
}
