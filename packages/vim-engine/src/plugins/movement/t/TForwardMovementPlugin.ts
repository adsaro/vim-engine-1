/**
 * TForwardMovementPlugin - Till character forward (t{char})
 *
 * Implements the vim 't{char}' command for finding the next occurrence
 * of a character to the right on the current line and moving just before it.
 *
 * @example
 * ```typescript
 * import { TForwardMovementPlugin } from './t/TForwardMovementPlugin';
 *
 * const plugin = new TForwardMovementPlugin();
 * // Press 'ta' to move to just before the next 'a'
 * // Press '3ta' to move to just before the 3rd 'a'
 * ```
 */
import { AbstractVimPlugin } from '../../../plugin/AbstractVimPlugin';
import { ExecutionContext } from '../../../plugin/ExecutionContext';
import { ExecutionContextType } from '../../../plugin/VimPlugin';
import { CursorPosition } from '../../../state/CursorPosition';
import { VIM_MODE, VimMode } from '../../../state/VimMode';

/**
 * TForwardMovementPlugin - Finds and moves just before the next occurrence of character
 *
 * The 't' key followed by any character moves the cursor to just before
 * the next occurrence of that character to the right on the current line.
 *
 * This plugin registers all possible patterns like 'ta', 'tb', 'tc', etc.
 */
export class TForwardMovementPlugin extends AbstractVimPlugin {
  readonly name = 'movement-t';
  readonly version = '1.0.0';
  readonly description = 'Till character forward (t{char})';
  readonly patterns: string[];
  readonly modes: VimMode[] = [VIM_MODE.NORMAL, VIM_MODE.VISUAL];

  /**
   * Create a new TForwardMovementPlugin
   *
   * Generates all possible t{char} patterns (t followed by any printable character)
   */
  constructor() {
    const patterns = TForwardMovementPlugin.generatePatterns();
    super('movement-t', 'Till character forward (t{char})', patterns, [
      VIM_MODE.NORMAL,
      VIM_MODE.VISUAL,
    ]);
    this.patterns = patterns;
  }

  /**
   * Generate all possible t{char} patterns
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
      patterns.push('t' + char);
    }

    return patterns;
  }

  /**
   * Perform the character search till forward
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

    // Search forward from cursor position
    const searchStart = cursor.column + 1;
    let occurrenceCount = 0;

    for (let i = searchStart; i < line.length; i++) {
      if (line[i] === char) {
        occurrenceCount++;
        if (occurrenceCount === count) {
          // Found the nth occurrence - move cursor to just before it
          executionContext.setCursor(new CursorPosition(cursor.line, i - 1));
          // Store for repetition with ; and ,
          state.setLastCharSearch({ char, direction: 'forward' });
          return;
        }
      }
    }

    // Character not found - cursor stays in place
    // Still store the search for potential repetition
    state.setLastCharSearch({ char, direction: 'forward' });
  }
}
