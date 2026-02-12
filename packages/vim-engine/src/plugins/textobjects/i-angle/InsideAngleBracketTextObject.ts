/**
 * InsideAngleBracketTextObject - Inside angle bracket text object (i<)
 *
 * Implements the vim 'i<' text object for selecting the content inside angle brackets.
 * Works with operators like 'di<' (delete inside angle brackets), 'ci<' (change inside angle brackets), etc.
 *
 * This plugin finds the nearest pair of angle brackets '<>' surrounding the cursor position,
 * and returns the boundaries of the content between them (excluding the brackets themselves).
 *
 * Key behaviors:
 * - Finds the nearest enclosing pair of angle brackets around the cursor
 * - Uses bracket matching logic to find the matching closing bracket
 * - Works with nested brackets (finds the innermost pair enclosing the cursor)
 * - Returns boundaries excluding the brackets (the "inner" content)
 *
 * @example
 * ```typescript
 * import { InsideAngleBracketTextObject } from './textobjects/i-angle/InsideAngleBracketTextObject';
 *
 * const plugin = new InsideAngleBracketTextObject();
 * // With cursor inside "<hello world>" and pressing 'di<'
 * // Result: "<>" with cursor at position 1
 * ```
 */
import { InsideBracketTextObject } from '../base/InsideBracketTextObject';

/**
 * InsideAngleBracketTextObject - Selects the content inside angle brackets
 *
 * The 'i<' text object selects the content between the nearest pair of angle brackets
 * surrounding the cursor position. It works with operators like d (delete), c (change),
 * y (yank), etc.
 */
export class InsideAngleBracketTextObject extends InsideBracketTextObject {
  /**
   * Plugin name
   */
  readonly name = 'textobject-i-angle';

  /**
   * Plugin version
   */
  readonly version = '1.0.0';

  /**
   * Plugin description
   */
  readonly description = 'Inside angle bracket text object (i<)';

  /**
   * Keystroke patterns handled by this plugin
   * Note: This is a two-character sequence, handled by the VimExecutor
   */
  readonly patterns = ['i<'];

  /**
   * Create a new InsideAngleBracketTextObject
   */
  constructor() {
    super('<', '>', 'textobject-i-angle', 'i<', 'Inside angle bracket text object (i<)');
  }
}
