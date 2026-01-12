/**
 * CaretMovementPlugin - Move to first non-whitespace character (^ key)
 *
 * Moves the cursor to the first non-whitespace character on the current line.
 * This is different from 0 which moves to column 0 (absolute start).
 *
 * @example
 * ```typescript
 * // Before: "  hello world" with cursor at column 8 (on 'w')
 * // After:  "  hello world" with cursor at column 2 (on 'h')
 * ```
 *
 * @see LineMovementPlugin For the base class
 */
import { LineMovementPlugin } from '../base/LineMovementPlugin';
import { CursorPosition } from '../../../state/CursorPosition';
import { VimMode, VIM_MODE } from '../../../state/VimMode';
import { findFirstNonWhitespace } from '../utils/lineUtils';

/**
 * CaretMovementPlugin - Move to first non-whitespace character (^ key)
 *
 * Moves the cursor to the first non-whitespace character on the current line.
 *
 * Key features:
 * - Moves to first non-whitespace character (skips leading spaces and tabs)
 * - Stays at column 0 if line is empty or whitespace-only
 * - Supports count-based movements (e.g., 3^ moves 3 lines down then to first non-whitespace)
 * - Works in NORMAL and VISUAL modes
 *
 * @example
 * ```typescript
 * // Basic usage
 * const plugin = new CaretMovementPlugin();
 * executor.registerPlugin(plugin);
 *
 * // Move to first non-whitespace on current line
 * executor.handleKeystroke('^');
 *
 * // Move to first non-whitespace on line 3 lines down
 * executor.handleKeystroke('3^');
 * ```
 */
export class CaretMovementPlugin extends LineMovementPlugin {
  readonly name = 'movement-caret';
  readonly version = '1.0.0';
  readonly description = 'Move to first non-blank character (^ key)';
  readonly patterns = ['^'];
  readonly modes: VimMode[] = [VIM_MODE.NORMAL, VIM_MODE.VISUAL];

  /**
   * Create a new CaretMovementPlugin
   */
  constructor() {
    super(
      'movement-caret',
      'Move to first non-blank character (^ key)',
      '^',
      [VIM_MODE.NORMAL, VIM_MODE.VISUAL]
    );
  }

  /**
   * Calculate the target column position
   *
   * For ^ command, find the first non-whitespace character.
   * If the line is empty or contains only whitespace, return 0.
   *
   * @param line - The current line content
   * @param cursor - The current cursor position (ignored for ^ command)
   * @returns The column of the first non-whitespace character, or 0 if none found
   */
  protected calculateLinePosition(
    line: string,
    _cursor: CursorPosition
  ): number {
    const firstNonWhitespace = findFirstNonWhitespace(line);
    return firstNonWhitespace !== null ? firstNonWhitespace : 0;
  }
}
