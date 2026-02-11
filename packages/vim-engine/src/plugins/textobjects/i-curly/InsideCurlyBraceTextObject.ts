/**
 * InsideCurlyBraceTextObject - Inside curly brace text object (i{)
 *
 * Implements the vim 'i{' text object for selecting the content inside curly braces.
 * Works with operators like 'di{' (delete inside curly braces), 'ci{' (change inside curly braces), etc.
 *
 * This plugin finds the nearest pair of curly braces '{}' surrounding the cursor position,
 * and returns the boundaries of the content between them (excluding the braces themselves).
 *
 * Key behaviors:
 * - Finds the nearest enclosing pair of curly braces around the cursor
 * - Uses bracket matching logic to find the matching closing brace
 * - Works with nested braces (finds the innermost pair enclosing the cursor)
 * - Returns boundaries excluding the braces (the "inner" content)
 *
 * @example
 * ```typescript
 * import { InsideCurlyBraceTextObject } from './textobjects/i-curly/InsideCurlyBraceTextObject';
 *
 * const plugin = new InsideCurlyBraceTextObject();
 * // With cursor inside "{hello world}" and pressing 'di{'
 * // Result: "{}" with cursor at position 1
 * ```
 */
import { AbstractVimPlugin } from '../../../plugin/AbstractVimPlugin';
import { ExecutionContext } from '../../../plugin/ExecutionContext';
import { VimMode, VIM_MODE } from '../../../state/VimMode';
import { CursorPosition } from '../../../state/CursorPosition';
import { TextBuffer } from '../../../state/TextBuffer';
import { findMatchingBracket } from '../../movement/utils/bracketMatcher';

/**
 * Represents a pair of matching braces
 */
interface BracePair {
  open: CursorPosition;
  close: CursorPosition;
}

/**
 * InsideCurlyBraceTextObject - Selects the content inside curly braces
 *
 * The 'i{' text object selects the content between the nearest pair of curly braces
 * surrounding the cursor position. It works with operators like d (delete), c (change),
 * y (yank), etc.
 */
export class InsideCurlyBraceTextObject extends AbstractVimPlugin {
  /**
   * Plugin name
   */
  readonly name = 'textobject-i-curly';

  /**
   * Plugin version
   */
  readonly version = '1.0.0';

  /**
   * Plugin description
   */
  readonly description = 'Inside curly brace text object (i{)';

  /**
   * Keystroke patterns handled by this plugin
   * Note: This is a two-character sequence, handled by the VimExecutor
   */
  readonly patterns = ['i{'];

  /**
   * Modes this plugin is active in
   * Text objects work in operator-pending mode and visual mode
   */
  readonly modes: VimMode[] = [VIM_MODE.OPERATOR_PENDING, VIM_MODE.VISUAL];

  /**
   * Create a new InsideCurlyBraceTextObject
   */
  constructor() {
    super(
      'textobject-i-curly',
      'Inside curly brace text object (i{)',
      ['i{'],
      [VIM_MODE.OPERATOR_PENDING, VIM_MODE.VISUAL]
    );
  }

  /**
   * Get the boundaries of the content inside curly braces
   *
   * Finds the nearest pair of curly braces '{}' that enclose the cursor position,
   * then returns the boundaries of the content between them (excluding the braces themselves).
   *
   * @param context - The execution context
   * @returns Object with start and end positions, or null if no matching braces found
   */
  getWordBoundaries(context: ExecutionContext): { start: CursorPosition; end: CursorPosition } | null {
    const buffer = context.getBuffer();
    const cursor = context.getCursor();

    if (buffer.isEmpty()) {
      return null;
    }

    // Find the enclosing brace pair around the cursor
    const bracePair = this.findEnclosingBracePair(buffer, cursor);
    if (!bracePair) {
      return null;
    }

    // Calculate the inner boundaries (excluding the braces themselves)
    return this.calculateInnerBoundaries(bracePair.open, bracePair.close);
  }

