/**
 * SearchNextPlugin - Jump to next search result (n key)
 *
 * This plugin implements the 'n' key functionality for navigating to the next
 * search result. It uses the last search pattern and direction to find and move
 * to the next match in the search results.
 *
 * The plugin works in both NORMAL and VISUAL modes and does not wrap by default
 * (wrap parameter is false). When there are no more matches, it simply does nothing.
 *
 * @example
 * ```typescript
 * import { SearchNextPlugin } from './plugins/movement/search-next/SearchNextPlugin';
 *
 * const plugin = new SearchNextPlugin();
 * plugin.initialize(context);
 * // When 'n' is pressed, it will jump to the next search result
 * ```
 */
import { AbstractVimPlugin } from '../../../plugin/AbstractVimPlugin';
import { VIM_MODE } from '../../../state/VimMode';
import { findNextMatch } from '../utils/searchUtils';
import type { ExecutionContextType } from '../../../plugin/VimPlugin';
import type { VimState } from '../../../state/VimState';

/**
 * SearchNextPlugin - Jump to next search result (n key)
 *
 * Implements Vim's 'n' key command for navigating to the next search match.
 * Uses the last search pattern and direction stored in the VimState.
 */
export class SearchNextPlugin extends AbstractVimPlugin {
  /**
   * Unique plugin name
   */
  readonly name = 'movement-search-next';

  /**
   * Plugin version
   */
  readonly version = '1.0.0';

  /**
   * Plugin description
   */
  readonly description = 'Jump to next search result (n key)';

  /**
   * Keystroke patterns this plugin handles
   */
  readonly patterns = ['n'];

  /**
   * Vim modes this plugin is active in
   */
  readonly modes = [VIM_MODE.NORMAL, VIM_MODE.VISUAL];

  /**
   * Create a new SearchNextPlugin
   *
   * @example
   * ```typescript
   * const plugin = new SearchNextPlugin();
   * ```
   */
  constructor() {
    super('movement-search-next', 'Jump to next search result (n key)', ['n'], [
      VIM_MODE.NORMAL,
      VIM_MODE.VISUAL,
    ]);
  }

  /**
   * Perform the plugin action
   *
   * Gets the next search match based on the last search pattern and direction,
   * then moves the cursor to that position and updates currentMatchPosition.
   *
   * If no previous search exists or no more matches are available, does nothing.
   *
   * @param context - The execution context
   * @returns {void}
   *
   * @example
   * ```typescript
   * protected performAction(context: ExecutionContextType): void {
   *   const state = context.getState() as VimState;
   *   const cursor = context.getCursor() as CursorPosition;
   *
   *   // Check if there's a last search
   *   if (!state.lastSearchPattern || !state.lastSearchDirection) {
   *     return; // No previous search, do nothing
   *   }
   *
   *   // Find next match
   *   const nextMatch = findNextMatch(
   *     state.searchMatches,
   *     cursor,
   *     state.lastSearchDirection,
   *     false // No wrap by default
   *   );
   *
   *   // If next match exists, move cursor and update currentMatchPosition
   *   if (nextMatch) {
   *     context.setCursor(nextMatch);
   *     state.currentMatchPosition = nextMatch;
   *   }
   * }
   * ```
   */
  protected performAction(context: ExecutionContextType): void {
    // Get state from context
    const state = context.getState() as VimState;

    // Check if there's a last search (lastSearchPattern and lastSearchDirection)
    if (!state.lastSearchPattern || !state.lastSearchDirection) {
      // No previous search, do nothing
      return;
    }

    // Use currentMatchPosition as reference if available, otherwise use cursor position
    const referencePosition = state.currentMatchPosition || context.getCursor();

    // Find next match using findNextMatch
    const nextMatch = findNextMatch(
      state.searchMatches,
      referencePosition,
      state.lastSearchDirection,
      false // No wrap by default
    );

    // If next match exists, move cursor and update currentMatchPosition
    if (nextMatch) {
      context.setCursor(nextMatch);
      state.currentMatchPosition = nextMatch;
    }

    // If no more matches, do nothing
  }
}
