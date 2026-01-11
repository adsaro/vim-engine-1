/**
 * JMovementPlugin - Move cursor down (j key)
 *
 * Implements the vim 'j' command for moving the cursor down.
 * Stops at the last line of the buffer.
 *
 * @example
 * ```typescript
 * import { JMovementPlugin } from './j/JMovementPlugin';
 *
 * const plugin = new JMovementPlugin();
 * // Press 'j' to move down
 * ```
 *
 * @see DirectionalMovementPlugin For the base class
 */
import { DirectionalMovementPlugin } from '../base/DirectionalMovementPlugin';
import { MovementConfig } from '../base/MovementPlugin';
import { CursorPosition } from '../../../state/CursorPosition';
import { TextBuffer } from '../../../state/TextBuffer';
import { VIM_MODE, VimMode } from '../../../state/VimMode';

/**
 * JMovementPlugin - Moves cursor down by one or more lines
 *
 * The 'j' key in vim normal mode moves the cursor down.
 * The movement is limited by the last line of the buffer.
 * Column position is preserved within the bounds of the target line.
 */
export class JMovementPlugin extends DirectionalMovementPlugin {
  /**
   * Plugin name
   */
  readonly name = 'movement-j';

  /**
   * Plugin version
   */
  readonly version = '1.0.0';

  /**
   * Plugin description
   */
  readonly description = 'Move cursor down (j key)';

  /**
   * Keystroke patterns handled by this plugin
   */
  readonly patterns = ['j'];

  /**
   * Modes this plugin is active in
   */
  readonly modes: VimMode[] = [VIM_MODE.NORMAL, VIM_MODE.VISUAL];

  /**
   * Create a new JMovementPlugin
   *
   * @param config - Optional movement configuration
   */
  constructor(config?: MovementConfig) {
    super(
      'movement-j',
      'Move cursor down (j key)',
      'j',
      [VIM_MODE.NORMAL, VIM_MODE.VISUAL],
      config
    );
  }

  /**
   * Calculate new position for down movement
   *
   * Handles multi-line movement with column preservation.
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
    const lineCount = buffer.getLineCount();
    if (lineCount === 0) {
      return cursor.clone();
    }

    const step = config.step;
    const newLine = Math.min(lineCount - 1, cursor.line + step);

    // Get the target line to preserve column within bounds
    const targetLine = buffer.getLine(newLine);
    const maxColumn = targetLine ? targetLine.length : 0;
    const newColumn = Math.min(cursor.desiredColumn, maxColumn);

    return new CursorPosition(newLine, newColumn, cursor.desiredColumn);
  }

  /**
   * Apply down movement (placeholder - calculateNewPosition handles vertical movement)
   *
   * @param cursor - The current cursor position
   * @param _line - The current line content (unused)
   * @param _step - Number of lines to move (unused)
   * @returns The original cursor position
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected applyMovement(cursor: CursorPosition, _line: string, _step: number): CursorPosition {
    // Vertical movement is handled in calculateNewPosition for proper
    // line count and column preservation handling
    return cursor;
  }
}
