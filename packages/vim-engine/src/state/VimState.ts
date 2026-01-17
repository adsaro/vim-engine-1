/**
 * VimState - Aggregates all vim editor state into a single container
 *
 * The VimState class is the central container for all editor state including
 * the text buffer, cursor position, current mode, registers, marks, and history.
 * It provides methods for managing navigation and editing history.
 *
 * @example
 * ```typescript
 * import { VimState } from './state/VimState';
 * import { VimMode, VIM_MODE } from './state/VimMode';
 *
 * // Create with initial content
 * const state = new VimState('Hello\nWorld');
 *
 * // Access state
 * console.log(state.buffer.getLine(0)); // 'Hello'
 * console.log(state.cursor.line, state.cursor.column); // 0, 0
 * console.log(state.mode); // 'NORMAL'
 *
 * // Change mode
 * state.mode = VIM_MODE.INSERT;
 *
 * // Add to history
 * state.pushSearch('pattern');
 * state.pushCommand(':w');
 *
 * // Navigation history
 * state.addJump(state.cursor.clone());
 * state.addChange(state.cursor.clone());
 *
 * // Clone state
 * const saved = state.clone();
 *
 * // Reset state
 * state.reset();
 * ```
 */
import { CursorPosition } from './CursorPosition';
import { TextBuffer } from './TextBuffer';
import { VimMode, VIM_MODE } from './VimMode';

/**
 * Type for register content storage
 * Maps register names to their text content
 */
export type RegisterContent = string;

/**
 * Type for mark position storage
 * Maps mark names to their cursor positions
 */
export type MarkPositionMap = Record<string, CursorPosition | null>;

/**
 * VimState - Main container for all vim editor state
 *
 * Manages:
 * - Text buffer (the document content)
 * - Cursor position (current editing location)
 * - Editor mode (NORMAL, INSERT, VISUAL, etc.)
 * - Registers (clipboard-like storage)
 * - Marks (named positions)
 * - Jump list (navigation history)
 * - Change list (modification history)
 * - Search and command history
 */
export class VimState {
  private _buffer: TextBuffer;
  private _cursor: CursorPosition;
  private _mode: VimMode;
  private _count: number;

  /**
   * Register storage - maps register names to content
   * Named registers (a-z) and special registers (", *, +, etc.)
   */
  registers: Record<string, RegisterContent>;

  /**
   * Mark positions - maps mark names to cursor positions
   */
  markPositions: MarkPositionMap;

  /**
   * Jump list - history of jump positions for Ctrl-O/Ctrl-I navigation
   */
  jumpList: CursorPosition[];

  /**
   * Change list - history of modification positions for . repeat
   */
  changeList: CursorPosition[];

  /**
   * Search history - previous search terms
   */
  searchHistory: string[];

  /**
   * Command history - previous command-line commands
   */
  commandHistory: string[];

  /**
   * Current search pattern being built during search mode
   */
  private _currentSearchPattern: string = '';

  /**
   * Last successfully matched search pattern (for n/N commands)
   */
  private _lastSearchPattern: string = '';

  /**
   * Create a new VimState
   *
   * @param initialContent - Initial text content (string or TextBuffer)
   *
   * @example
   * ```typescript
   * // Empty state
   * const empty = new VimState();
   *
   * // From string
   * const withContent = new VimState('Line 1\nLine 2');
   *
   * // From TextBuffer
   * const buffer = new TextBuffer(['Line 1', 'Line 2']);
   * const fromBuffer = new VimState(buffer);
   * ```
   */
  constructor(initialContent: string | TextBuffer = '') {
    if (initialContent instanceof TextBuffer) {
      this._buffer = initialContent;
    } else {
      this._buffer = new TextBuffer(initialContent);
    }
    this._cursor = new CursorPosition();
    this._mode = VIM_MODE.NORMAL;
    this._count = 0;
    this.registers = {};
    this.markPositions = {};
    this.jumpList = [];
    this.changeList = [];
    this.searchHistory = [];
    this.commandHistory = [];
  }

  /**
   * Get current mode
   *
   * @returns {VimMode} The current editor mode
   *
   * @example
   * ```typescript
   * if (state.mode === VIM_MODE.INSERT) {
   *   console.log('In insert mode');
   * }
   * ```
   */
  get mode(): VimMode {
    return this._mode;
  }

  /**
   * Set current mode
   *
   * @param value - The mode to set
   *
   * @example
   * ```typescript
   * state.mode = VIM_MODE.VISUAL;
   * ```
   */
  set mode(value: VimMode) {
    this._mode = value;
  }

  /**
   * Get the text buffer
   *
   * @returns {TextBuffer} The current text buffer
   *
   * @example
   * ```typescript
   * const content = state.buffer.getContent();
   * ```
   */
  get buffer(): TextBuffer {
    return this._buffer;
  }

  /**
   * Set the text buffer
   *
   * @param value - The new text buffer
   *
   * @example
   * ```typescript
   * state.buffer = new TextBuffer('New content');
   * ```
   */
  set buffer(value: TextBuffer) {
    this._buffer = value;
  }

  /**
   * Get the cursor position
   *
   * @returns {CursorPosition} The current cursor position
   *
   * @example
   * ```typescript
   * const { line, column } = state.cursor;
   * ```
   */
  get cursor(): CursorPosition {
    return this._cursor;
  }

