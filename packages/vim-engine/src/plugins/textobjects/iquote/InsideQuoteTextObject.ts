/**
 * InsideQuoteTextObject - Inside quote text object (i", i', i`)
 *
 * Implements the vim text objects for selecting content inside quotes.
 * Works with operators like 'di"' (delete inside double quotes),
 * 'ci"' (change inside double quotes), 'yi"' (yank inside double quotes), etc.
 *
 * Supports:
 * - i" : Inside double quotes
 * - i' : Inside single quotes
 * - i` : Inside backticks
 *
 * @example
 * ```typescript
 * import { InsideQuoteTextObject } from './textobjects/iquote/InsideQuoteTextObject';
 *
 * const plugin = new InsideQuoteTextObject();
 * // With cursor anywhere in: Hello "world"!
 * // Press 'di"' to delete "world", leaving "Hello !"
 * ```
 */
import { AbstractVimPlugin } from '../../../plugin/AbstractVimPlugin';
import { ExecutionContext } from '../../../plugin/ExecutionContext';
import { VimMode, VIM_MODE } from '../../../state/VimMode';
import { CursorPosition } from '../../../state/CursorPosition';

/**
 * InsideQuoteTextObject - Selects content inside quotes under the cursor
 *
 * The 'i"', 'i'', 'i`' text objects select the content inside quotes,
 * excluding the quotes themselves. They work with operators like d (delete),
 * c (change), y (yank), etc.
 */
export class InsideQuoteTextObject extends AbstractVimPlugin {
  /**
   * Plugin name
   */
  readonly name = 'textobject-iquote';

  /**
   * Plugin version
   */
  readonly version = '1.0.0';

  /**
   * Plugin description
   */
  readonly description = 'Inside quote text object (i", i\', i`)';

  /**
   * Keystroke patterns handled by this plugin
   * Note: These are two-character sequences, handled by the VimExecutor
   */
  readonly patterns = ['i"', "i'", 'i`'];

  /**
   * Modes this plugin is active in
   * Text objects work in operator-pending mode and visual mode
   */
  readonly modes: VimMode[] = [VIM_MODE.OPERATOR_PENDING, VIM_MODE.VISUAL];

  /**
   * Mapping of pattern to quote character
   */
  private readonly quoteMap: Record<string, string> = {
    'i"': '"',
    "i'": "'",
    'i`': '`',
  };

  /**
   * Create a new InsideQuoteTextObject
   */
  constructor() {
    super(
      'textobject-iquote',
      'Inside quote text object (i", i\', i`)',
      ['i"', "i'", 'i`'],
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
   * @returns Object with start and end columns (inside quotes, exclusive), or null if not found
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
        // Return positions inside the quotes (exclusive of the quotes themselves)
        // start is after the opening quote, end is at the closing quote
        return {
          start: openingQuote + 1,
          end: closingQuote,
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
