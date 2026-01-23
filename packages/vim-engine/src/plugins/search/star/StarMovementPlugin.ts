/**
 * StarMovementPlugin - Search for word under cursor (* key)
 *
 * Implements the vim '*' command for searching forward for the word
 * under the cursor. This automatically extracts the word at the
 * cursor position and searches for its next occurrence.
 *
 * @example
 * ```typescript
 * import { StarMovementPlugin } from './star/StarMovementPlugin';
 *
 * const plugin = new StarMovementPlugin();
 * // Press '*' to search for the word under cursor
 * ```
 *
 * @see SearchPlugin For the search initiation plugin
 * @see NMovementPlugin For navigating to next match
 */
import { AbstractVimPlugin } from '../../../plugin/AbstractVimPlugin';
import { ExecutionContext } from '../../../plugin/ExecutionContext';
import { VIM_MODE, VimMode } from '../../../state/VimMode';
import { CursorPosition } from '../../../state/CursorPosition';
import { findNextMatch } from '../searchUtils';
import {
  findPreviousWordStart,
  isWordChar,
} from '../../movement/utils/wordBoundary';

/**
 * StarMovementPlugin - Search for word under cursor
 *
 * The '*' key in vim normal mode searches forward for the word under
 * the cursor. It:
 * 1. Extracts the word under the cursor using word boundary utilities
 * 2. Sets this word as the search pattern
 * 3. Searches forward for the next occurrence
 * 4. Moves the cursor to the match
 *
 * This is different from the '/' command which requires manual pattern
 * entry. The '*' command automatically uses the word under the cursor.
 *
 * Behavior:
 * - Extracts the word under the cursor using word boundary detection
 * - Sets the extracted word as the last search pattern
 * - Searches forward for the next occurrence (with wrap-around)
 * - If the cursor is not on a word, does nothing
 * - If no match is found, stays at current position
 */
export class StarMovementPlugin extends AbstractVimPlugin {
  /**
   * Plugin name
   */
  readonly name = 'search-star';

  /**
   * Plugin version
   */
  readonly version = '1.0.0';

  /**
   * Plugin description
   */
  readonly description = 'Search for word under cursor (* key)';

  /**
   * Keystroke patterns handled by this plugin
   */
  readonly patterns = ['*'];

  /**
   * Modes this plugin is active in
   */
  readonly modes: VimMode[] = [VIM_MODE.NORMAL, VIM_MODE.VISUAL];

  /**
   * Create a new StarMovementPlugin instance
   */
  constructor() {
    super('search-star', 'Search for word under cursor (* key)', ['*'], [
      VIM_MODE.NORMAL,
      VIM_MODE.VISUAL,
    ]);
  }

  /**
   * Perform the word search action
   *
   * This method is called when '*' is pressed in normal or visual mode.
   * It extracts the word under the cursor, sets it as the search pattern,
   * and searches forward for the next occurrence.
   *
   * @param context - The execution context containing vim state and buffer
   */
  protected performAction(context: ExecutionContext): void {
    const vimState = context.getState();
    const buffer = context.getBuffer();
    const cursor = context.getCursor();

    // Check if buffer is empty
    if (buffer.isEmpty()) {
      return;
    }

    // Get the current line content
    const lineContent = buffer.getLine(cursor.line);
    if (!lineContent || lineContent.length === 0) {
      return;
    }

    // Check if cursor is on a word character
    if (cursor.column >= lineContent.length) {
      return;
    }

    const currentChar = lineContent[cursor.column];
    if (!isWordChar(currentChar)) {
      // Not on a word character, do nothing
      return;
    }

    // Extract the word under the cursor using word boundary utilities
    const word = this.extractWordUnderCursor(lineContent, cursor.column);

    if (!word || word.length === 0) {
      return;
    }

    // Escape special regexp characters in the word
    const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Create a regexp pattern for whole-word matching
    // Uses word boundaries \b to match only whole words
    // \b matches at the position between a word character and a non-word character
    const wholeWordPattern = `\\b${escapedWord}\\b`;

    // Set the word as the last search pattern (as a regexp)
    vimState.setLastSearchPattern(wholeWordPattern);

    // Set search direction to forward (since * is forward search)
    vimState.setSearchForward(true);

    // Find the next occurrence of the word
    // We search from current position + 1 to avoid matching the current word
    const match = findNextMatch(buffer, wholeWordPattern, cursor.line, cursor.column);

    // If a match was found, move the cursor to that position
    if (match) {
      const newPosition = new CursorPosition(match.line, match.column);
      context.setCursor(newPosition);
    }
  }

  /**
   * Extract the word under the cursor
   *
   * Uses word boundary utilities to find the start and end of the word
   * at the given cursor position.
   *
   * @param lineContent - The line content to search in
   * @param cursorColumn - The cursor column position
   * @returns The word under the cursor, or null if not found
   */
  private extractWordUnderCursor(
    lineContent: string,
    cursorColumn: number
  ): string | null {
    // Find the start of the word
    const wordStart = findPreviousWordStart(lineContent, cursorColumn + 1, false);

    if (wordStart === null) {
      return null;
    }

    // Find the end of the word
    // We need to find the position after the last word character
    let wordEnd = wordStart;
    while (
      wordEnd < lineContent.length &&
      isWordChar(lineContent[wordEnd])
    ) {
      wordEnd++;
    }

    // Extract the word (wordEnd is exclusive, so we don't subtract 1)
    return lineContent.substring(wordStart, wordEnd);
  }
}
