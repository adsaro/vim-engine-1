/**
 * SearchState - Manages search mode state
 *
 * Helper class for managing search-related state during search operations.
 */
import { CursorPosition } from '../../state/CursorPosition';
import { VimState } from '../../state/VimState';
import { TextBuffer } from '../../state/TextBuffer';
import { findNextMatch, findPreviousMatch } from './searchUtils';

export interface SearchResult {
  success: boolean;
  line: number;
  column: number;
  error?: string;
}

/**
 * SearchState - Helper class for managing search-related state
 *
 * Provides utilities for managing search patterns and executing searches
 * within a VimState context.
 *
 * @example
 * ```typescript
 * const searchState = new SearchState(vimState);
 * const pattern = searchState.getCurrentPattern();
 * ```
 */
export class SearchState {
  private state: VimState;

  /**
   * Create a new SearchState
   *
   * @param state - The VimState to manage search for
   */
  constructor(state: VimState) {
    this.state = state;
  }

  /**
   * Get the current search pattern
   *
   * @returns The current search pattern being built
   */
  getCurrentPattern(): string {
    return this.state.getCurrentSearchPattern();
  }

  /**
   * Set the current search pattern
   *
   * @param pattern - The search pattern to set
   */
  setPattern(pattern: string): void {
    this.state.setCurrentSearchPattern(pattern);
  }

  /**
   * Clear the current search pattern
   */
  clearPattern(): void {
    this.state.clearSearchPattern();
  }

  /**
   * Save the current pattern as the last search pattern
   */
  savePattern(): void {
    this.state.setLastSearchPattern(this.state.getCurrentSearchPattern());
  }

  /**
   * Get the last saved search pattern
   *
   * @returns The last search pattern that was successfully matched
   */
  getSavedPattern(): string {
    return this.state.getLastSearchPattern();
  }

  /**
   * Execute search and move cursor to match
   *
   * @param buffer - The text buffer to search in
   * @param forward - Search direction (true = forward, false = backward)
   * @returns Search result with success status and position
   */
  executeSearch(
    buffer: TextBuffer,
    forward: boolean = true
  ): SearchResult {
    const pattern = this.getCurrentPattern();
    const cursor = this.state.cursor;

    let match: { line: number; column: number } | null = null;

    if (forward) {
      match = this.findForward(buffer, pattern, cursor.line, cursor.column);
    } else {
      match = this.findBackward(buffer, pattern, cursor.line, cursor.column);
    }

    if (match) {
      this.savePattern();
      this.state.addJump(cursor.clone());
      this.state.cursor = new CursorPosition(match.line, match.column);
      return { success: true, line: match.line, column: match.column };
    }

    return {
      success: false,
      line: -1,
      column: -1,
      error: `Pattern not found: ${pattern}`,
    };
  }

  /**
   * Find the next occurrence forward from the given position
   */
  private findForward(
    buffer: TextBuffer,
    pattern: string,
    startLine: number,
    startColumn: number
  ): { line: number; column: number } | null {
    return findNextMatch(buffer, pattern, startLine, startColumn);
  }

  /**
   * Find the previous occurrence backward from the given position
   */
  private findBackward(
    buffer: TextBuffer,
    pattern: string,
    startLine: number,
    startColumn: number
  ): { line: number; column: number } | null {
    return findPreviousMatch(buffer, pattern, startLine, startColumn);
  }
}
