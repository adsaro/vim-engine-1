/**
 * AroundParenTextObject - Around parenthesis text object (a()
 *
 * Implements the vim 'a(' text object for selecting the content around parentheses.
 * Works with operators like 'da(' (delete around parentheses), 'ca(' (change around parentheses), etc.
 *
 * This plugin finds the nearest pair of parentheses '()' surrounding the cursor position,
 * and returns the boundaries of the content between them including the parentheses themselves.
 *
 * Key behaviors:
 * - Finds the nearest enclosing pair of parentheses around the cursor
 * - Uses bracket matching logic to find the matching closing parenthesis
 * - Works with nested parentheses (finds the innermost pair enclosing the cursor)
 * - Returns boundaries including the parentheses (the "around" content)
 *
 * @example
 * ```typescript
 * import { AroundParenTextObject } from './textobjects/a-paren/AroundParenTextObject';
 *
 * const plugin = new AroundParenTextObject();
 * // With cursor inside "(hello world)" and pressing 'da('
 * // Result: "" with cursor at position 0 (parentheses included in deletion)
 * ```
 */
import { AroundBracketTextObject } from '../base/AroundBracketTextObject';

/**
 * AroundParenTextObject - Selects the content around parentheses
 *
 * The 'a(' text object selects the content between the nearest pair of parentheses
 * surrounding the cursor position, including the parentheses themselves. It works with
 * operators like d (delete), c (change), y (yank), etc.
 */
export class AroundParenTextObject extends AroundBracketTextObject {
  /**
   * Plugin name
   */
  readonly name = 'textobject-a-paren';

  /**
   * Plugin version
   */
  readonly version = '1.0.0';

  /**
   * Plugin description
   */
  readonly description = 'Around parenthesis text object (a()';

  /**
   * Keystroke patterns handled by this plugin
   * Note: This is a two-character sequence, handled by the VimExecutor
   */
  readonly patterns = ['a('];

  /**
   * Create a new AroundParenTextObject
   */
  constructor() {
    super('(', ')', 'textobject-a-paren', 'a(', 'Around parenthesis text object (a()');
  }
}
