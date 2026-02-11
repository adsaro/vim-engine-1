/**
 * InsideParenTextObject - Inside parenthesis text object (i()
 *
 * Implements the vim 'i(' text object for selecting the content inside parentheses.
 * Works with operators like 'di(' (delete inside parentheses), 'ci(' (change inside parentheses), etc.
 *
 * This plugin finds the nearest pair of parentheses '()' surrounding the cursor position,
 * and returns the boundaries of the content between them (excluding the parentheses themselves).
 *
 * Key behaviors:
 * - Finds the nearest enclosing pair of parentheses around the cursor
 * - Uses bracket matching logic to find the matching closing parenthesis
 * - Works with nested parentheses (finds the innermost pair enclosing the cursor)
 * - Returns boundaries excluding the parentheses (the "inner" content)
 *
 * @example
 * ```typescript
 * import { InsideParenTextObject } from './textobjects/i-paren/InsideParenTextObject';
 *
 * const plugin = new InsideParenTextObject();
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
 * Represents a pair of matching parentheses
 */
interface ParenPair {
  open: CursorPosition;
  close: CursorPosition;
}

/**
 * InsideParenTextObject - Selects the content inside parentheses
 *
 * The 'i(' text object selects the content between the nearest pair of parentheses
 * surrounding the cursor position. It works with operators like d (delete), c (change),
 * y (yank), etc.
 */
export class InsideParenTextObject extends AbstractVimPlugin {
  /**
   * Plugin name
   */
  readonly name = 'textobject-i-paren';

  /**
   * Plugin version
   */
  readonly version = '1.0.0';

  /**
   * Plugin description
   */
  readonly description = 'Inside parenthesis text object (i()';

  /**
   * Keystroke patterns handled by this plugin
   * Note: This is a two-character sequence, handled by the VimExecutor
   */
  readonly patterns = ['i('];

  /**
   * Modes this plugin is active in
   * Text objects work in operator-pending mode and visual mode
   */
  readonly modes: VimMode[] = [VIM_MODE.OPERATOR_PENDING, VIM_MODE.VISUAL];

  /**
   * Create a new InsideParenTextObject
   */
  constructor() {
    super(
      'textobject-i-paren',
      'Inside parenthesis text object (i()',
      ['i('],
      [VIM_MODE.OPERATOR_PENDING, VIM_MODE.VISUAL]
    );
  }

  /**
   * Get the boundaries of the content inside parentheses
   *
   * Finds the nearest pair of parentheses '()' that enclose the cursor position,
   * then returns the boundaries of the content between them (excluding the parentheses themselves).
   *
   * @param context - The execution context
   * @returns Object with start and end positions, or null if no matching parentheses found
   */
  getWordBoundaries(context: ExecutionContext): { start: CursorPosition; end: CursorPosition } | null {
    const buffer = context.getBuffer();
    const cursor = context.getCursor();

    if (buffer.isEmpty()) {
      return null;
    }

    // Find the enclosing paren pair around the cursor
    const parenPair = this.findEnclosingParenPair(buffer, cursor);
    if (!parenPair) {
      return null;
    }

    // Calculate the inner boundaries (excluding the parentheses themselves)
    return this.calculateInnerBoundaries(parenPair.open, parenPair.close);
  }

  /**
   * Find the pair of parentheses that enclose the cursor position
   *
   * This searches for the innermost pair of matching parentheses that surround
   * the cursor. It handles nested parentheses correctly by finding the pair where the
   * cursor is strictly between the opening and closing parentheses.
   *
   * @param buffer - The text buffer
   * @param cursor - The cursor position
   * @returns The enclosing paren pair, or null if not found
   */
  private findEnclosingParenPair(buffer: TextBuffer, cursor: CursorPosition): ParenPair | null {
    // First, collect all paren positions and their matches
    const parenPairs: ParenPair[] = [];

    // Scan all lines for opening parentheses and find their matches
    for (let lineNum = 0; lineNum < buffer.getLineCount(); lineNum++) {
      const line = buffer.getLine(lineNum);
      if (line === null) continue;

      for (let col = 0; col < line.length; col++) {
        if (line[col] === '(') {
          const openPos = new CursorPosition(lineNum, col);
          const matchResult = findMatchingBracket(buffer, openPos);

          if (matchResult.found) {
            const closePos = new CursorPosition(matchResult.line, matchResult.column);
            parenPairs.push({ open: openPos, close: closePos });
          }
        }
      }
    }

    if (parenPairs.length === 0) {
      return null;
    }

    // Find the innermost pair that strictly encloses the cursor
    // Innermost = smallest pair where cursor is strictly inside (not on the parentheses)
    let bestPair: ParenPair | null = null;
    let bestSize = Infinity;

    for (const pair of parenPairs) {
      // Check if cursor is strictly inside this pair (not on either parenthesis)
      if (this.isPositionStrictlyInsidePair(cursor, pair)) {
        // Calculate the "size" of this pair (number of characters between parentheses)
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
   * Check if a position is strictly inside a parenthesis pair
   *
   * The position is considered strictly inside if it's after the opening parenthesis
   * and before the closing parenthesis (not on the parentheses themselves).
   *
   * @param pos - The position to check
   * @param pair - The parenthesis pair
   * @returns True if the position is strictly inside the pair
   */
  private isPositionStrictlyInsidePair(pos: CursorPosition, pair: ParenPair): boolean {
    // Position must be strictly after the opening parenthesis
    const afterOpen = this.comparePositions(pos, pair.open) > 0;

    // Position must be strictly before the closing parenthesis
    const beforeClose = this.comparePositions(pos, pair.close) < 0;

    return afterOpen && beforeClose;
  }

  /**
   * Calculate the "size" of a parenthesis pair (approximate character count between parentheses)
   *
   * Used to find the innermost pair - smaller size means more inner.
   *
   * @param pair - The parenthesis pair
   * @returns The approximate size
   */
  private calculatePairSize(pair: ParenPair): number {
    if (pair.open.line === pair.close.line) {
      // Same line: just the column difference
      return pair.close.column - pair.open.column;
    } else {
      // Multi-line: use line difference as approximation
      return (pair.close.line - pair.open.line) * 1000 + pair.close.column;
    }
  }

  /**
   * Calculate the inner boundaries between two parenthesis positions
   *
   * Returns the positions that exclude the parentheses themselves, representing
   * the content inside the parentheses.
   *
   * @param openParen - Position of the opening parenthesis '('
   * @param closeParen - Position of the closing parenthesis ')'
   * @returns Object with start and end positions for the inner content, or null if empty
   */
  private calculateInnerBoundaries(
    openParen: CursorPosition,
    closeParen: CursorPosition
  ): { start: CursorPosition; end: CursorPosition } | null {
    // Start position: right after the opening parenthesis
    const startLine = openParen.line;
    const startColumn = openParen.column + 1;

    // End position: right before the closing parenthesis
    const endLine = closeParen.line;
    const endColumn = closeParen.column;

    // Validate: start must be strictly before end
    const startComparison = this.comparePositions(
      new CursorPosition(startLine, startColumn),
      new CursorPosition(endLine, endColumn)
    );

    if (startComparison >= 0) {
      // Start is at or after end - this means there's no content between the parentheses
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
