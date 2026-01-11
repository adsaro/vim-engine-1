/**
 * HMovementPlugin - Move cursor left (h key)
 *
 * Implements the vim 'h' command for moving the cursor left.
 * Stops at the beginning of the line.
 *
 * @example
 * ```typescript
 * import { HMovementPlugin } from './h/HMovementPlugin';
 *
 * const plugin = new HMovementPlugin();
 * // Press 'h' to move left
 * ```
 *
 * @see DirectionalMovementPlugin For the base class
 */
import { DirectionalMovementPlugin } from '../base/DirectionalMovementPlugin';
import { MovementConfig } from '../base/MovementPlugin';
import { CursorPosition } from '../../../state/CursorPosition';
import { VIM_MODE, VimMode } from '../../../state/VimMode';

/**
 * HMovementPlugin - Moves cursor left by one or more columns
 *
 * The 'h' key in vim normal mode moves the cursor left.
 * The movement is limited by the start of the line.
 */
export class HMovementPlugin extends DirectionalMovementPlugin {
  /**
   * Plugin name
   */
  readonly name = 'movement-h';

  /**
   * Plugin version
   */
  readonly version = '1.0.0';

  /**
   * Plugin description
   */
  readonly description = 'Move cursor left (h key)';

  /**
   * Keystroke patterns handled by this plugin
   */
  readonly patterns = ['h'];

  /**
   * Modes this plugin is active in
   */
  readonly modes: VimMode[] = [VIM_MODE.NORMAL, VIM_MODE.VISUAL];

  /**
   * Create a new HMovementPlugin
   *
   * @param config - Optional movement configuration
   */
  constructor(config?: MovementConfig) {
    super(
      'movement-h',
      'Move cursor left (h key)',
      'h',
      [VIM_MODE.NORMAL, VIM_MODE.VISUAL],
      config
    );
  }

  /**
   * Apply left movement
   *
   * Moves the cursor left by the specified step, stopping at column 0.
   *
   * @param cursor - The current cursor position
   * @param line - The current line content (unused for left movement)
   * @param step - Number of columns to move
   * @returns The new cursor position
   */
  protected applyMovement(cursor: CursorPosition, _line: string, step: number): CursorPosition {
    const newColumn = Math.max(0, cursor.column - step);
    return new CursorPosition(cursor.line, newColumn);
  }
}
