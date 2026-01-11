/**
 * LMovementPlugin - Move cursor right (l key)
 *
 * Implements the vim 'l' command for moving the cursor right.
 * Stops at the end of the line.
 *
 * @example
 * ```typescript
 * import { LMovementPlugin } from './l/LMovementPlugin';
 *
 * const plugin = new LMovementPlugin();
 * // Press 'l' to move right
 * ```
 *
 * @see DirectionalMovementPlugin For the base class
 */
import { DirectionalMovementPlugin } from '../base/DirectionalMovementPlugin';
import { MovementConfig } from '../base/MovementPlugin';
import { CursorPosition } from '../../../state/CursorPosition';
import { VIM_MODE, VimMode } from '../../../state/VimMode';

/**
 * LMovementPlugin - Moves cursor right by one or more columns
 *
 * The 'l' key in vim normal mode moves the cursor right.
 * The movement is limited by the end of the line.
 */
export class LMovementPlugin extends DirectionalMovementPlugin {
  /**
   * Plugin name
   */
  readonly name = 'movement-l';

  /**
   * Plugin version
   */
  readonly version = '1.0.0';

  /**
   * Plugin description
   */
  readonly description = 'Move cursor right (l key)';

  /**
   * Keystroke patterns handled by this plugin
   */
  readonly patterns = ['l'];

  /**
   * Modes this plugin is active in
   */
  readonly modes: VimMode[] = [VIM_MODE.NORMAL, VIM_MODE.VISUAL];

  /**
   * Create a new LMovementPlugin
   *
   * @param config - Optional movement configuration
   */
  constructor(config?: MovementConfig) {
    super(
      'movement-l',
      'Move cursor right (l key)',
      'l',
      [VIM_MODE.NORMAL, VIM_MODE.VISUAL],
      config
    );
  }

  /**
   * Apply right movement
   *
   * Moves the cursor right by the specified step, stopping at the end of the line.
   *
   * @param cursor - The current cursor position
   * @param line - The current line content
   * @param step - Number of columns to move
   * @returns The new cursor position
   */
  protected applyMovement(cursor: CursorPosition, line: string, step: number): CursorPosition {
    const newColumn = Math.min(line.length, cursor.column + step);
    return new CursorPosition(cursor.line, newColumn);
  }
}
