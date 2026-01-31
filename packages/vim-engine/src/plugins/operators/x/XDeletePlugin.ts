/**
 * XDeletePlugin - Delete character under cursor (x key)
 *
 * Implements the vim 'x' command for deleting the character under the cursor.
 * In Vim, 'x' is equivalent to 'dl' (delete right).
 * Supports numeric prefix (e.g., '3x' deletes 3 characters).
 *
 * @example
 * ```typescript
 * import { XDeletePlugin } from './operators/x/XDeletePlugin';
 *
 * const plugin = new XDeletePlugin();
 * // Press 'x' to delete character under cursor
 * // Press '3x' to delete 3 characters
 * ```
 */
import { AbstractVimPlugin } from '../../../plugin/AbstractVimPlugin';
import { ExecutionContext } from '../../../plugin/ExecutionContext';
import { VimMode, VIM_MODE } from '../../../state/VimMode';
import { CursorPosition } from '../../../state/CursorPosition';

/**
 * XDeletePlugin - Deletes character under cursor
 *
 * The 'x' key in vim normal mode deletes the character under the cursor.
 * If a count is provided (e.g., '3x'), it deletes that many characters.
 */
export class XDeletePlugin extends AbstractVimPlugin {
  /**
   * Plugin name
   */
  readonly name = 'operator-x';

  /**
   * Plugin version
   */
  readonly version = '1.0.0';

  /**
   * Plugin description
   */
  readonly description = 'Delete character under cursor (x key)';

  /**
   * Keystroke patterns handled by this plugin
   */
  readonly patterns = ['x'];

  /**
   * Modes this plugin is active in
   */
  readonly modes: VimMode[] = [VIM_MODE.NORMAL, VIM_MODE.VISUAL];

  /**
   * Create a new XDeletePlugin
   */
  constructor() {
    super(
      'operator-x',
      'Delete character under cursor (x key)',
      ['x'],
      [VIM_MODE.NORMAL, VIM_MODE.VISUAL]
    );
  }

  /**
   * Perform the delete action
   *
   * Deletes the character under the cursor.
   * If count is set (e.g., '3x'), deletes that many characters.
   * The deleted text is stored in the unnamed register.
   *
   * @param context - The execution context
   */
  protected performAction(context: ExecutionContext): void {
    const buffer = context.getBuffer();
    const cursor = context.getCursor();
    const count = context.getCount();

    // Don't do anything if buffer is empty
    if (buffer.isEmpty()) {
      return;
    }

    const line = buffer.getLine(cursor.line);
    if (line === null) {
      return;
    }

    // Calculate how many characters to delete (respecting line boundaries)
    const charsToDelete = Math.min(count, line.length - cursor.column);

    if (charsToDelete <= 0) {
      return;
    }

    // Store deleted text in unnamed register
    const deletedText = line.slice(cursor.column, cursor.column + charsToDelete);
    context.setRegister('"', deletedText);

    // Delete characters one by one
    for (let i = 0; i < charsToDelete; i++) {
      buffer.deleteCharAt(cursor.line, cursor.column);
    }

    // Adjust cursor position if we're at the end of the line after deletion
    const newLine = buffer.getLine(cursor.line);
    if (newLine !== null && cursor.column >= newLine.length && newLine.length > 0) {
      // Move cursor back to the last valid position on the line
      context.setCursor(new CursorPosition(cursor.line, newLine.length - 1));
    }
  }
}
