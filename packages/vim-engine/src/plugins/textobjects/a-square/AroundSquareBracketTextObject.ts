/**
 * AroundSquareBracketTextObject - Around square bracket text object (a[)
 *
 * Implements the vim 'a[' text object for selecting the content around square brackets.
 * Works with operators like 'da[' (delete around square brackets), 'ca[' (change around square brackets), etc.
 *
 * This plugin finds the nearest pair of square brackets '[]' surrounding the cursor position,
 * and returns the boundaries of the content between them including the brackets themselves.
 *
 * Key behaviors:
 * - Finds the nearest enclosing pair of square brackets around the cursor
 * - Uses bracket matching logic to find the matching closing bracket
 * - Works with nested brackets (finds the innermost pair enclosing the cursor)
 * - Returns boundaries including the brackets (the "around" content)
 *
 * @example
 * ```typescript
 * import { AroundSquareBracketTextObject } from './textobjects/a-square/AroundSquareBracketTextObject';
 *
 * const plugin = new AroundSquareBracketTextObject();
 * // With cursor inside "[hello world]" and pressing 'da['
 * // Result: "" with cursor at position 0 (brackets included in deletion)
 * ```
 */
import { AroundBracketTextObject } from '../base/AroundBracketTextObject';

/**
 * AroundSquareBracketTextObject - Selects the content around square brackets
 *
 * The 'a[' text object selects the content between the nearest pair of square brackets
 * surrounding the cursor position, including the brackets themselves. It works with
 * operators like d (delete), c (change), y (yank), etc.
 */
export class AroundSquareBracketTextObject extends AroundBracketTextObject {
  /**
   * Plugin name
   */
  readonly name = 'textobject-a-square';

  /**
   * Plugin version
   */
  readonly version = '1.0.0';

  /**
   * Plugin description
   */
  readonly description = 'Around square bracket text object (a[)';

  /**
   * Keystroke patterns handled by this plugin
   * Note: This is a two-character sequence, handled by the VimExecutor
   */
  readonly patterns = ['a['];

  /**
   * Create a new AroundSquareBracketTextObject
   */
  constructor() {
    super('[', ']', 'textobject-a-square', 'a[', 'Around square bracket text object (a[)');
  }
}
