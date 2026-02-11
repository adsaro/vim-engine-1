/**
 * InsideSquareBracketTextObject - Inside square bracket text object (i[)
 *
 * Implements the vim 'i[' text object for selecting the content inside square brackets.
 * Works with operators like 'di[' (delete inside square brackets), 'ci[' (change inside square brackets), etc.
 *
 * This plugin finds the nearest pair of square brackets '[]' surrounding the cursor position,
 * and returns the boundaries of the content between them (excluding the brackets themselves).
 *
 * Key behaviors:
 * - Finds the nearest enclosing pair of square brackets around the cursor
 * - Uses bracket matching logic to find the matching closing bracket
 * - Works with nested brackets (finds the innermost pair enclosing the cursor)
 * - Returns boundaries excluding the brackets (the "inner" content)
 *
 * @example
 * ```typescript
 * import { InsideSquareBracketTextObject } from './textobjects/i-square/InsideSquareBracketTextObject';
 *
 * const plugin = new InsideSquareBracketTextObject();
 * // With cursor inside "[hello world]" and pressing 'di['
 * // Result: "[]" with cursor at position 1
 * ```
 */
import { InsideBracketTextObject } from '../base/InsideBracketTextObject';

/**
 * InsideSquareBracketTextObject - Selects the content inside square brackets
 *
 * The 'i[' text object selects the content between the nearest pair of square brackets
 * surrounding the cursor position. It works with operators like d (delete), c (change),
 * y (yank), etc.
 */
export class InsideSquareBracketTextObject extends InsideBracketTextObject {
  /**
   * Plugin name
   */
  readonly name = 'textobject-i-square';

  /**
   * Plugin version
   */
  readonly version = '1.0.0';

  /**
   * Plugin description
   */
  readonly description = 'Inside square bracket text object (i[)';

  /**
   * Keystroke patterns handled by this plugin
   * Note: This is a two-character sequence, handled by the VimExecutor
   */
  readonly patterns = ['i['];

  /**
   * Create a new InsideSquareBracketTextObject
   */
  constructor() {
    super('[', ']', 'textobject-i-square', 'i[', 'Inside square bracket text object (i[)');
  }
}
