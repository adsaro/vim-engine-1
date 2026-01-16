/**
 * ExecutionContext - Manages the execution environment for plugins
 *
 * The ExecutionContext encapsulates the editor state and provides utility methods
 * for plugins to interact with the editor. It provides a clean interface for:
 * - State access and modification
 * - Cursor manipulation
 * - Mode management
 * - Register/clipboard operations
 *
 * @example
 * ```typescript
 * import { ExecutionContext } from './plugin/ExecutionContext';
 * import { VimState } from './state/VimState';
 *
 * // Create with default empty state
 * const context = new ExecutionContext();
 *
 * // Create with initial state
 * const state = new VimState('Hello\nWorld');
 * const contextWithState = new ExecutionContext(state);
 *
 * // Access state
 * const buffer = context.getBuffer();
 * const cursor = context.getCursor();
 * const mode = context.getMode();
 *
 * // Modify state
 * context.setMode('INSERT');
 * context.setCursor({ line: 0, column: 5 });
 * context.moveCursor(1, 0); // Move down one line
 *
 * // Register operations
 * context.setRegister('a', 'copied text');
 * const text = context.getRegister('a');
 *
 * // Clipboard
 * context.setClipboard('clipboard text');
 * const clipboard = context.getClipboard();
 *
 * // Current line
 * const line = context.getCurrentLine();
 * const lineNum = context.getLineNumber();
 *
 * // Clone context
 * const cloned = context.clone();
 * ```
 */
import { VimState } from '../state/VimState';
import { TextBuffer } from '../state/TextBuffer';
import { CursorPosition } from '../state/CursorPosition';
import { VimMode } from '../state/VimMode';
import { ExecutionContextType } from './VimPlugin';

/**
 * ExecutionContext - Manages the execution environment for plugins
 */
export class ExecutionContext implements ExecutionContextType {
  private state: VimState;

  /**
   * Create an execution context with optional initial state
   *
   * @param state - Optional initial VimState (defaults to empty state)
   *
   * @example
   * ```typescript
   * // Default empty context
   * const context = new ExecutionContext();
   *
   * // With initial state
   * const state = new VimState('Hello\nWorld');
   * const context = new ExecutionContext(state);
   * ```
   */
  constructor(state?: VimState) {
    this.state = state || new VimState();
  }

  /**
   * Get the current state
   *
   * @returns {VimState} The current editor state
   *
   * @example
   * ```typescript
   * const state = context.getState();
   * ```
   */
  getState(): VimState {
    return this.state;
  }

  /**
   * Set a new state
   *
   * @param state - The new state to set
   * @returns {void}
   *
   * @example
   * ```typescript
   * context.setState(newState);
   * ```
   */
  setState(state: VimState): void {
    this.state = state;
  }

  /**
   * Get the current buffer
   *
   * @returns {TextBuffer} The current text buffer
   *
   * @example
   * ```typescript
   * const buffer = context.getBuffer();
   * const content = buffer.getContent();
   * ```
   */
  getBuffer(): TextBuffer {
    return this.state.buffer;
  }

  /**
   * Set a new buffer
   *
   * @param buffer - The new text buffer
   * @returns {void}
   *
   * @example
   * ```typescript
   * context.setBuffer(new TextBuffer('New content'));
   * ```
   */
  setBuffer(buffer: TextBuffer): void {
    this.state.buffer = buffer;
  }

  /**
   * Get the current cursor position
   *
   * @returns {CursorPosition} The current cursor position
   *
   * @example
   * ```typescript
   * const cursor = context.getCursor();
   * console.log(`Line: ${cursor.line}, Col: ${cursor.column}`);
   * ```
   */
  getCursor(): CursorPosition {
    return this.state.cursor;
  }

  /**
   * Set a new cursor position
   *
   * @param position - The new cursor position
   * @returns {void}
   *
   * @example
   * ```typescript
   * context.setCursor(new CursorPosition(5, 10));
   * ```
   */
  setCursor(position: CursorPosition): void {
    this.state.cursor = position;
  }

