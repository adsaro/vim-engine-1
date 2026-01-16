/**
 * Search Input Manager
 *
 * Manages the state for search pattern input in Vim-style search commands.
 * Handles multi-key sequences for forward (/) and backward (?) search operations,
 * including cursor positioning within the pattern and character insertion/deletion.
 */

/**
 * State of search input
 *
 * Represents the current state of the search input buffer, including
 * whether search is active, the search direction, the pattern being built,
 * and the cursor position within the pattern.
 */
export interface SearchInputState {
  /** Whether search input is currently active */
  isActive: boolean;
  /** Search direction: forward (/) or backward (?) */
  direction: 'forward' | 'backward';
  /** The search pattern being constructed */
  pattern: string;
  /** Cursor position within the pattern (0 to pattern.length) */
  cursorPosition: number;
}

/**
 * Search Input Manager
 *
 * Manages the state for search pattern input in Vim-style search commands.
 * Provides methods for starting search input, adding/deleting characters,
 * moving the cursor within the pattern, and completing or canceling the search.
 */
export class SearchInputManager {
  private state: SearchInputState = {
    isActive: false,
    direction: 'forward',
    pattern: '',
    cursorPosition: 0,
  };

  /**
   * Start search input
   *
   * Initializes search input state for a new search operation.
   * Resets any existing state and sets the search direction.
   *
   * @param direction - Search direction: 'forward' or 'backward'
   *
   * @example
   * ```typescript
   * const manager = new SearchInputManager();
   * manager.start('forward');
   * // Search input is now active, ready to receive pattern characters
   * ```
   */
  start(direction: 'forward' | 'backward'): void {
    // Reset all state properties
    this.state.isActive = true;
    this.state.direction = direction;
    this.state.pattern = '';
    this.state.cursorPosition = 0;
  }

  /**
   * Add character to pattern
   *
   * Inserts a character at the current cursor position within the pattern.
   * The cursor is moved to the position after the inserted character.
   *
   * @param char - Character to add to the pattern
   *
   * @example
   * ```typescript
   * manager.start('forward');
   * manager.addChar('h');
   * manager.addChar('e');
   * // Pattern is now "he", cursor at position 2
   * ```
   */
  addChar(char: string): void {
    const { pattern, cursorPosition } = this.state;

    // Insert character at cursor position
    const before = pattern.slice(0, cursorPosition);
    const after = pattern.slice(cursorPosition);
    this.state.pattern = before + char + after;

    // Move cursor after inserted characters (by length of added string)
    this.state.cursorPosition = cursorPosition + char.length;
  }

  /**
   * Delete character before cursor
   *
   * Removes the character immediately before the cursor position.
   * Does nothing if the cursor is at position 0.
   *
   * @example
   * ```typescript
   * manager.start('forward');
   * manager.addChar('a');
   * manager.addChar('b');
   * manager.addChar('c');
   * manager.deleteChar();
   * // Pattern is now "ab", cursor at position 2
   * ```
   */
  deleteChar(): void {
    const { pattern, cursorPosition } = this.state;

    // Only delete if cursor is not at position 0
    if (cursorPosition === 0) {
      return;
    }

    // Remove character before cursor
    const before = pattern.slice(0, cursorPosition - 1);
    const after = pattern.slice(cursorPosition);
    this.state.pattern = before + after;

    // Move cursor back
    this.state.cursorPosition = cursorPosition - 1;
  }

  /**
   * Move cursor within pattern
   *
   * Moves the cursor by the specified delta amount within the pattern.
   * The cursor position is clamped between 0 and the pattern length.
   *
   * @param delta - Number of positions to move (positive = forward, negative = backward)
   *
   * @example
   * ```typescript
   * manager.start('forward');
   * manager.addChar('a');
   * manager.addChar('b');
   * manager.addChar('c');
   * manager.moveCursor(-1);
   * // Cursor is now at position 2 (between 'b' and 'c')
   * ```
   */
  moveCursor(delta: number): void {
    const newPosition = this.state.cursorPosition + delta;

    // Clamp cursor position between 0 and pattern length
    this.state.cursorPosition = Math.max(
      0,
      Math.min(this.state.pattern.length, newPosition)
    );
  }

  /**
   * Cancel search input
   *
   * Cancels the current search input operation and resets all state.
   * Sets isActive to false, clears the pattern, and resets cursor position.
   *
   * @example
   * ```typescript
   * manager.start('forward');
   * manager.addChar('test');
   * manager.cancel();
   * // Search input is now inactive, pattern is empty
   * ```
   */
  cancel(): void {
    this.state.isActive = false;
    this.state.pattern = '';
    this.state.cursorPosition = 0;
  }

  /**
   * Complete search input
   *
   * Completes the current search input operation and returns the result.
   * Returns null if search input is not active. Deactivates search input
   * after returning the result.
   *
   * @returns Object containing pattern and direction, or null if not active
   *
   * @example
   * ```typescript
   * manager.start('backward');
   * manager.addChar('pattern');
   * const result = manager.complete();
   * // Returns: { pattern: 'pattern', direction: 'backward' }
   * // Search input is now inactive
   * ```
   */
  complete(): { pattern: string; direction: 'forward' | 'backward' } | null {
    if (!this.state.isActive) {
      return null;
    }

    const result = {
      pattern: this.state.pattern,
      direction: this.state.direction,
    };

    // Deactivate after completion
    this.state.isActive = false;
    this.state.pattern = '';
    this.state.cursorPosition = 0;

    return result;
  }

  /**
   * Get current state
   *
   * Returns a read-only copy of the current search input state.
   * The returned object cannot be used to modify the internal state.
   *
   * @returns Read-only copy of the current state
   *
   * @example
   * ```typescript
   * const state = manager.getState();
   * console.log(state.pattern); // "hello"
   * // state.isActive = true; // TypeScript error: Cannot assign to 'isActive'
   * ```
   */
  getState(): Readonly<SearchInputState> {
    return { ...this.state };
  }

  /**
   * Check if search input is active
   *
   * Returns whether search input is currently active and accepting input.
   *
   * @returns true if search input is active, false otherwise
   *
   * @example
   * ```typescript
   * console.log(manager.isActive()); // false
   * manager.start('forward');
   * console.log(manager.isActive()); // true
   * manager.cancel();
   * console.log(manager.isActive()); // false
   * ```
   */
  isActive(): boolean {
    return this.state.isActive;
  }
}
