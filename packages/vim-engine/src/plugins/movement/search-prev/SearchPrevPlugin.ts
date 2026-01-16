/**
 * SearchPrevPlugin - Jump to previous search result (N key)
 *
 * This plugin implements the 'N' key functionality for navigating to the previous
 * search result. It uses the last search pattern and the opposite direction of
 * the last search to find and move to the previous match in the search results.
 *
 * The plugin works in both NORMAL and VISUAL modes and does not wrap by default
 * (wrap parameter is false). When there are no more matches, it simply does nothing.
 *
 * @example
 * ```typescript
 * import { SearchPrevPlugin } from './plugins/movement/search-prev/SearchPrevPlugin';
 *
 * const plugin = new SearchPrevPlugin();
 * plugin.initialize(context);
 * // When 'N' is pressed, it will jump to the previous search result
 * ```
 */
import { AbstractVimPlugin } from '../../../plugin/AbstractVimPlugin';
import { VIM_MODE } from '../../../state/VimMode';
import { findNextMatch } from '../utils/searchUtils';
import type { ExecutionContextType } from '../../../plugin/VimPlugin';
import type { VimState } from '../../../state/VimState';

/**
 * SearchPrevPlugin - Jump to previous search result (N key)
 *
 * Implements Vim's 'N' key command for navigating to the previous search match.
 * Uses the last search pattern and the opposite direction of the last search
 * stored in the VimState.
 */
export class SearchPrevPlugin extends AbstractVimPlugin {
  /**
   * Unique plugin name
   */
  readonly name = 'movement-search-prev';

  /**
   * Plugin version
   */
  readonly version = '1.0.0';

  /**
   * Plugin description
   */
  readonly description = 'Jump to previous search result (N key)';

  /**
   * Keystroke patterns this plugin handles
   */
  readonly patterns = ['N'];

  /**
   * Vim modes this plugin is active in
   */
  readonly modes = [VIM_MODE.NORMAL, VIM_MODE.VISUAL];

  /**
   * Create a new SearchPrevPlugin
   *
   * @example
   * ```typescript
   * const plugin = new SearchPrevPlugin();
   * ```
   */
  constructor() {
    super('movement-search-prev', 'Jump to previous search result (N key)', ['N'], [
      VIM_MODE.NORMAL,
      VIM_MODE.VISUAL,
    ]);
  }

  /**
   * Perform the plugin action
   *
   * Gets the previous search match based on the last search pattern and the opposite
   * direction of the last search, then moves the cursor to that position and updates
   * currentMatchPosition.
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
   *   // Calculate opposite direction
   *   const oppositeDirection = state.lastSearchDirection === 'forward' ? 'backward' : 'forward';
   *
   *   // Find previous match
   *   const previousMatch = findNextMatch(
   *     state.searchMatches,
   *     cursor,
   *     oppositeDirection,
   *     false // No wrap by default
   *   );
   *
   *   // If previous match exists, move cursor and update currentMatchPosition
   *   if (previousMatch) {
   *     context.setCursor(previousMatch);
   *     state.currentMatchPosition = previousMatch;
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

    // Calculate opposite direction of last search
    const oppositeDirection =
      state.lastSearchDirection === 'forward' ? 'backward' : 'forward';

    // Find previous match using findNextMatch with opposite direction
    const previousMatch = findNextMatch(
      state.searchMatches,
      referencePosition,
      oppositeDirection,
      false // No wrap by default
    );

    // If previous match exists, move cursor and update currentMatchPosition
    if (previousMatch) {
      context.setCursor(previousMatch);
      state.currentMatchPosition = previousMatch;
    }

    // If no more matches, do nothing
  }
}