  /**
   * Move cursor by delta
   *
   * @param deltaLine - Lines to move (positive = down, negative = up)
   * @param deltaColumn - Columns to move (positive = right, negative = left)
   * @returns {void}
   *
   * @example
   * ```typescript
   * // Move down 1 line, right 2 columns
   * context.moveCursor(1, 2);
   *
   * // Move up 2 lines
   * context.moveCursor(-2, 0);
   * ```
   */
  moveCursor(deltaLine: number, deltaColumn: number): void {
    const current = this.state.cursor;
    const newLine = Math.max(0, current.line + deltaLine);
    const newColumn = Math.max(0, current.column + deltaColumn);
    this.state.cursor = new CursorPosition(newLine, newColumn);
  }

  /**
   * Get the current mode
   *
   * @returns {VimMode} The current mode
   *
   * @example
   * ```typescript
   * const mode = context.getMode();
   * if (mode === 'NORMAL') {
   *   console.log('In normal mode');
   * }
   * ```
   */
  getMode(): VimMode {
    return this.state.mode;
  }

  /**
   * Set the current mode
   *
   * @param mode - The mode to set
   * @returns {void}
   *
   * @example
   * ```typescript
   * context.setMode('INSERT');
   * ```
   */
  setMode(mode: VimMode): void {
    this.state.mode = mode;
  }

  /**
   * Check if current mode matches
   *
   * @param mode - The mode to check
   * @returns {boolean} True if current mode matches
   *
   * @example
   * ```typescript
   * if (context.isMode('INSERT')) {
   *   // In insert mode
   * }
   * ```
   */
  isMode(mode: VimMode): boolean {
    return this.state.mode === mode;
  }

  /**
   * Get register content
   *
   * @param name - The register name (a-z, *, etc.)
   * @returns {string | null} The register content or null if empty
   *
   * @example
   * ```typescript
   * const content = context.getRegister('a');
   * ```
   */
  getRegister(name: string): string | null {
    return this.state.registers[name] ?? null;
  }

  /**
   * Set register content
   *
   * @param name - The register name
   * @param value - The content to store
   * @returns {void}
   *
   * @example
   * ```typescript
   * context.setRegister('a', 'stored text');
   * ```
   */
  setRegister(name: string, value: string): void {
    this.state.registers[name] = value;
  }

  /**
   * Yank text to register
   *
   * Convenience method for storing yanked/deleted text.
   *
   * @param name - The register name
   * @param text - The text to yank
   * @returns {void}
   *
   * @example
   * ```typescript
   * context.yankToRegister('a', 'yanked text');
   * ```
   */
  yankToRegister(name: string, text: string): void {
    this.state.registers[name] = text;
  }

  /**
   * Get clipboard content
   *
   * @returns {string} The clipboard content or empty string
   *
   * @example
   * ```typescript
   * const clipboard = context.getClipboard();
   * ```
   */
  getClipboard(): string {
    return this.getRegister('*') || '';
  }

  /**
   * Set clipboard content
   *
   * @param text - The text to set on clipboard
   * @returns {void}
   *
   * @example
   * ```typescript
   * context.setClipboard('text to copy');
   * ```
   */
  setClipboard(text: string): void {
    this.setRegister('*', text);
  }

  /**
   * Create a deep copy of this context
   *
   * @returns {ExecutionContextType} A new context with cloned state
   *
   * @example
   * ```typescript
   * const saved = context.clone();
   * // Modify context...
   * ```
   */
  clone(): ExecutionContextType {
    return new ExecutionContext(this.state.clone());
  }

  /**
   * Get the current line content
   *
   * @returns {string} The content of the current line
   *
   * @example
   * ```typescript
   * const line = context.getCurrentLine();
   * ```
   */
  getCurrentLine(): string {
    return this.state.buffer.getLine(this.state.cursor.line) || '';
  }

  /**
   * Get the current line number
   *
   * @returns {number} The current line index (0-based)
   *
   * @example
   * ```typescript
   * const lineNum = context.getLineNumber();
   * ```
   */
  getLineNumber(): number {
    return this.state.cursor.line;
  }

  /**
   * Get the current count for command repetition
   *
   * @returns {number} The current count (default 1 if not set)
   *
   * @example
   * ```typescript
   * const count = context.getCount();
   * ```
   */
  getCount(): number {
    return this.state.count || 1;
  }

  /**
   * Set the count for command repetition
   *
   * @param count - The count to set
   * @returns {void}
   *
   * @example
   * ```typescript
   * context.setCount(5);
   * ```
   */
  setCount(count: number): void {
    this.state.count = count;
  }
}
