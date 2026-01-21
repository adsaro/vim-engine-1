/**
 * FForwardMovementPlugin - Find character forward (f{char})
 *
 * Implements the vim 'f{char}' command for finding the next occurrence
 * of a character to the right on the current line.
 *
 * @example
 * ```typescript
 * import { FForwardMovementPlugin } from './f/FForwardMovementPlugin';
 *
 * const plugin = new FForwardMovementPlugin();
 * // Press 'fa' to find and move to the next 'a'
 * // Press '3fa' to find and move to the 3rd 'a'
 * ```
 */
import { AbstractVimPlugin } from '../../../plugin/AbstractVimPlugin';
import { ExecutionContext } from '../../../plugin/ExecutionContext';
import { ExecutionContextType } from '../../../plugin/VimPlugin';
import { CursorPosition } from '../../../state/CursorPosition';
import { VIM_MODE, VimMode } from '../../../state/VimMode';

/**
 * FForwardMovementPlugin - Finds and moves to next occurrence of character
 *
 * The 'f' key followed by any character moves the cursor to the next
 * occurrence of that character to the right on the current line.
 *
 * This plugin registers all possible patterns like 'fa', 'fb', 'fc', etc.
 */
export class FForwardMovementPlugin extends AbstractVimPlugin {
  readonly name = 'movement-f';
  readonly version = '1.0.0';
  readonly description = 'Find character forward (f{char})';
  readonly patterns: string[];
  readonly modes: VimMode[] = [VIM_MODE.NORMAL, VIM_MODE.VISUAL];

  /**
   * Create a new FForwardMovementPlugin
   *
   * Generates all possible f{char} patterns (f followed by any printable character)
   */
  constructor() {
    const patterns = FForwardMovementPlugin.generatePatterns();
    super('movement-f', 'Find character forward (f{char})', patterns, [
      VIM_MODE.NORMAL,
      VIM_MODE.VISUAL,
    ]);
    this.patterns = patterns;
  }

  /**
   * Generate all possible f{char} patterns
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
      patterns.push('f' + char);
    }

    return patterns;
  }

  /**
   * Perform the character search
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
          // Found the nth occurrence - move cursor to it
          executionContext.setCursor(new CursorPosition(cursor.line, i));
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
