/**
 * AroundCurlyBraceTextObject - Around curly brace text object (a{)
 *
 * Implements the vim 'a{' text object for selecting the content around curly braces.
 * Works with operators like 'da{' (delete around curly braces), 'ca{' (change around curly braces), etc.
 *
 * This plugin finds the nearest pair of curly braces '{}' surrounding the cursor position,
 * and returns the boundaries of the content between them including the braces themselves.
 *
 * Key behaviors:
 * - Finds the nearest enclosing pair of curly braces around the cursor
 * - Uses bracket matching logic to find the matching closing brace
 * - Works with nested braces (finds the innermost pair enclosing the cursor)
 * - Returns boundaries including the braces (the "around" content)
 *
 * @example
 * ```typescript
 * import { AroundCurlyBraceTextObject } from './textobjects/a-curly/AroundCurlyBraceTextObject';
 *
 * const plugin = new AroundCurlyBraceTextObject();
 * // With cursor inside "{hello world}" and pressing 'da{'
 * // Result: "" with cursor at position 0 (braces included in deletion)
 * ```
 */
import { AroundBracketTextObject } from '../base/AroundBracketTextObject';

/**
 * AroundCurlyBraceTextObject - Selects the content around curly braces
 *
 * The 'a{' text object selects the content between the nearest pair of curly braces
 * surrounding the cursor position, including the braces themselves. It works with
 * operators like d (delete), c (change), y (yank), etc.
 */
export class AroundCurlyBraceTextObject extends AroundBracketTextObject {
  /**
   * Plugin name
   */
  readonly name = 'textobject-a-curly';

  /**
   * Plugin version
   */
  readonly version = '1.0.0';

  /**
   * Plugin description
   */
  readonly description = 'Around curly brace text object (a{)';

  /**
   * Keystroke patterns handled by this plugin
   * Note: This is a two-character sequence, handled by the VimExecutor
   */
  readonly patterns = ['a{'];

  /**
   * Create a new AroundCurlyBraceTextObject
   */
  constructor() {
    super('{', '}', 'textobject-a-curly', 'a{', 'Around curly brace text object (a{)');
  }
}