  /**
   * Set the cursor position
   *
   * @param value - The new cursor position
   *
   * @example
   * ```typescript
   * state.cursor = new CursorPosition(5, 10);
   * ```
   */
  set cursor(value: CursorPosition) {
    this._cursor = value;
  }

  /**
   * Get the count for command repetition
   *
   * @returns {number} The current count (0 if not set)
   *
   * @example
   * ```typescript
   * const count = state.count;
   * ```
   */
  get count(): number {
    return this._count;
  }

  /**
   * Set the count for command repetition
   *
   * @param value - The count to set
   *
   * @example
   * ```typescript
   * state.count = 5;
   * ```
   */
  set count(value: number) {
    this._count = value;
  }

  /**
   * Add a jump to the jump list
   *
   * Records the current position for jump navigation (Ctrl-O/Ctrl-I).
   *
   * @param position - The position to add (will be cloned)
   * @returns {void}
   *
   * @example
   * ```typescript
   * state.addJump(state.cursor.clone());
   * ```
   */
  addJump(position: CursorPosition): void {
    this.jumpList.push(position.clone());
  }

  /**
   * Add a change to the change list
   *
   * Records the cursor position after a change for . repeat functionality.
   *
   * @param position - The position to add (will be cloned)
   * @returns {void}
   *
   * @example
   * ```typescript
   * state.addChange(state.cursor.clone());
   * ```
   */
  addChange(position: CursorPosition): void {
    this.changeList.push(position.clone());
  }

  /**
   * Push a search term to history
   *
   * @param term - The search term to record
   * @returns {void}
   *
   * @example
   * ```typescript
   * state.pushSearch('pattern');
   * ```
   */
  pushSearch(term: string): void {
    this.searchHistory.push(term);
  }

  /**
   * Push a command to history
   *
   * @param command - The command string to record
   * @returns {void}
   *
   * @example
   * ```typescript
   * state.pushCommand(':w');
   * ```
   */
  pushCommand(command: string): void {
    this.commandHistory.push(command);
  }

  /**
   * Get the current search pattern being built
   *
   * @returns {string} The current search pattern
   *
   * @example
   * ```typescript
   * const pattern = state.getCurrentSearchPattern();
   * ```
   */
  getCurrentSearchPattern(): string {
    return this._currentSearchPattern;
  }

  /**
   * Set the current search pattern
   *
   * @param pattern - The search pattern to set
   *
   * @example
   * ```typescript
   * state.setCurrentSearchPattern('hello');
   * ```
   */
  setCurrentSearchPattern(pattern: string): void {
    this._currentSearchPattern = pattern;
  }

  /**
   * Get the last successfully matched search pattern
   *
   * @returns {string} The last search pattern
   *
   * @example
   * ```typescript
   * const lastPattern = state.getLastSearchPattern();
   * ```
   */
  getLastSearchPattern(): string {
    return this._lastSearchPattern;
  }

  /**
   * Set the last successfully matched search pattern
   *
   * @param pattern - The search pattern to save
   *
   * @example
   * ```typescript
   * state.setLastSearchPattern('hello');
   * ```
   */
  setLastSearchPattern(pattern: string): void {
    this._lastSearchPattern = pattern;
  }

  /**
   * Clear the current search pattern
   *
   * @returns {void}
   *
   * @example
   * ```typescript
   * state.clearSearchPattern();
   * ```
   */
  clearSearchPattern(): void {
    this._currentSearchPattern = '';
  }

  /**
   * Create a deep copy of this state
   *
   * @returns {VimState} A new state with copied content
   *
   * @example
   * ```typescript
   * const saved = state.clone();
   * // Modify state...
   * // Restore if needed
   * ```
   */
  clone(): VimState {
    const cloned = new VimState(this._buffer.clone());
    cloned._cursor = this._cursor.clone();
    cloned._mode = this._mode;
    cloned._count = this._count;
    cloned.registers = { ...this.registers };

    // Deep clone mark positions
    for (const key in this.markPositions) {
      cloned.markPositions[key] = this.markPositions[key]?.clone() ?? null;
    }

    // Deep clone jump list
    cloned.jumpList = this.jumpList.map(pos => pos.clone());

    // Deep clone change list
    cloned.changeList = this.changeList.map(pos => pos.clone());

    // Clone arrays
    cloned.searchHistory = [...this.searchHistory];
    cloned.commandHistory = [...this.commandHistory];

    // Clone search patterns
    cloned._currentSearchPattern = this._currentSearchPattern;
    cloned._lastSearchPattern = this._lastSearchPattern;

    return cloned;
  }

  /**
   * Reset state to initial values
   *
   * Clears buffer, resets cursor, mode, and all history.
   *
   * @returns {void}
   *
   * @example
   * ```typescript
   * state.reset();
   * ```
   */
  reset(): void {
    this._buffer = new TextBuffer();
    this._cursor = new CursorPosition();
    this._mode = VIM_MODE.NORMAL;
    this._count = 0;
    this.registers = {};
    this.markPositions = {};
    this.jumpList = [];
    this.changeList = [];
    this.searchHistory = [];
    this.commandHistory = [];

    // Clear search patterns
    this._currentSearchPattern = '';
    this._lastSearchPattern = '';
  }
}