  /**
   * Find the pair of braces that enclose the cursor position
   *
   * This searches for the innermost pair of matching curly braces that surround
   * the cursor. It handles nested braces correctly by finding the pair where the
   * cursor is strictly between the opening and closing braces.
   *
   * @param buffer - The text buffer
   * @param cursor - The cursor position
   * @returns The enclosing brace pair, or null if not found
   */
  private findEnclosingBracePair(buffer: TextBuffer, cursor: CursorPosition): BracePair | null {
    // First, collect all brace positions and their matches
    const bracePairs: BracePair[] = [];

    // Scan all lines for opening braces and find their matches
    for (let lineNum = 0; lineNum < buffer.getLineCount(); lineNum++) {
      const line = buffer.getLine(lineNum);
      if (line === null) continue;

      for (let col = 0; col < line.length; col++) {
        if (line[col] === '{') {
          const openPos = new CursorPosition(lineNum, col);
          const matchResult = findMatchingBracket(buffer, openPos);

          if (matchResult.found) {
            const closePos = new CursorPosition(matchResult.line, matchResult.column);
            bracePairs.push({ open: openPos, close: closePos });
          }
        }
      }
    }

    if (bracePairs.length === 0) {
      return null;
    }

    // Find the innermost pair that strictly encloses the cursor
    // Innermost = smallest pair where cursor is strictly inside (not on the braces)
    let bestPair: BracePair | null = null;
    let bestSize = Infinity;

    for (const pair of bracePairs) {
      // Check if cursor is strictly inside this pair (not on either brace)
      if (this.isPositionStrictlyInsidePair(cursor, pair)) {
        // Calculate the "size" of this pair (number of characters between braces)
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
   * Check if a position is strictly inside a brace pair
   *
   * The position is considered strictly inside if it's after the opening brace
   * and before the closing brace (not on the braces themselves).
   *
   * @param pos - The position to check
   * @param pair - The brace pair
   * @returns True if the position is strictly inside the pair
   */
  private isPositionStrictlyInsidePair(pos: CursorPosition, pair: BracePair): boolean {
    // Position must be strictly after the opening brace
    const afterOpen = this.comparePositions(pos, pair.open) > 0;

    // Position must be strictly before the closing brace
    const beforeClose = this.comparePositions(pos, pair.close) < 0;

    return afterOpen && beforeClose;
  }

  /**
   * Calculate the "size" of a brace pair (approximate character count between braces)
   *
   * Used to find the innermost pair - smaller size means more inner.
   *
   * @param pair - The brace pair
   * @returns The approximate size
   */
  private calculatePairSize(pair: BracePair): number {
    if (pair.open.line === pair.close.line) {
      // Same line: just the column difference
      return pair.close.column - pair.open.column;
    } else {
      // Multi-line: use line difference as approximation
      return (pair.close.line - pair.open.line) * 1000 + pair.close.column;
    }
  }

  /**
   * Calculate the inner boundaries between two brace positions
   *
   * Returns the positions that exclude the braces themselves, representing
   * the content inside the curly braces.
   *
   * @param openBrace - Position of the opening brace '{'
   * @param closeBrace - Position of the closing brace '}'
   * @returns Object with start and end positions for the inner content, or null if empty
   */
  private calculateInnerBoundaries(
    openBrace: CursorPosition,
    closeBrace: CursorPosition
  ): { start: CursorPosition; end: CursorPosition } | null {
    // Start position: right after the opening brace
    const startLine = openBrace.line;
    const startColumn = openBrace.column + 1;

    // End position: right before the closing brace
    const endLine = closeBrace.line;
    const endColumn = closeBrace.column;

    // Validate: start must be strictly before end
    const startComparison = this.comparePositions(
      new CursorPosition(startLine, startColumn),
      new CursorPosition(endLine, endColumn)
    );

    if (startComparison >= 0) {
      // Start is at or after end - this means there's no content between the braces
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
