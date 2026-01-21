/**
 * CommaMovementPlugin - Repeat last character search in opposite direction (,)
 *
 * Implements the vim ',' command for repeating the last character search
 * (f, F, t, or T) in the opposite direction.
 *
 * @example
 * ```typescript
 * import { CommaMovementPlugin } from './comma/CommaMovementPlugin';
 *
 * const plugin = new CommaMovementPlugin();
 * // After 'fa', press ',' to find the previous 'a'
 * ```
 */
import { AbstractVimPlugin } from '../../../plugin/AbstractVimPlugin';
import { ExecutionContext } from '../../../plugin/ExecutionContext';
import { ExecutionContextType } from '../../../plugin/VimPlugin';
import { CursorPosition } from '../../../state/CursorPosition';
import { VIM_MODE, VimMode } from '../../../state/VimMode';

/**
 * CommaMovementPlugin - Repeats the last character search in the opposite direction
 *
 * The ',' key repeats the last f, F, t, or T command in the opposite direction.
 * For example, after 'fa', pressing ',' finds the previous 'a'.
 * After 'Fa', pressing ',' finds the next 'a'.
 */
export class CommaMovementPlugin extends AbstractVimPlugin {
  readonly name = 'movement-comma';
  readonly version = '1.0.0';
  readonly description = 'Repeat last character search in opposite direction (,)';
  readonly patterns = [','];
  readonly modes: VimMode[] = [VIM_MODE.NORMAL, VIM_MODE.VISUAL];

  constructor() {
    super('movement-comma', 'Repeat last character search in opposite direction (,)', [','], [VIM_MODE.NORMAL, VIM_MODE.VISUAL]);
  }

  /**
   * Perform the repeated character search in opposite direction
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

    // Use the opposite direction for this search only
    // Don't modify the stored direction - it stays as the original direction
    const oppositeDirection = direction === 'forward' ? 'backward' : 'forward';

    if (oppositeDirection === 'forward') {
      this.searchForward(executionContext, cursor, line, char, count, type, direction);
    } else {
      this.searchBackward(executionContext, cursor, line, char, count, type, direction);
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
    type: 'find' | 'till',
    originalDirection: 'forward' | 'backward'
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
          // DO NOT update the direction - keep the original direction
          state.setLastCharSearch({ char, direction: originalDirection, type });
          return;
        }
      }
    }

    // Character not found - cursor stays in place
    // Still update the last search (but keep original direction)
    state.setLastCharSearch({ char, direction: originalDirection, type });
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
    type: 'find' | 'till',
    originalDirection: 'forward' | 'backward'
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
          // DO NOT update the direction - keep the original direction
          state.setLastCharSearch({ char, direction: originalDirection, type });
          return;
        }
      }
    }

    // Character not found - cursor stays in place
    // Still update the last search (but keep original direction)
    state.setLastCharSearch({ char, direction: originalDirection, type });
  }
}
