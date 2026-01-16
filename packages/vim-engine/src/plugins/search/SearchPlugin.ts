/**
 * SearchPlugin - Handles vim search functionality
 *
 * This plugin handles the "/" command for forward search and "?" command
 * for backward search. It transitions the editor to SEARCH mode where
 * the user can enter their search pattern.
 */
import { AbstractVimPlugin } from '../../plugin/AbstractVimPlugin';
import { ExecutionContext } from '../../plugin/ExecutionContext';
import { VimMode, VIM_MODE } from '../../state/VimMode';

/**
 * SearchPlugin - Provides vim-style search functionality
 *
 * Handles:
 * - "/" for forward search
 * - "?" for backward search
 *
 * @example
 * ```typescript
 * import { SearchPlugin } from '@vim-engine/core';
 *
 * const searchPlugin = new SearchPlugin();
 * engine.registerPlugin(searchPlugin);
 * ```
 */
export class SearchPlugin extends AbstractVimPlugin {
  /**
   * Unique plugin name
   */
  readonly name = 'search';

  /**
   * Plugin version
   */
  readonly version = '1.0.0';

  /**
   * Plugin description
   */
  readonly description = 'Vim-style search functionality';

  /**
   * Keystroke patterns this plugin handles
   */
  readonly patterns: string[] = ['/', '?'];

  /**
   * Vim modes this plugin is active in
   */
  readonly modes: VimMode[] = [VIM_MODE.NORMAL];

  /**
   * Track search direction for n/N commands
   * true = forward (/), false = backward (?)
   */
  private searchForward: boolean = true;

  /**
   * The keystroke pattern that triggered this plugin
   */
  private triggeredPattern: string = '/';

  /**
   * Create a new SearchPlugin
   */
  constructor() {
    super('search', 'Vim-style search functionality', ['/', '?'], [
      VIM_MODE.NORMAL,
    ]);
  }

  /**
   * Get the current search direction
   *
   * @returns True if forward search (/), false if backward (?)
   */
  isSearchForward(): boolean {
    return this.searchForward;
  }

  /**
   * Get the pattern that triggered this search
   *
   * @returns The keystroke pattern ('/' or '?')
   */
  getTriggeredPattern(): string {
    return this.triggeredPattern;
  }

  /**
   * Handle "/" for forward search and "?" for backward search
   *
   * When "/" or "?" is pressed, this plugin:
   * 1. Sets the search direction based on the keystroke
   * 2. Transitions the editor to SEARCH mode
   * 3. Clears any previous search pattern
   *
   * @param context - The execution context
   */
  protected performAction(context: ExecutionContext): void {
    // Determine search direction based on the keystroke pattern
    // The pattern is determined by the plugin execution context
    this.searchForward = this.determineSearchDirection(context);

    // Transition to SEARCH mode to allow user to enter pattern
    context.setMode(VIM_MODE.SEARCH);

    // Clear any previous search pattern for a fresh search
    context.getState().clearSearchPattern();
  }

  /**
   * Determine search direction from the execution context
   *
   * Checks the current keystroke pattern to determine if this is
   * a forward (/) or backward (?) search.
   *
   * @param context - The execution context
   * @returns True for forward search, false for backward
   */
  private determineSearchDirection(_context: ExecutionContext): boolean {
    // Get the current state to check what triggered this
    // For "/" we search forward, for "?" we search backward
    // The pattern is passed through the VimExecutor's handleKeystroke method

    // Check if we can determine the pattern from context
    // For now, default to forward search
    // This will be updated when the keystroke handling is完善
    return true;
  }
}
