/**
 * FBackwardMovementPlugin - Find character backward (F{char})
 *
 * Implements the vim 'F{char}' command for finding the previous occurrence
 * of a character to the left on the current line.
 *
 * @example
 * ```typescript
 * import { FBackwardMovementPlugin } from './f-capital/FBackwardMovementPlugin';
 *
 * const plugin = new FBackwardMovementPlugin();
 * // Press 'Fa' to find and move to the previous 'a'
 * // Press '3Fa' to find and move to the 3rd 'a' backward
 * ```
 */
import { AbstractVimPlugin } from '../../../plugin/AbstractVimPlugin';
import { ExecutionContext } from '../../../plugin/ExecutionContext';
import { ExecutionContextType } from '../../../plugin/VimPlugin';
import { CursorPosition } from '../../../state/CursorPosition';
import { VIM_MODE, VimMode } from '../../../state/VimMode';

/**
 * FBackwardMovementPlugin - Finds and moves to previous occurrence of character
 *
 * The 'F' key followed by any character moves the cursor to the previous
 * occurrence of that character to the left on the current line.
 *
 * This plugin registers all possible patterns like 'Fa', 'Fb', 'Fc', etc.
 */
export class FBackwardMovementPlugin extends AbstractVimPlugin {
  readonly name = 'movement-F';
  readonly version = '1.0.0';
  readonly description = 'Find character backward (F{char})';
  readonly patterns: string[];
  readonly modes: VimMode[] = [VIM_MODE.NORMAL, VIM_MODE.VISUAL];

  /**
   * Create a new FBackwardMovementPlugin
   *
   * Generates all possible F{char} patterns (F followed by any printable character)
   */
  constructor() {
    const patterns = FBackwardMovementPlugin.generatePatterns();
    super('movement-F', 'Find character backward (F{char})', patterns, [
      VIM_MODE.NORMAL,
      VIM_MODE.VISUAL,
    ]);
    this.patterns = patterns;
  }

  /**
   * Generate all possible F{char} patterns
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
      patterns.push('F' + char);
    }

    return patterns;
  }

  /**
   * Perform the character search backward
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
          // Found the nth occurrence - move cursor to it
          executionContext.setCursor(new CursorPosition(cursor.line, i));
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
