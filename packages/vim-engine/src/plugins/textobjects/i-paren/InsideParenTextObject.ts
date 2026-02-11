/**
 * InsideParenTextObject - Inside parenthesis text object (i()
 *
 * Implements the vim 'i(' text object for selecting the content inside parentheses.
 * Works with operators like 'di(' (delete inside parentheses), 'ci(' (change inside parentheses), etc.
 *
 * This plugin finds the nearest pair of parentheses '()' surrounding the cursor position,
 * and returns the boundaries of the content between them (excluding the parentheses themselves).
 *
 * Key behaviors:
 * - Finds the nearest enclosing pair of parentheses around the cursor
 * - Uses bracket matching logic to find the matching closing parenthesis
 * - Works with nested parentheses (finds the innermost pair enclosing the cursor)
 * - Returns boundaries excluding the parentheses (the "inner" content)
 *
 * @example
 * ```typescript
 * import { InsideParenTextObject } from './textobjects/i-paren/InsideParenTextObject';
 *
 * const plugin = new InsideParenTextObject();
 * // With cursor inside "(hello world)" and pressing 'di('
 * // Result: "()" with cursor at position 1
 * ```
 */
import { InsideBracketTextObject } from '../base/InsideBracketTextObject';

/**
 * InsideParenTextObject - Selects the content inside parentheses
 *
 * The 'i(' text object selects the content between the nearest pair of parentheses
 * surrounding the cursor position. It works with operators like d (delete), c (change),
 * y (yank), etc.
 */
export class InsideParenTextObject extends InsideBracketTextObject {
  /**
   * Plugin name
   */
  readonly name = 'textobject-i-paren';

  /**
   * Plugin version
   */
  readonly version = '1.0.0';

  /**
   * Plugin description
   */
  readonly description = 'Inside parenthesis text object (i()';

  /**
   * Keystroke patterns handled by this plugin
   * Note: This is a two-character sequence, handled by the VimExecutor
   */
  readonly patterns = ['i('];

  /**
   * Create a new InsideParenTextObject
   */
  constructor() {
    super('(', ')', 'textobject-i-paren', 'i(', 'Inside parenthesis text object (i()');
  }
}
