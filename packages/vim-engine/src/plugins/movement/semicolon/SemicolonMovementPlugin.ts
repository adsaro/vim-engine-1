/**
 * SemicolonMovementPlugin - Repeat last character search (;)
 *
 * Implements the vim ';' command for repeating the last character search
 * (f, F, t, or T) in the same direction.
 *
 * @example
 * ```typescript
 * import { SemicolonMovementPlugin } from './semicolon/SemicolonMovementPlugin';
 *
 * const plugin = new SemicolonMovementPlugin();
 * // After 'fa', press ';' to find the next 'a'
 * ```
 */
import { AbstractVimPlugin } from '../../../plugin/AbstractVimPlugin';
import { ExecutionContext } from '../../../plugin/ExecutionContext';
import { ExecutionContextType } from '../../../plugin/VimPlugin';
import { CursorPosition } from '../../../state/CursorPosition';
import { VIM_MODE, VimMode } from '../../../state/VimMode';

/**
 * SemicolonMovementPlugin - Repeats the last character search in the same direction
 *
 * The ';' key repeats the last f, F, t, or T command in the same direction.
 * For example, after 'fa', pressing ';' finds the next 'a'.
 */
export class SemicolonMovementPlugin extends AbstractVimPlugin {
  readonly name = 'movement-semicolon';
  readonly version = '1.0.0';
  readonly description = 'Repeat last character search (;)';
  readonly patterns = [';'];
  readonly modes: VimMode[] = [VIM_MODE.NORMAL, VIM_MODE.VISUAL];

  constructor() {
    super('movement-semicolon', 'Repeat last character search (;)', [';'], [VIM_MODE.NORMAL, VIM_MODE.VISUAL]);
  }

  /**
   * Perform the repeated character search
   *
   * @param context - The execution context
   */
  protected performAction(context: ExecutionContextType): void {
    const executionContext = context as ExecutionContext;
    const state = executionContext.getState();
    const cursor = executionContext.getCursor();
    const buffer = executionContext.getBuffer();

    // Get the last character search
    const lastSearch = state.getLastCharSearch();
    if (!lastSearch) {
      return; // No previous character search
    }

    // Get the current line
    const line = buffer.getLine(cursor.line);
    if (!line || line.length === 0) {
      return;
    }

    const { char, direction, type } = lastSearch;

    // Get count for nth occurrence
    const count = executionContext.getCount();

    if (direction === 'forward') {
      this.searchForward(executionContext, cursor, line, char, count, type);
    } else {
      this.searchBackward(executionContext, cursor, line, char, count, type);
    }
  }

  /**
   * Search forward for the character
   */
  private searchForward(
    context: ExecutionContext,
    cursor: CursorPosition,
    line: string,
    char: string,
    count: number,
    type: 'find' | 'till'
  ): void {
    const state = context.getState();

    // Search forward from cursor position
    // For 'till' type, we start from cursor + 2 to skip the character we just landed before
    const searchStart = cursor.column + (type === 'till' ? 2 : 1);
    let occurrenceCount = 0;

    for (let i = searchStart; i < line.length; i++) {
      if (line[i] === char) {
        occurrenceCount++;
        if (occurrenceCount === count) {
          // Found the nth occurrence
          const targetColumn = type === 'find' ? i : i - 1;
          context.setCursor(new CursorPosition(cursor.line, Math.max(0, targetColumn)));
          // Update the last search (same parameters)
          state.setLastCharSearch({ char, direction: 'forward', type });
          return;
        }
      }
    }

    // Character not found - cursor stays in place
    // Still update the last search
    state.setLastCharSearch({ char, direction: 'forward', type });
  }

  /**
   * Search backward for the character
   */
  private searchBackward(
    context: ExecutionContext,
    cursor: CursorPosition,
    line: string,
    char: string,
    count: number,
    type: 'find' | 'till'
  ): void {
    const state = context.getState();

    // Search backward from cursor position (don't include current position)
    // For 'till' type, we start from cursor - 2 to skip the character we just landed after
    const searchStart = cursor.column - (type === 'till' ? 2 : 1);
    let occurrenceCount = 0;

    for (let i = searchStart; i >= 0; i--) {
      if (line[i] === char) {
        occurrenceCount++;
        if (occurrenceCount === count) {
          // Found the nth occurrence
          const targetColumn = type === 'find' ? i : i + 1;
          context.setCursor(new CursorPosition(cursor.line, Math.min(line.length - 1, targetColumn)));
          // Update the last search (same parameters)
          state.setLastCharSearch({ char, direction: 'backward', type });
          return;
        }
      }
    }

    // Character not found - cursor stays in place
    // Still update the last search
    state.setLastCharSearch({ char, direction: 'backward', type });
  }
}
