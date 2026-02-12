/**
 * AroundAngleBracketTextObject - Around angle bracket text object (a<)
 *
 * Implements the vim 'a<' text object for selecting the content around angle brackets.
 * Works with operators like 'da<' (delete around angle brackets), 'ca<' (change around angle brackets), etc.
 *
 * This plugin finds the nearest pair of angle brackets '<>' surrounding the cursor position,
 * and returns the boundaries of the content between them including the brackets themselves.
 *
 * Key behaviors:
 * - Finds the nearest enclosing pair of angle brackets around the cursor
 * - Uses bracket matching logic to find the matching closing bracket
 * - Works with nested brackets (finds the innermost pair enclosing the cursor)
 * - Returns boundaries including the brackets (the "around" content)
 *
 * @example
 * ```typescript
 * import { AroundAngleBracketTextObject } from './textobjects/a-angle/AroundAngleBracketTextObject';
 *
 * const plugin = new AroundAngleBracketTextObject();
 * // With cursor inside "<hello world>" and pressing 'da<'
 * // Result: "" with cursor at position 0 (brackets included in deletion)
 * ```
 */
import { AroundBracketTextObject } from '../base/AroundBracketTextObject';

/**
 * AroundAngleBracketTextObject - Selects the content around angle brackets
 *
 * The 'a<' text object selects the content between the nearest pair of angle brackets
 * surrounding the cursor position, including the brackets themselves. It works with
 * operators like d (delete), c (change), y (yank), etc.
 */
export class AroundAngleBracketTextObject extends AroundBracketTextObject {
  /**
   * Plugin name
   */
  readonly name = 'textobject-a-angle';

  /**
   * Plugin version
   */
  readonly version = '1.0.0';

  /**
   * Plugin description
   */
  readonly description = 'Around angle bracket text object (a<)';

  /**
   * Keystroke patterns handled by this plugin
   * Note: This is a two-character sequence, handled by the VimExecutor
   */
  readonly patterns = ['a<'];

  /**
   * Create a new AroundAngleBracketTextObject
   */
  constructor() {
    super('<', '>', 'textobject-a-angle', 'a<', 'Around angle bracket text object (a<)');
  }
}
