/**
 * DirectionalMovementPlugin - Base class for directional movement plugins
 *
 * Provides common functionality for step-based directional movements like
 * h (left), j (down), k (up), l (right).
 *
 * @example
 * ```typescript
 * import { DirectionalMovementPlugin, MovementConfig } from '../base/DirectionalMovementPlugin';
 * import { CursorPosition } from '../../../state/CursorPosition';
 * import { TextBuffer } from '../../../state/TextBuffer';
 * import { VimMode } from '../../../state/VimMode';
 *
 * class HMovementPlugin extends DirectionalMovementPlugin {
 *   readonly name = 'movement-h';
 *   readonly version = '1.0.0';
 *   readonly description = 'Move cursor left (h key)';
 *   readonly patterns = ['h'];
 *   readonly modes: VimMode[] = [VIM_MODE.NORMAL, VIM_MODE.VISUAL];
 *
 *   protected applyMovement(cursor: CursorPosition, line: string, step: number): CursorPosition {
 *     const newColumn = Math.max(0, cursor.column - step);
 *     return new CursorPosition(cursor.line, newColumn);
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
 * DirectionalMovementPlugin - Abstract base for step-based directional movements
 *
 * Extends MovementPlugin to provide common logic for horizontal and vertical
 * movements that operate by stepping a configurable number of positions.
 */
export abstract class DirectionalMovementPlugin extends MovementPlugin {
  /**
   * Calculate new cursor position using step-based directional movement
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

    // Get current line
    const line = buffer.getLine(cursor.line);
    if (!line) {
      return cursor.clone();
    }

    // Apply the movement with the configured step
    const newPosition = this.applyMovement(cursor, line, config.step);

    return newPosition;
  }

  /**
   * Apply the directional movement
   *
   * Must be implemented by subclasses to define specific movement behavior.
   *
   * @param cursor - The current cursor position
   * @param line - The current line content
   * @param step - The number of positions to move (positive or negative)
   * @returns The new cursor position
   */
  protected abstract applyMovement(
    cursor: CursorPosition,
    line: string,
    step: number
  ): CursorPosition;
}
