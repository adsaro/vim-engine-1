/**
 * PercentMovementPlugin - Jump to matching bracket (% key)
 *
 * Uses the bracket matching algorithm to jump between matching brackets.
 * This implements the standard vim % keybinding behavior.
 *
 * @example
 * ```typescript
 * // Before: "(hello world)" with cursor on '('
 * // After:  "(hello world)" with cursor on ')'
 * ```
 *
 * @see MovementPlugin For the base class
 * @see bracketMatcher For the bracket matching algorithm
 */
import { MovementPlugin, MovementConfig } from '../base/MovementPlugin';
import { CursorPosition } from '../../../state/CursorPosition';
import { VimMode, VIM_MODE } from '../../../state/VimMode';
import { TextBuffer } from '../../../state/TextBuffer';
import { findMatchingBracket } from '../utils/bracketMatcher';

/**
 * PercentMovementPlugin - Jump to matching bracket (% key)
 *
 * Jumps the cursor to the matching bracket when positioned on a bracket character.
 * If not on a bracket, searches forward for the next bracket pair and jumps to its match.
 *
 * Key features:
 * - Supports all bracket types: (), [], {}, <>
 * - Handles nested brackets correctly
 * - Works across multiple lines
 * - Jumps to next bracket pair if not on a bracket
 * - Works in NORMAL and VISUAL modes
 *
 * @example
 * ```typescript
 * // Basic usage
 * const plugin = new PercentMovementPlugin();
 * executor.registerPlugin(plugin);
 *
 * // Jump to matching bracket
 * executor.handleKeystroke('%');
 *
 * // Jump from opening to closing
 * // Before: "(hello)" with cursor at position 0
 * // After:  "(hello)" with cursor at position 6
 * ```
 */
export class PercentMovementPlugin extends MovementPlugin {
  readonly name = 'movement-percent';
  readonly version = '1.0.0';
  readonly description = 'Jump to matching bracket (% key)';
  readonly patterns = ['%'];
  readonly modes: VimMode[] = [VIM_MODE.NORMAL, VIM_MODE.VISUAL];

  /**
   * Create a new PercentMovementPlugin
   */
  constructor() {
    super(
      'movement-percent',
      'Jump to matching bracket (% key)',
      '%',
      [VIM_MODE.NORMAL, VIM_MODE.VISUAL]
    );
  }

  /**
   * Calculate the new cursor position based on bracket matching
   *
   * Gets the current cursor position and uses the bracket matching algorithm
   * to find the matching bracket position.
   *
   * @param cursor - The current cursor position
   * @param buffer - The text buffer
   * @param _config - The movement configuration (unused)
   * @returns The position of the matching bracket, or current position if not found
   */
  protected calculateNewPosition(
    cursor: CursorPosition,
    buffer: TextBuffer,
    _config: Required<MovementConfig>
  ): CursorPosition {
    // Use the bracket matching algorithm to find the matching bracket
    const result = findMatchingBracket(buffer, cursor);

    if (result.found) {
      return new CursorPosition(result.line, result.column);
    }

    // No matching bracket found - stay at current position
    return new CursorPosition(cursor.line, cursor.column);
  }
}
