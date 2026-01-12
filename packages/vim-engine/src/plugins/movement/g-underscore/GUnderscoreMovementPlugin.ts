/**
 * GUnderscoreMovementPlugin - Move to last non-whitespace character (g_ key)
 *
 * Moves the cursor to the last non-whitespace character of the line.
 * This is different from $ which moves to the very last character (including trailing whitespace).
 *
 * @example
 * ```typescript
 * // Before: "hello world  " with cursor at column 0 (on 'h')
 * // After:  "hello world  " with cursor at column 10 (on 'd')
 * ```
 *
 * @see LineMovementPlugin For the base class
 */
import { LineMovementPlugin } from '../base/LineMovementPlugin';
import { CursorPosition } from '../../../state/CursorPosition';
import { VimMode, VIM_MODE } from '../../../state/VimMode';
import { findLastNonWhitespace } from '../utils/lineUtils';

/**
 * GUnderscoreMovementPlugin - Move to last non-whitespace character (g_ key)
 *
 * Moves the cursor to the last non-whitespace character of the line.
 *
 * Key features:
 * - Moves to last non-whitespace character (excludes trailing spaces and tabs)
 * - Stays at column 0 if line is empty or whitespace-only
 * - Supports count-based movements (e.g., 3g_ moves 3 lines down then to last non-whitespace)
 * - Works in NORMAL and VISUAL modes
 *
 * @example
 * ```typescript
 * // Basic usage
 * const plugin = new GUnderscoreMovementPlugin();
 * executor.registerPlugin(plugin);
 *
 * // Move to last non-whitespace on current line
 * executor.handleKeystroke('g_');
 *
 * // Move to last non-whitespace on line 3 lines down
 * executor.handleKeystroke('3g_');
 * ```
 */
export class GUnderscoreMovementPlugin extends LineMovementPlugin {
  readonly name = 'movement-g-underscore';
  readonly version = '1.0.0';
  readonly description = 'Move to last non-blank character (g_ key)';
  readonly patterns = ['g_'];
  readonly modes: VimMode[] = [VIM_MODE.NORMAL, VIM_MODE.VISUAL];

  /**
   * Create a new GUnderscoreMovementPlugin
   */
  constructor() {
    super(
      'movement-g-underscore',
      'Move to last non-blank character (g_ key)',
      'g_',
      [VIM_MODE.NORMAL, VIM_MODE.VISUAL]
    );
  }

  /**
   * Calculate the target column position
   *
   * For g_ command, find the last non-whitespace character.
   * If the line is empty or contains only whitespace, return 0.
   *
   * @param line - The current line content
   * @param cursor - The current cursor position (ignored for g_ command)
   * @returns The column of the last non-whitespace character, or 0 if none found
   */
  protected calculateLinePosition(
    line: string,
    _cursor: CursorPosition
  ): number {
    const lastNonWhitespace = findLastNonWhitespace(line);
    return lastNonWhitespace !== null ? lastNonWhitespace : 0;
  }
}
