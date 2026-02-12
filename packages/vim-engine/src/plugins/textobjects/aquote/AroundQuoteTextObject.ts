/**
 * AroundQuoteTextObject - Around quote text object (a", a', a`)
 *
 * Implements the vim text objects for selecting content around quotes,
 * including the quotes themselves.
 * Works with operators like 'da"' (delete around double quotes),
 * 'ca"' (change around double quotes), 'ya"' (yank around double quotes), etc.
 *
 * Supports:
 * - a" : Around double quotes
 * - a' : Around single quotes
 * - a` : Around backticks
 *
 * @example
 * ```typescript
 * import { AroundQuoteTextObject } from './textobjects/aquote/AroundQuoteTextObject';
 *
 * const plugin = new AroundQuoteTextObject();
 * // With cursor anywhere in: Hello "world"!
 * // Press 'da"' to delete "world" including quotes, leaving "Hello !"
 * ```
 */
import { AbstractVimPlugin } from '../../../plugin/AbstractVimPlugin';
import { ExecutionContext } from '../../../plugin/ExecutionContext';
import { VimMode, VIM_MODE } from '../../../state/VimMode';
import { CursorPosition } from '../../../state/CursorPosition';

/**
 * AroundQuoteTextObject - Selects content around quotes under the cursor
 *
 * The 'a"', 'a'', 'a`' text objects select the content around quotes,
 * including the quotes themselves. They work with operators like d (delete),
 * c (change), y (yank), etc.
 */
export class AroundQuoteTextObject extends AbstractVimPlugin {
  /**
   * Plugin name
   */
  readonly name = 'textobject-aquote';

  /**
   * Plugin version
   */
  readonly version = '1.0.0';

  /**
   * Plugin description
   */
  readonly description = 'Around quote text object (a", a\', a`)';

  /**
   * Keystroke patterns handled by this plugin
   * Note: These are two-character sequences, handled by the VimExecutor
   */
  readonly patterns = ['a"', "a'", 'a`'];

  /**
   * Modes this plugin is active in
   * Text objects work in operator-pending mode and visual mode
   */
  readonly modes: VimMode[] = [VIM_MODE.OPERATOR_PENDING, VIM_MODE.VISUAL];

  /**
   * Mapping of pattern to quote character
   */
  private readonly quoteMap: Record<string, string> = {
    'a"': '"',
    "a'": "'",
    'a`': '`',
  };

  /**
   * Create a new AroundQuoteTextObject
   */
  constructor() {
    super(
      'textobject-aquote',
      'Around quote text object (a", a\', a`)',
      ['a"', "a'", 'a`'],
      [VIM_MODE.OPERATOR_PENDING, VIM_MODE.VISUAL]
    );
  }

  /**
   * Get the quote boundaries for the quotes containing the cursor
   *
   * @param context - The execution context
   * @returns Object with start and end positions, or null if no quote found
   */
  getWordBoundaries(context: ExecutionContext): { start: CursorPosition; end: CursorPosition } | null {
    const buffer = context.getBuffer();
    const cursor = context.getCursor();
    const pattern = context.getCurrentPattern();

    if (buffer.isEmpty()) {
      return null;
    }

    // Get the quote character from the pattern
    const quoteChar = this.quoteMap[pattern];
    if (!quoteChar) {
      return null;
    }

    // Find the opening and closing quotes on the current line
    const line = buffer.getLine(cursor.line);
    if (line === null) {
      return null;
    }

    const boundaries = this.findQuoteBoundaries(line, cursor.column, quoteChar);
    if (boundaries === null) {
      return null;
    }

    return {
      start: new CursorPosition(cursor.line, boundaries.start),
      end: new CursorPosition(cursor.line, boundaries.end),
    };
  }

  /**
   * Find the opening and closing quote positions
   *
   * @param line - The line content
   * @param column - The cursor column position
   * @param quoteChar - The quote character to search for
   * @returns Object with start and end columns (including quotes), or null if not found
   */
  private findQuoteBoundaries(
    line: string,
    column: number,
    quoteChar: string
  ): { start: number; end: number } | null {
    if (line.length === 0) {
      return null;
    }

    // Clamp column to valid range
    const clampedColumn = Math.max(0, Math.min(column, line.length - 1));

    // Find all quote positions in the line
    const quotePositions: number[] = [];
    for (let i = 0; i < line.length; i++) {
      if (line[i] === quoteChar) {
        quotePositions.push(i);
      }
    }

    // Need at least 2 quotes (opening and closing)
    if (quotePositions.length < 2) {
      return null;
    }

    // Find which pair of quotes the cursor is inside
    for (let i = 0; i < quotePositions.length - 1; i++) {
      const openingQuote = quotePositions[i];
      const closingQuote = quotePositions[i + 1];

      // Check if cursor is between these quotes (inclusive)
      if (clampedColumn >= openingQuote && clampedColumn <= closingQuote) {
        // Return positions including the quotes (around = inclusive of quotes)
        // start is at the opening quote, end is after the closing quote
        return {
          start: openingQuote,
          end: closingQuote + 1,
        };
      }
    }

    // Cursor is not inside any quotes
    return null;
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
