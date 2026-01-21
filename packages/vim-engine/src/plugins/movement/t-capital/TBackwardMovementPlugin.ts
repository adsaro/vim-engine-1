/**
 * TBackwardMovementPlugin - Till character backward (T{char})
 *
 * Implements the vim 'T{char}' command for finding the previous occurrence
 * of a character to the left on the current line and moving just after it.
 *
 * @example
 * ```typescript
 * import { TBackwardMovementPlugin } from './t-capital/TBackwardMovementPlugin';
 *
 * const plugin = new TBackwardMovementPlugin();
 * // Press 'Ta' to move to just after the previous 'a'
 * // Press '3Ta' to move to just after the 3rd 'a' backward
 * ```
 */
import { AbstractVimPlugin } from '../../../plugin/AbstractVimPlugin';
import { ExecutionContext } from '../../../plugin/ExecutionContext';
import { ExecutionContextType } from '../../../plugin/VimPlugin';
import { CursorPosition } from '../../../state/CursorPosition';
import { VIM_MODE, VimMode } from '../../../state/VimMode';

/**
 * TBackwardMovementPlugin - Finds and moves just after the previous occurrence of character
 *
 * The 'T' key followed by any character moves the cursor to just after
 * the previous occurrence of that character to the left on the current line.
 *
 * This plugin registers all possible patterns like 'Ta', 'Tb', 'Tc', etc.
 */
export class TBackwardMovementPlugin extends AbstractVimPlugin {
  readonly name = 'movement-T';
  readonly version = '1.0.0';
  readonly description = 'Till character backward (T{char})';
  readonly patterns: string[];
  readonly modes: VimMode[] = [VIM_MODE.NORMAL, VIM_MODE.VISUAL];

  /**
   * Create a new TBackwardMovementPlugin
   *
   * Generates all possible T{char} patterns (T followed by any printable character)
   */
  constructor() {
    const patterns = TBackwardMovementPlugin.generatePatterns();
    super('movement-T', 'Till character backward (T{char})', patterns, [
      VIM_MODE.NORMAL,
      VIM_MODE.VISUAL,
    ]);
    this.patterns = patterns;
  }

  /**
   * Generate all possible T{char} patterns
   *
   * Creates patterns for all printable ASCII characters
   *
   * @returns Array of pattern strings
   */
  private static generatePatterns(): string[] {
    const patterns: string[] = [];

    // All printable ASCII characters (space through tilde)
    for (let i = 32; i <= 126; i++) {
      const char = String.fromCharCode(i);
      patterns.push('T' + char);
    }

    return patterns;
  }

  /**
   * Perform the character search till backward
   *
   * @param context - The execution context
   */
  protected performAction(context: ExecutionContextType): void {
    const executionContext = context as ExecutionContext;
    const state = executionContext.getState();
    const cursor = executionContext.getCursor();
    const buffer = executionContext.getBuffer();

    // Get the current line
    const line = buffer.getLine(cursor.line);
    if (!line || line.length === 0) {
      return;
    }

    // Extract target character from the pattern
    const pattern = executionContext.getCurrentPattern();
    if (!pattern || pattern.length < 2) {
      return;
    }

    const char = pattern[1];

    // Get count for nth occurrence
    const count = executionContext.getCount();

    // Search backward from cursor position (don't include current position)
    const searchStart = cursor.column - 1;
    let occurrenceCount = 0;

    for (let i = searchStart; i >= 0; i--) {
      if (line[i] === char) {
        occurrenceCount++;
        if (occurrenceCount === count) {
          // Found the nth occurrence - move cursor to just after it
          executionContext.setCursor(new CursorPosition(cursor.line, i + 1));
          // Store for repetition with ; and ,
          state.setLastCharSearch({ char, direction: 'backward' });
          return;
        }
      }
    }

    // Character not found - cursor stays in place
    // Still store the search for potential repetition
    state.setLastCharSearch({ char, direction: 'backward' });
  }
}
