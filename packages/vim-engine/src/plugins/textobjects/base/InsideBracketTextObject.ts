/**
 * InsideBracketTextObject - Base class for inside bracket text objects
 *
 * Provides a generic implementation for text objects that select content inside
 * various bracket types (parentheses, curly braces, square brackets, angle brackets).
 * Works with operators like 'di(' (delete inside parentheses), 'ci{' (change inside curly braces), etc.
 *
 * This plugin finds the nearest pair of matching brackets surrounding the cursor position,
 * and returns the boundaries of the content between them (excluding the brackets themselves).
 *
 * Key behaviors:
 * - Finds the nearest enclosing pair of brackets around the cursor
 * - Uses bracket matching logic to find the matching closing bracket
 * - Works with nested brackets (finds the innermost pair enclosing the cursor)
 * - Returns boundaries excluding the brackets (the "inner" content)
 *
 * @example
 * ```typescript
 * import { InsideBracketTextObject } from './textobjects/base/InsideBracketTextObject';
 *
 * const plugin = new InsideBracketTextObject('(', ')', 'textobject-i-paren', 'i(');
 * // With cursor inside "(hello world)" and pressing 'di('
 * // Result: "()" with cursor at position 1
 * ```
 */
import { AbstractVimPlugin } from '../../../plugin/AbstractVimPlugin';
import { ExecutionContext } from '../../../plugin/ExecutionContext';
import { VimMode, VIM_MODE } from '../../../state/VimMode';
import { CursorPosition } from '../../../state/CursorPosition';
import { TextBuffer } from '../../../state/TextBuffer';
import { findMatchingBracket } from '../../movement/utils/bracketMatcher';

/**
 * Represents a pair of matching brackets
 */
interface BracketPair {
  open: CursorPosition;
  close: CursorPosition;
}

/**
 * InsideBracketTextObject - Base class for selecting content inside brackets
 *
 * The 'iX' text object (where X is a bracket character) selects the content between
 * the nearest pair of matching brackets surrounding the cursor position. It works with
 * operators like d (delete), c (change), y (yank), etc.
 */
export class InsideBracketTextObject extends AbstractVimPlugin {
  /**
   * The opening bracket character
   */
  private readonly openBracket: string;

  /**
   * Plugin name
   */
  readonly name: string;

  /**
   * Plugin version
   */
  readonly version = '1.0.0';

  /**
   * Plugin description
   */
  readonly description: string;

  /**
   * Keystroke patterns handled by this plugin
   * Note: This is a two-character sequence, handled by the VimExecutor
   */
  readonly patterns: string[];

  /**
   * Modes this plugin is active in
   * Text objects work in operator-pending mode and visual mode
   */
  readonly modes: VimMode[] = [VIM_MODE.OPERATOR_PENDING, VIM_MODE.VISUAL];

  /**
   * Create a new InsideBracketTextObject
   *
   * @param openBracket - The opening bracket character (e.g., '(', '{', '[')
   * @param _closeBracket - The closing bracket character (e.g., ')', '}', ']') - unused but kept for API compatibility
   * @param name - The plugin name
   * @param pattern - The keystroke pattern (e.g., 'i(', 'i{', 'i[')
   * @param description - Optional description (defaults to auto-generated)
   */
  constructor(
    openBracket: string,
    _closeBracket: string,
    name: string,
    pattern: string,
    description?: string
  ) {
    super(
      name,
      description || `Inside bracket text object (${pattern})`,
      [pattern],
      [VIM_MODE.OPERATOR_PENDING, VIM_MODE.VISUAL]
    );
    this.openBracket = openBracket;
    this.name = name;
    this.description = description || `Inside bracket text object (${pattern})`;
    this.patterns = [pattern];
  }

  /**
   * Get the boundaries of the content inside brackets
   *
   * Finds the nearest pair of matching brackets that enclose the cursor position,
   * then returns the boundaries of the content between them (excluding the brackets themselves).
   *
   * @param context - The execution context
   * @returns Object with start and end positions, or null if no matching brackets found
   */
  getWordBoundaries(context: ExecutionContext): { start: CursorPosition; end: CursorPosition } | null {
    const buffer = context.getBuffer();
    const cursor = context.getCursor();

    if (buffer.isEmpty()) {
      return null;
    }

    // Find the enclosing bracket pair around the cursor
    const bracketPair = this.findEnclosingBracketPair(buffer, cursor);
    if (!bracketPair) {
      return null;
    }

    // Calculate the inner boundaries (excluding the brackets themselves)
    return this.calculateInnerBoundaries(bracketPair.open, bracketPair.close);
  }

