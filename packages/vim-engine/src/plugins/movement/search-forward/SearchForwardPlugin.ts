/**
 * SearchForwardPlugin - Initiate forward search (/ key)
 *
 * Implements the vim '/' command for initiating forward search.
 * When pressed, transitions to SEARCH_INPUT mode and activates
 * the search input manager to collect the search pattern.
 *
 * @example
 * ```typescript
 * import { SearchForwardPlugin } from './search-forward/SearchForwardPlugin';
 * import { SearchInputManager } from './utils/searchInputManager';
 *
 * const searchInputManager = new SearchInputManager();
 * const plugin = new SearchForwardPlugin(searchInputManager);
 * // Press '/' to start forward search input
 * ```
 *
 * @see SearchInputManager For the search input state management
 */
import { AbstractVimPlugin } from '../../../plugin/AbstractVimPlugin';
import { VIM_MODE, VimMode } from '../../../state/VimMode';
import { ExecutionContextType } from '../../../plugin/VimPlugin';
import { SearchInputManager } from '../utils/searchInputManager';

/**
 * SearchForwardPlugin - Initiates forward search (/ key)
 *
 * The '/' key in vim normal and visual modes initiates a forward search.
 * This plugin:
 * - Activates the search input manager with 'forward' direction
 * - Transitions the editor to SEARCH_INPUT mode
 * - Resets any existing search state
 *
 * Key features:
 * - Works in both NORMAL and VISUAL modes
 * - Resets search pattern and cursor position
 * - Sets search direction to 'forward'
 * - Does not execute in other modes (INSERT, COMMAND, etc.)
 *
 * @example
 * ```typescript
 * // Basic usage
 * const searchInputManager = new SearchInputManager();
 * const plugin = new SearchForwardPlugin(searchInputManager);
 * executor.registerPlugin(plugin);
 *
 * // Press '/' to start forward search
 * executor.handleKeystroke('/');
 * // Mode is now SEARCH_INPUT, ready to receive pattern
 * ```
 */
export class SearchForwardPlugin extends AbstractVimPlugin {
  /**
   * Plugin name
   */
  readonly name = 'movement-search-forward';

  /**
   * Plugin version
   */
  readonly version = '1.0.0';

  /**
   * Plugin description
   */
  readonly description = 'Initiate forward search (/ key)';

  /**
   * Keystroke patterns handled by this plugin
   */
  readonly patterns = ['/'];

  /**
   * Modes this plugin is active in
   */
  readonly modes: VimMode[] = [VIM_MODE.NORMAL, VIM_MODE.VISUAL];

  /**
   * Search input manager instance
   */
  private searchInputManager: SearchInputManager;

  /**
   * Create a new SearchForwardPlugin instance
   *
   * @param searchInputManager - The search input manager to use for state management
   *
   * @example
   * ```typescript
   * const searchInputManager = new SearchInputManager();
   * const plugin = new SearchForwardPlugin(searchInputManager);
   * ```
   */
  constructor(searchInputManager: SearchInputManager) {
    super(
      'movement-search-forward',
      'Initiate forward search (/ key)',
      ['/'],
      [VIM_MODE.NORMAL, VIM_MODE.VISUAL]
    );
    this.searchInputManager = searchInputManager;
  }

  /**
   * Perform the plugin action
   *
   * When the '/' key is pressed:
   * 1. Starts search input with 'forward' direction
   * 2. Transitions to SEARCH_INPUT mode
   *
   * @param context - The execution context
   * @returns {void}
   *
   * @example
   * ```typescript
   * const context = new ExecutionContext(state);
   * context.setMode(VIM_MODE.NORMAL);
   * plugin.performAction(context);
   * // Search input is now active, mode is SEARCH_INPUT
   * ```
   */
  protected performAction(context: ExecutionContextType): void {
    // Start search input with forward direction
    this.searchInputManager.start('forward');

    // Transition to SEARCH_INPUT mode
    context.setMode(VIM_MODE.SEARCH_INPUT);
  }
}
