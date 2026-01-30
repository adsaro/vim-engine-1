/**
 * InsideWordTextObject - Inside word text object (iw)
 *
 * Implements the vim 'iw' text object for selecting the word under the cursor.
 * Works with operators like 'diw' (delete inside word), 'ciw' (change inside word), etc.
 *
 * A word is defined as a sequence of letters, digits, and underscores, or a sequence
 * of other non-blank characters.
 *
 * @example
 * ```typescript
 * import { InsideWordTextObject } from './textobjects/iw/InsideWordTextObject';
 *
 * const plugin = new InsideWordTextObject();
 * // With cursor on "world" in "Hello world!"
 * // Press 'diw' to delete "world", leaving "Hello !"
 * ```
 */
import { AbstractVimPlugin } from '../../../plugin/AbstractVimPlugin';
import { ExecutionContext } from '../../../plugin/ExecutionContext';
import { VimMode, VIM_MODE } from '../../../state/VimMode';
import { CursorPosition } from '../../../state/CursorPosition';

/**
 * InsideWordTextObject - Selects the word under the cursor
 *
 * The 'iw' text object selects the word under the cursor, excluding surrounding
 * whitespace. It works with operators like d (delete), c (change), y (yank), etc.
 */
export class InsideWordTextObject extends AbstractVimPlugin {
  /**
   * Plugin name
   */
  readonly name = 'textobject-iw';

  /**
   * Plugin version
   */
  readonly version = '1.0.0';

  /**
   * Plugin description
   */
  readonly description = 'Inside word text object (iw)';

  /**
   * Keystroke patterns handled by this plugin
   * Note: This is a two-character sequence, handled by the VimExecutor
   */
  readonly patterns = ['iw'];

  /**
   * Modes this plugin is active in
   * Text objects work in operator-pending mode and visual mode
   */
  readonly modes: VimMode[] = [VIM_MODE.OPERATOR_PENDING, VIM_MODE.VISUAL];

  /**
   * Create a new InsideWordTextObject
   */
  constructor() {
    super(
      'textobject-iw',
      'Inside word text object (iw)',
      ['iw'],
      [VIM_MODE.OPERATOR_PENDING, VIM_MODE.VISUAL]
    );
  }

  /**
   * Get the word boundaries for the word under the cursor
   *
   * @param context - The execution context
   * @returns Object with start and end positions, or null if no word found
   */
  getWordBoundaries(context: ExecutionContext): { start: CursorPosition; end: CursorPosition } | null {
    const buffer = context.getBuffer();
    const cursor = context.getCursor();

    if (buffer.isEmpty()) {
      return null;
    }

    const line = buffer.getLine(cursor.line);
    if (line === null) {
      return null;
    }

    // Find word boundaries on the current line
    const boundaries = this.findWordBoundaries(line, cursor.column);
    if (boundaries === null) {
      return null;
    }

    return {
      start: new CursorPosition(cursor.line, boundaries.start),
      end: new CursorPosition(cursor.line, boundaries.end),
    };
  }

  /**
   * Find the start and end column of the word at the given position
   *
   * @param line - The line content
   * @param column - The cursor column position
   * @returns Object with start and end columns, or null if not on a word
   */
  private findWordBoundaries(line: string, column: number): { start: number; end: number } | null {
    if (line.length === 0) {
      return null;
    }

    // Clamp column to valid range
    const clampedColumn = Math.max(0, Math.min(column, line.length - 1));

    // Check if we're on a word character
    const char = line[clampedColumn];
    if (this.isWhitespace(char)) {
      return null;
    }

    // Determine what type of word we're on
    const isWordChar = this.isWordCharacter(char);

    // Find the start of the word
    let start = clampedColumn;
    while (start > 0) {
      const prevChar = line[start - 1];
      if (this.isWhitespace(prevChar)) {
        break;
      }
      if (isWordChar !== this.isWordCharacter(prevChar)) {
        break;
      }
      start--;
    }

    // Find the end of the word (exclusive)
    let end = clampedColumn + 1;
    while (end < line.length) {
      const nextChar = line[end];
      if (this.isWhitespace(nextChar)) {
        break;
      }
      if (isWordChar !== this.isWordCharacter(nextChar)) {
        break;
      }
      end++;
    }

    return { start, end };
  }

  /**
   * Check if a character is a word character (letter, digit, or underscore)
   *
   * @param char - The character to check
   * @returns True if the character is a word character
   */
  private isWordCharacter(char: string): boolean {
    return /[a-zA-Z0-9_]/.test(char);
  }

  /**
   * Check if a character is whitespace
   *
   * @param char - The character to check
   * @returns True if the character is whitespace
   */
  private isWhitespace(char: string): boolean {
    return /\s/.test(char);
  }

  /**
   * Perform the text object selection
   *
   * For text objects, this calculates the boundaries and stores them
   * for use by the operator.
   *
   * @param _context - The execution context (unused in text objects)
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected performAction(_context: ExecutionContext): void {
    // Text objects don't perform an action directly
    // They calculate boundaries for use by operators
    // The actual execution is handled by the VimExecutor
  }
}
