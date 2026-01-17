/**
 * N-capital Movement Plugin - Navigate to previous search match (N key)
 *
 * Implements the vim 'N' command for navigating to the previous occurrence
 * of the last search pattern. This is the reverse of the 'n' command.
 *
 * @example
 * ```typescript
 * import { NMovementPlugin } from './N-capital/NMovementPlugin';
 *
 * const plugin = new NMovementPlugin();
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
import { findPreviousMatch } from '../searchUtils';

/**
 * N-capital MovementPlugin - Navigate to previous search match
 *
 * The 'N' key in vim normal mode moves the cursor to the previous occurrence
 * of the last search pattern. This is the reverse of the 'n' command.
 * If no search pattern has been set, pressing 'N' does nothing.
 *
 * Behavior:
 * - N: Jump to previous occurrence of last search pattern
 * - Uses wrap-around (continues from bottom of file when reaching top)
 * - If no pattern is set, stays at current position
 * - If no match exists, stays at current position
 *
 * This plugin complements the NMovementPlugin (lowercase n) which navigates
 * to the next match.
 */
export class NMovementPlugin extends AbstractVimPlugin {
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
   * Create a new NMovementPlugin instance
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
   * It finds the previous occurrence of the last search pattern and moves
   * the cursor to that position.
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

    // Find the previous match from the current cursor position
    // findPreviousMatch searches backward and wraps around
    const match = findPreviousMatch(buffer, pattern, cursor.line, cursor.column);

    // If a match was found, move the cursor to that position
    if (match) {
      const newPosition = new CursorPosition(match.line, match.column);
      context.setCursor(newPosition);
    }
  }
}
