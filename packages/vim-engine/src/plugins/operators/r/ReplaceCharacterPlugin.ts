/**
 * ReplaceCharacterPlugin - Replace character under cursor (r{char})
 *
 * Implements the vim 'r{char}' command for replacing the character under
 * the cursor with the specified character. Stays in normal mode.
 * Supports numeric prefix (e.g., '3rx' replaces 3 characters with 'x').
 *
 * @example
 * ```typescript
 * import { ReplaceCharacterPlugin } from './operators/r/ReplaceCharacterPlugin';
 *
 * const plugin = new ReplaceCharacterPlugin();
 * // Press 'ra' to replace character under cursor with 'a'
 * // Press '3rx' to replace 3 characters with 'x'
 * ```
 */
import { AbstractVimPlugin } from '../../../plugin/AbstractVimPlugin';
import { ExecutionContext } from '../../../plugin/ExecutionContext';
import { VimMode, VIM_MODE } from '../../../state/VimMode';

/**
 * ReplaceCharacterPlugin - Replaces character under cursor with specified character
 *
 * The 'r' key followed by any character replaces the character under the cursor
 * with that character. Unlike 'x' followed by 'i', this stays in normal mode.
 *
 * This plugin registers all possible patterns like 'ra', 'rb', 'rc', etc.
 */
export class ReplaceCharacterPlugin extends AbstractVimPlugin {
  /**
   * Plugin name
   */
  readonly name = 'operator-replace-char';

  /**
   * Plugin version
   */
  readonly version = '1.0.0';

  /**
   * Plugin description
   */
  readonly description = 'Replace character under cursor (r{char})';

  /**
   * Keystroke patterns handled by this plugin
   */
  readonly patterns: string[];

  /**
   * Modes this plugin is active in
   */
  readonly modes: VimMode[] = [VIM_MODE.NORMAL];

  /**
   * Create a new ReplaceCharacterPlugin
   *
   * Generates all possible r{char} patterns (r followed by any printable character)
   */
  constructor() {
    const patterns = ReplaceCharacterPlugin.generatePatterns();
    super('operator-replace-char', 'Replace character under cursor (r{char})', patterns, [
      VIM_MODE.NORMAL,
    ]);
    this.patterns = patterns;
  }

  /**
   * Generate all possible r{char} patterns
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
      patterns.push('r' + char);
    }

    return patterns;
  }

  /**
   * Perform the replace action
   *
   * Replaces the character under the cursor with the specified character.
   * If count is provided (e.g., '3rx'), replaces that many characters.
   * Stays in normal mode.
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

    // Extract target character from the pattern
    const pattern = context.getCurrentPattern();
    if (!pattern || pattern.length < 2) {
      return;
    }

    const replacementChar = pattern[1];

    // Calculate how many characters to replace (respecting line boundaries)
    const charsToReplace = Math.min(count, line.length - cursor.column);

    if (charsToReplace <= 0) {
      return;
    }

    // Build the replacement string (same character repeated)
    const replacement = replacementChar.repeat(charsToReplace);

    // Replace characters by modifying the line
    const newLine =
      line.slice(0, cursor.column) + replacement + line.slice(cursor.column + charsToReplace);
    buffer.setLine(cursor.line, newLine);

    // Cursor stays at the same position (vim behavior for 'r')
    // No need to move cursor
  }
}
