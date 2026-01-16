/**
 * SearchBackwardPlugin - Initiate backward search (? key)
 *
 * Implements the vim '?' command for initiating backward search.
 * When pressed, transitions to SEARCH_INPUT mode and activates
 * the search input manager to collect the search pattern.
 *
 * @example
 * ```typescript
 * import { SearchBackwardPlugin } from './search-backward/SearchBackwardPlugin';
 * import { SearchInputManager } from './utils/searchInputManager';
 *
 * const searchInputManager = new SearchInputManager();
 * const plugin = new SearchBackwardPlugin(searchInputManager);
 * // Press '?' to start backward search input
 * ```
 *
 * @see SearchInputManager For the search input state management
 */
import { AbstractVimPlugin } from '../../../plugin/AbstractVimPlugin';
import { VIM_MODE, VimMode } from '../../../state/VimMode';
import { ExecutionContextType } from '../../../plugin/VimPlugin';
import { SearchInputManager } from '../utils/searchInputManager';

/**
 * SearchBackwardPlugin - Initiates backward search (? key)
 *
 * The '?' key in vim normal and visual modes initiates a backward search.
 * This plugin:
 * - Activates the search input manager with 'backward' direction
 * - Transitions the editor to SEARCH_INPUT mode
 * - Resets any existing search state
 *
 * Key features:
 * - Works in both NORMAL and VISUAL modes
 * - Resets search pattern and cursor position
 * - Sets search direction to 'backward'
 * - Does not execute in other modes (INSERT, COMMAND, etc.)
 *
 * @example
 * ```typescript
 * // Basic usage
 * const searchInputManager = new SearchInputManager();
 * const plugin = new SearchBackwardPlugin(searchInputManager);
 * executor.registerPlugin(plugin);
 *
 * // Press '?' to start backward search
 * executor.handleKeystroke('?');
 * // Mode is now SEARCH_INPUT, ready to receive pattern
 * ```
 */
export class SearchBackwardPlugin extends AbstractVimPlugin {
  /**
   * Plugin name
   */
  readonly name = 'movement-search-backward';

  /**
   * Plugin version
   */
  readonly version = '1.0.0';

  /**
   * Plugin description
   */
  readonly description = 'Initiate backward search (? key)';

  /**
   * Keystroke patterns handled by this plugin
   */
  readonly patterns = ['?'];

  /**
   * Modes this plugin is active in
   */
  readonly modes: VimMode[] = [VIM_MODE.NORMAL, VIM_MODE.VISUAL];

  /**
   * Search input manager instance
   */
  private searchInputManager: SearchInputManager;

  /**
   * Create a new SearchBackwardPlugin instance
   *
   * @param searchInputManager - The search input manager to use for state management
   *
   * @example
   * ```typescript
   * const searchInputManager = new SearchInputManager();
   * const plugin = new SearchBackwardPlugin(searchInputManager);
   * ```
   */
  constructor(searchInputManager: SearchInputManager) {
    super(
      'movement-search-backward',
      'Initiate backward search (? key)',
      ['?'],
      [VIM_MODE.NORMAL, VIM_MODE.VISUAL]
    );
    this.searchInputManager = searchInputManager;
  }

  /**
   * Perform the plugin action
   *
   * When the '?' key is pressed:
   * 1. Starts search input with 'backward' direction
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
    // Start search input with backward direction
    this.searchInputManager.start('backward');

    // Transition to SEARCH_INPUT mode
    context.setMode(VIM_MODE.SEARCH_INPUT);
  }
}
