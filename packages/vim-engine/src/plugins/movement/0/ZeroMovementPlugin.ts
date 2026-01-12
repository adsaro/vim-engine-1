/**
 * ZeroMovementPlugin - Move to start of line (0 key)
 *
 * Moves the cursor to column 0 (absolute start of line).
 * This is different from ^ which moves to the first non-whitespace character.
 *
 * @example
 * ```typescript
 * // Before: "hello world" with cursor at column 5 (on 'w')
 * // After:  "hello world" with cursor at column 0 (on 'h')
 * ```
 *
 * @see LineMovementPlugin For the base class
 */
import { LineMovementPlugin } from '../base/LineMovementPlugin';
import { CursorPosition } from '../../../state/CursorPosition';
import { VIM_MODE } from '../../../state/VimMode';

/**
 * ZeroMovementPlugin - Move to start of line (0 key)
 *
 * Moves the cursor to column 0 (absolute start of line).
 *
 * Key features:
 * - Always moves to column 0 regardless of line content
 * - Works on empty lines (stays at column 0)
 * - Supports count-based movements (e.g., 30 moves 3 lines down then to column 0)
 * - Works in NORMAL and VISUAL modes
 *
 * @example
 * ```typescript
 * // Basic usage
 * const plugin = new ZeroMovementPlugin();
 * executor.registerPlugin(plugin);
 *
 * // Move to start of current line
 * executor.handleKeystroke('0');
 *
 * // Move to start of line 3 lines down
 * executor.handleKeystroke('30');
 * ```
 */
export class ZeroMovementPlugin extends LineMovementPlugin {
  readonly name = 'movement-0';
  readonly version = '1.0.0';
  readonly description = 'Move to start of line (0 key)';
  readonly patterns = ['0'];
  readonly modes: VIM_MODE[] = [VIM_MODE.NORMAL, VIM_MODE.VISUAL];

  /**
   * Create a new ZeroMovementPlugin
   */
  constructor() {
    super(
      'movement-0',
      'Move to start of line (0 key)',
      '0',
      [VIM_MODE.NORMAL, VIM_MODE.VISUAL]
    );
  }

  /**
   * Calculate the target column position
   *
   * For the 0 command, always return column 0 (absolute start of line).
   *
   * @param line - The current line content (ignored for 0 command)
   * @param cursor - The current cursor position (ignored for 0 command)
   * @returns Always returns 0
   */
  protected calculateLinePosition(
    line: string,
    cursor: CursorPosition
  ): number {
    return 0;
  }
}