  /**
   * Find the pair of brackets that enclose the cursor position
   *
   * This searches for the innermost pair of matching brackets that surround
   * the cursor. It handles nested brackets correctly by finding the pair where the
   * cursor is strictly between the opening and closing brackets.
   *
   * @param buffer - The text buffer
   * @param cursor - The cursor position
   * @returns The enclosing bracket pair, or null if not found
   */
  private findEnclosingBracketPair(buffer: TextBuffer, cursor: CursorPosition): BracketPair | null {
    // First, collect all bracket positions and their matches
    const bracketPairs: BracketPair[] = [];

    // Scan all lines for opening brackets and find their matches
    for (let lineNum = 0; lineNum < buffer.getLineCount(); lineNum++) {
      const line = buffer.getLine(lineNum);
      if (line === null) continue;

      for (let col = 0; col < line.length; col++) {
        if (line[col] === this.openBracket) {
          const openPos = new CursorPosition(lineNum, col);
          const matchResult = findMatchingBracket(buffer, openPos);

          if (matchResult.found) {
            const closePos = new CursorPosition(matchResult.line, matchResult.column);
            bracketPairs.push({ open: openPos, close: closePos });
          }
        }
      }
    }

    if (bracketPairs.length === 0) {
      return null;
    }

    // Find the innermost pair that strictly encloses the cursor
    // Innermost = smallest pair where cursor is strictly inside (not on the brackets)
    let bestPair: BracketPair | null = null;
    let bestSize = Infinity;

    for (const pair of bracketPairs) {
      // Check if cursor is strictly inside this pair (not on either bracket)
      if (this.isPositionStrictlyInsidePair(cursor, pair)) {
        // Calculate the "size" of this pair (number of characters between brackets)
        const size = this.calculatePairSize(pair);

        // If this pair is smaller than the current best, it's more inner
        if (size < bestSize) {
          bestPair = pair;
          bestSize = size;
        }
      }
    }

    return bestPair;
  }

  /**
   * Check if a position is strictly inside a bracket pair
   *
   * The position is considered strictly inside if it's after the opening bracket
   * and before the closing bracket (not on the brackets themselves).
   *
   * @param pos - The position to check
   * @param pair - The bracket pair
   * @returns True if the position is strictly inside the pair
   */
  private isPositionStrictlyInsidePair(pos: CursorPosition, pair: BracketPair): boolean {
    // Position must be strictly after the opening bracket
    const afterOpen = this.comparePositions(pos, pair.open) > 0;

    // Position must be strictly before the closing bracket
    const beforeClose = this.comparePositions(pos, pair.close) < 0;

    return afterOpen && beforeClose;
  }

  /**
   * Calculate the "size" of a bracket pair (approximate character count between brackets)
   *
   * Used to find the innermost pair - smaller size means more inner.
   *
   * @param pair - The bracket pair
   * @returns The approximate size
   */
  private calculatePairSize(pair: BracketPair): number {
    if (pair.open.line === pair.close.line) {
      // Same line: just the column difference
      return pair.close.column - pair.open.column;
    } else {
      // Multi-line: use line difference as approximation
      return (pair.close.line - pair.open.line) * 1000 + pair.close.column;
    }
  }

  /**
   * Calculate the inner boundaries between two bracket positions
   *
   * Returns the positions that exclude the brackets themselves, representing
   * the content inside the brackets.
   *
   * @param openBracket - Position of the opening bracket
   * @param closeBracket - Position of the closing bracket
   * @returns Object with start and end positions for the inner content, or null if empty
   */
  private calculateInnerBoundaries(
    openBracket: CursorPosition,
    closeBracket: CursorPosition
  ): { start: CursorPosition; end: CursorPosition } | null {
    // Start position: right after the opening bracket
    const startLine = openBracket.line;
    const startColumn = openBracket.column + 1;

    // End position: right before the closing bracket
    const endLine = closeBracket.line;
    const endColumn = closeBracket.column;

    // Validate: start must be strictly before end
    const startComparison = this.comparePositions(
      new CursorPosition(startLine, startColumn),
      new CursorPosition(endLine, endColumn)
    );

    if (startComparison >= 0) {
      // Start is at or after end - this means there's no content between the brackets
      return null;
    }

    return {
      start: new CursorPosition(startLine, startColumn),
      end: new CursorPosition(endLine, endColumn),
    };
  }

  /**
   * Compare two cursor positions
   *
   * @param a - First position
   * @param b - Second position
   * @returns negative if a < b, 0 if equal, positive if a > b
   */
  private comparePositions(a: CursorPosition, b: CursorPosition): number {
    if (a.line !== b.line) {
      return a.line - b.line;
    }
    return a.column - b.column;
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
