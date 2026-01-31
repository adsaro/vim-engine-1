/**
 * XCapitalDeletePlugin - Delete character before cursor (X key - capital)
 *
 * Implements the vim 'X' command for deleting the character before the cursor.
 * In Vim, 'X' is equivalent to 'dh' (delete left).
 * Supports numeric prefix (e.g., '3X' deletes 3 characters to the left).
 *
 * @example
 * ```typescript
 * import { XCapitalDeletePlugin } from './operators/X-capital/XCapitalDeletePlugin';
 *
 * const plugin = new XCapitalDeletePlugin();
 * // Press 'X' to delete character before cursor
 * // Press '3X' to delete 3 characters to the left
 * ```
 */
import { AbstractVimPlugin } from '../../../plugin/AbstractVimPlugin';
import { ExecutionContext } from '../../../plugin/ExecutionContext';
import { VimMode, VIM_MODE } from '../../../state/VimMode';
import { CursorPosition } from '../../../state/CursorPosition';

/**
 * XCapitalDeletePlugin - Deletes character before cursor
 *
 * The 'X' key (Shift+x) in vim normal mode deletes the character before the cursor.
 * If a count is provided (e.g., '3X'), it deletes that many characters to the left.
 */
export class XCapitalDeletePlugin extends AbstractVimPlugin {
  /**
   * Plugin name
   */
  readonly name = 'operator-X-capital';

  /**
   * Plugin version
   */
  readonly version = '1.0.0';

  /**
   * Plugin description
   */
  readonly description = 'Delete character before cursor (X key - capital)';

  /**
   * Keystroke patterns handled by this plugin
   */
  readonly patterns = ['X'];

  /**
   * Modes this plugin is active in
   */
  readonly modes: VimMode[] = [VIM_MODE.NORMAL, VIM_MODE.VISUAL];

  /**
   * Create a new XCapitalDeletePlugin
   */
  constructor() {
    super(
      'operator-X-capital',
      'Delete character before cursor (X key - capital)',
      ['X'],
      [VIM_MODE.NORMAL, VIM_MODE.VISUAL]
    );
  }

  /**
   * Perform the delete action
   *
   * Deletes the character before the cursor.
   * If count is set (e.g., '3X'), deletes that many characters to the left.
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
    // X deletes characters BEFORE the cursor, so we can delete at most cursor.column characters
    const charsToDelete = Math.min(count, cursor.column);

    if (charsToDelete <= 0) {
      return;
    }

    // Calculate the start column for deletion
    const startColumn = cursor.column - charsToDelete;

    // Store deleted text in unnamed register
    const deletedText = line.slice(startColumn, cursor.column);
    context.setRegister('"', deletedText);

    // Delete characters one by one from right to left
    for (let i = 0; i < charsToDelete; i++) {
      buffer.deleteCharAt(cursor.line, cursor.column - 1 - i);
    }

    // Move cursor to the left by the number of deleted characters
    context.setCursor(new CursorPosition(cursor.line, startColumn));
  }
}
