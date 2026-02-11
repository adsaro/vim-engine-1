/**
 * InsideCurlyBraceTextObject - Inside curly brace text object (i{)
 *
 * Implements the vim 'i{' text object for selecting the content inside curly braces.
 * Works with operators like 'di{' (delete inside curly braces), 'ci{' (change inside curly braces), etc.
 *
 * This plugin finds the nearest pair of curly braces '{}' surrounding the cursor position,
 * and returns the boundaries of the content between them (excluding the braces themselves).
 *
 * Key behaviors:
 * - Finds the nearest enclosing pair of curly braces around the cursor
 * - Uses bracket matching logic to find the matching closing brace
 * - Works with nested braces (finds the innermost pair enclosing the cursor)
 * - Returns boundaries excluding the braces (the "inner" content)
 *
 * @example
 * ```typescript
 * import { InsideCurlyBraceTextObject } from './textobjects/i-curly/InsideCurlyBraceTextObject';
 *
 * const plugin = new InsideCurlyBraceTextObject();
 * // With cursor inside "{hello world}" and pressing 'di{'
 * // Result: "{}" with cursor at position 1
 * ```
 */
import { InsideBracketTextObject } from '../base/InsideBracketTextObject';

/**
 * InsideCurlyBraceTextObject - Selects the content inside curly braces
 *
 * The 'i{' text object selects the content between the nearest pair of curly braces
 * surrounding the cursor position. It works with operators like d (delete), c (change),
 * y (yank), etc.
 */
export class InsideCurlyBraceTextObject extends InsideBracketTextObject {
  /**
   * Plugin name
   */
  readonly name = 'textobject-i-curly';

  /**
   * Plugin version
   */
  readonly version = '1.0.0';

  /**
   * Plugin description
   */
  readonly description = 'Inside curly brace text object (i{)';

  /**
   * Keystroke patterns handled by this plugin
   * Note: This is a two-character sequence, handled by the VimExecutor
   */
  readonly patterns = ['i{'];

  /**
   * Create a new InsideCurlyBraceTextObject
   */
  constructor() {
    super('{', '}', 'textobject-i-curly', 'i{', 'Inside curly brace text object (i{)');
  }
}
