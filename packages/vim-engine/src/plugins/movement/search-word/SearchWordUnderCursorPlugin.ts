/**
 * SearchWordUnderCursorPlugin - Search for word under cursor (* key)
 *
 * This plugin implements the Vim `*` key functionality, which searches for the
 * word currently under the cursor. It performs a forward search for all occurrences
 * of the word and moves the cursor to the next match.
 *
 * Features:
 * - Extracts the word under the cursor using word boundary detection
 * - Creates a regex pattern with word boundaries for whole-word matching
 * - Searches forward for all matches starting from the next line
 * - Skips the current position if it matches
 * - Updates the search state for subsequent n/N navigation
 *
 * @example
 * ```typescript
 * import { SearchWordUnderCursorPlugin } from './plugins/movement/search-word';
 *
 * const plugin = new SearchWordUnderCursorPlugin();
 * pluginRegistry.register(plugin);
 *
 * // When user presses * while on "hello":
 * // - Extracts "hello" as the word
 * // - Creates pattern "\bhello\b"
 * // - Finds all matches
 * // - Moves cursor to next match
 * ```
 */
import { AbstractVimPlugin } from '../../../plugin/AbstractVimPlugin';
import { VIM_MODE } from '../../../state/VimMode';
import { ExecutionContextType } from '../../../plugin/VimPlugin';
import {
  extractWordUnderCursor,
  patternToRegex,
  findAllMatches,
} from '../utils/searchUtils';

/**
 * SearchWordUnderCursorPlugin - Implements the * key for searching word under cursor
 */
export class SearchWordUnderCursorPlugin extends AbstractVimPlugin {
  /**
   * Unique plugin name
   */
  readonly name = 'movement-search-word';

  /**
   * Plugin version
   */
  readonly version = '1.0.0';

  /**
   * Plugin description
   */
  readonly description = 'Search for word under cursor (* key)';

  /**
   * Keystroke patterns this plugin handles
   */
  readonly patterns = ['*'];

  /**
   * Vim modes this plugin is active in
   */
  readonly modes = [VIM_MODE.NORMAL, VIM_MODE.VISUAL];

  /**
   * Create a new SearchWordUnderCursorPlugin
   */
  constructor() {
    super(
      'movement-search-word',
      'Search for word under cursor (* key)',
      ['*'],
      [VIM_MODE.NORMAL, VIM_MODE.VISUAL]
    );
  }

  /**
   * Perform the search action
   *
   * Extracts the word under the cursor, creates a regex pattern with word
   * boundaries, finds all matches, and moves the cursor to the next match.
   *
   * @param context - The execution context
   * @returns {void}
   */
  protected performAction(context: ExecutionContextType): void {
    // Get buffer, cursor, and state from context
    const buffer = context.getBuffer();
    const cursor = context.getCursor();
    const state = context.getState();

    // Extract word under cursor
    const word = extractWordUnderCursor(buffer, cursor);

    // If not on a word, do nothing
    if (word === null) {
      return;
    }

    // Create regex for exact word match (with word boundaries)
    const pattern = '\\b' + word + '\\b';
    const regex = patternToRegex(pattern);

    // If regex is invalid, do nothing
    if (regex === null) {
      return;
    }

    // Find all matches (forward search starting from current line)
    const matches = findAllMatches(buffer, regex, cursor.line, 'forward');

    // If no matches found, do nothing
    if (matches.length === 0) {
      return;
    }

    // Find first match
    let firstMatch = matches[0];

    // Skip current position if it matches
    if (firstMatch.line === cursor.line && firstMatch.column === cursor.column) {
      if (matches.length > 1) {
        firstMatch = matches[1];
      } else {
        // Only match is current position - set state but don't move cursor
        state.setLastSearch(pattern, 'forward');
        state.searchMatches = matches;
        state.currentMatchPosition = firstMatch;
        return;
      }
    }

    // Update state
    state.setLastSearch(pattern, 'forward');
    state.searchMatches = matches;
    state.currentMatchPosition = firstMatch;

    // Move cursor to first match
    context.setCursor(firstMatch);
  }
}
