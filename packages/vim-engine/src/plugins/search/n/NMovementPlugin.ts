/**
 * NMovementPlugin - Navigate to next search match (n key)
 *
 * Implements the vim 'n' command for navigating to the next occurrence
 * of the last search pattern. This is the companion to the '/' and '?'
 * search commands.
 *
 * @example
 * ```typescript
 * import { NMovementPlugin } from './n/NMovementPlugin';
 *
 * const plugin = new NMovementPlugin();
 * // Press 'n' after a search to go to next match
 * ```
 *
 * @see SearchPlugin For the search initiation plugin
 * @see SearchState For search state management
 */
import { AbstractVimPlugin } from '../../../plugin/AbstractVimPlugin';
import { ExecutionContext } from '../../../plugin/ExecutionContext';
import { VIM_MODE, VimMode } from '../../../state/VimMode';
import { CursorPosition } from '../../../state/CursorPosition';
import { findNextMatch, findPreviousMatch } from '../searchUtils';

/**
 * NMovementPlugin - Navigate to next search match
 *
 * The 'n' key in vim normal mode moves the cursor to the next occurrence
 * of the last search pattern in the **original search direction**.
 * If the original search was forward (/ or *), then 'n' searches forward.
 * If the original search was backward (? or #), then 'n' searches backward.
 * If no search pattern has been set, pressing 'n' does nothing.
 *
 * Behavior:
 * - n: Jump to next occurrence in the original search direction
 * - Uses wrap-around (continues from top/bottom when reaching end/beginning)
 * - If no pattern is set, stays at current position
 * - If no match exists, stays at current position
 *
 * This plugin complements the NMovementPlugin (capital N) which navigates
 * in the reverse direction.
 */
export class NMovementPlugin extends AbstractVimPlugin {
  /**
   * Plugin name
   */
  readonly name = 'search-n';

  /**
   * Plugin version
   */
  readonly version = '1.0.0';

  /**
   * Plugin description
   */
  readonly description = 'Navigate to next search match (n key)';

  /**
   * Keystroke patterns handled by this plugin
   */
  readonly patterns = ['n'];

  /**
   * Modes this plugin is active in
   */
  readonly modes: VimMode[] = [VIM_MODE.NORMAL, VIM_MODE.VISUAL];

  /**
   * Create a new NMovementPlugin instance
   */
  constructor() {
    super('search-n', 'Navigate to next search match (n key)', ['n'], [
      VIM_MODE.NORMAL,
      VIM_MODE.VISUAL,
    ]);
  }

  /**
   * Perform the search navigation action
   *
   * This method is called when 'n' is pressed in normal or visual mode.
   * It finds the next occurrence of the last search pattern in the
   * **original search direction** and moves the cursor to that position.
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
    const searchForward = vimState.isSearchForward();

    // Find the next match in the original search direction
    const match = searchForward
      ? findNextMatch(buffer, pattern, cursor.line, cursor.column)
      : findPreviousMatch(buffer, pattern, cursor.line, cursor.column);

    // If a match was found, move the cursor to that position
    if (match) {
      const newPosition = new CursorPosition(match.line, match.column);
      context.setCursor(newPosition);
    }
  }
}
