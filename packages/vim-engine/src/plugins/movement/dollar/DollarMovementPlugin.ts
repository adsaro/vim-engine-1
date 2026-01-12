/**
 * DollarMovementPlugin - Move to end of line ($ key)
 *
 * Moves the cursor to the very last character of the line.
 * This includes trailing whitespace characters.
 *
 * @example
 * ```typescript
 * // Before: "hello world" with cursor at column 0 (on 'h')
 * // After:  "hello world" with cursor at column 10 (on 'd')
 * ```
 *
 * @see LineMovementPlugin For the base class
 */
import { LineMovementPlugin } from '../base/LineMovementPlugin';
import { CursorPosition } from '../../../state/CursorPosition';
import { VIM_MODE } from '../../../state/VimMode';

/**
 * DollarMovementPlugin - Move to end of line ($ key)
 *
 * Moves the cursor to the very last character of the line.
 *
 * Key features:
 * - Moves to the last character (line.length - 1)
 * - Includes trailing whitespace in the target position
 * - Stays at column 0 if line is empty
 * - Supports count-based movements (e.g., 3$ moves 3 lines down then to end)
 * - Works in NORMAL and VISUAL modes
 *
 * @example
 * ```typescript
 * // Basic usage
 * const plugin = new DollarMovementPlugin();
 * executor.registerPlugin(plugin);
 *
 * // Move to end of current line
 * executor.handleKeystroke('$');
 *
 * // Move to end of line 3 lines down
 * executor.handleKeystroke('3$');
 * ```
 */
export class DollarMovementPlugin extends LineMovementPlugin {
  readonly name = 'movement-dollar';
  readonly version = '1.0.0';
  readonly description = 'Move to end of line ($ key)';
  readonly patterns = ['$'];
  readonly modes: VIM_MODE[] = [VIM_MODE.NORMAL, VIM_MODE.VISUAL];

  /**
   * Create a new DollarMovementPlugin
   */
  constructor() {
    super(
      'movement-dollar',
      'Move to end of line ($ key)',
      '$',
      [VIM_MODE.NORMAL, VIM_MODE.VISUAL]
    );
  }

  /**
   * Calculate the target column position
   *
   * For $ command, move to the last character (line.length - 1).
   * If line is empty (length 0), return 0.
   *
   * @param line - The current line content
   * @param cursor - The current cursor position (ignored for $ command)
   * @returns The column of the last character, or 0 if line is empty
   */
  protected calculateLinePosition(
    line: string,
    cursor: CursorPosition
  ): number {
    // Move to last character (line.length - 1), or 0 if line is empty
    return Math.max(0, line.length - 1);
  }
}
