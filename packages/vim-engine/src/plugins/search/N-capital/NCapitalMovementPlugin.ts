/**
 * N-capital Movement Plugin - Navigate to previous search match (N key)
 *
 * Implements the vim 'N' command for navigating to the previous occurrence
 * of the last search pattern. This is the reverse of the 'n' command.
 *
 * @example
 * ```typescript
 * import { NCapitalMovementPlugin } from './N-capital/NCapitalMovementPlugin';
 *
 * const plugin = new NCapitalMovementPlugin();
 * // Press 'N' after a search to go to previous match
 * ```
 *
 * @see NMovementPlugin For the lowercase n implementation
 * @see SearchPlugin For the search initiation plugin
 * @see SearchState For search state management
 */
import { AbstractVimPlugin } from '../../../plugin/AbstractVimPlugin';
import { ExecutionContext } from '../../../plugin/ExecutionContext';
import { VIM_MODE, VimMode } from '../../../state/VimMode';
import { CursorPosition } from '../../../state/CursorPosition';
import { findNextMatch, findPreviousMatch } from '../searchUtils';

/**
 * NCapitalMovementPlugin - Navigate to previous search match
 *
 * The 'N' key in vim normal mode moves the cursor to the previous occurrence
 * of the last search pattern in the **reverse of the original search direction**.
 * If the original search was forward (/ or *), then 'N' searches backward.
 * If the original search was backward (? or #), then 'N' searches forward.
 * If no search pattern has been set, pressing 'N' does nothing.
 *
 * Behavior:
 * - N: Jump to previous occurrence in the reverse of the original search direction
 * - Uses wrap-around (continues from top/bottom when reaching end/beginning)
 * - If no pattern is set, stays at current position
 * - If no match exists, stays at current position
 *
 * This plugin complements the NMovementPlugin (lowercase n) which navigates
 * in the original direction.
 */
export class NCapitalMovementPlugin extends AbstractVimPlugin {
  /**
   * Plugin name
   */
  readonly name = 'search-N';

  /**
   * Plugin version
   */
  readonly version = '1.0.0';

  /**
   * Plugin description
   */
  readonly description = 'Navigate to previous search match (N key)';

  /**
   * Keystroke patterns handled by this plugin
   */
  readonly patterns = ['N'];

  /**
   * Modes this plugin is active in
   */
  readonly modes: VimMode[] = [VIM_MODE.NORMAL, VIM_MODE.VISUAL];

  /**
   * Create a new NCapitalMovementPlugin instance
   */
  constructor() {
    super('search-N', 'Navigate to previous search match (N key)', ['N'], [
      VIM_MODE.NORMAL,
      VIM_MODE.VISUAL,
    ]);
  }

  /**
   * Perform the search navigation action
   *
   * This method is called when 'N' is pressed in normal or visual mode.
   * It finds the previous occurrence of the last search pattern in the
   * **reverse of the original search direction** and moves the cursor to that position.
   *
   * @param context - The execution context containing vim state and buffer
   */
  protected performAction(context: ExecutionContext): void {
    const vimState = context.getState();
    const buffer = context.getBuffer();
    const cursor = context.getCursor();

    // Check if we have a search pattern to work with
    const pattern = vimState.getLastSearchPattern();

    // If no pattern is set, do nothing (stay at current position)
    if (!pattern || pattern.length === 0) {
      return;
    }

    // Check if buffer is empty
    if (buffer.isEmpty()) {
      return;
    }

    // Get the original search direction from the state
    // searchForward = true means the original search was / or *
    // searchForward = false means the original search was ? or #
    // For 'N', we search in the REVERSE direction
    const searchForward = vimState.isSearchForward();

    // Find the next match in the REVERSE of the original search direction
    const match = searchForward
      ? findPreviousMatch(buffer, pattern, cursor.line, cursor.column)
      : findNextMatch(buffer, pattern, cursor.line, cursor.column);

    // If a match was found, move the cursor to that position
    if (match) {
      const newPosition = new CursorPosition(match.line, match.column);
      context.setCursor(newPosition);
    }
  }
}
