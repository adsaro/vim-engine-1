/**
 * HistoryState - Historical data with size limits
 *
 * Manages vim history data including:
 * - Registers (clipboard-like storage)
 * - Mark positions (named cursor positions)
 * - Jump list (navigation history)
 * - Change list (modification history)
 * - Search and command history
 *
 * All history types have configurable size limits to prevent unbounded memory growth.
 */
import { CursorPosition } from '../CursorPosition';

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
 * Configuration for history size limits
 */
export const HISTORY_CONFIG = {
  /** Maximum number of registers to store */
  MAX_SIZE: 50,
  /** Maximum number of search history entries */
  MAX_SEARCH_HISTORY: 20,
  /** Maximum number of command history entries */
  MAX_COMMAND_HISTORY: 50,
  /** Maximum number of jump list entries */
  MAX_JUMP_LIST: 100,
  /** Maximum number of change list entries */
  MAX_CHANGE_LIST: 100,
};

/**
 * Options for HistoryState constructor
 */
export interface HistoryStateOptions {
  /** Maximum number of registers to store */
  maxSize?: number;
  /** Maximum number of search history entries */
  maxSearchHistory?: number;
  /** Maximum number of command history entries */
  maxCommandHistory?: number;
  /** Maximum number of jump list entries */
  maxJumpList?: number;
  /** Maximum number of change list entries */
  maxChangeList?: number;
}

/**
 * HistoryState - Historical data with size limits
 *
 * @example
 * ```typescript
 * import { HistoryState, HISTORY_CONFIG } from './history/HistoryState';
 *
 * // Create with default limits
 * const history = new HistoryState();
 *
 * // Add to jump list (max 100 by default)
 * history.addToJumpList(new CursorPosition(5, 10));
 *
 * // Add to search history (max 20 by default)
 * history.addToSearchHistory('pattern');
 *
 * // Add to command history (max 50 by default)
 * history.addToCommandHistory(':w');
 *
 * // Set register with automatic cleanup
 * history.setRegister('a', 'clipboard content');
 * ```
 */
export class HistoryState {
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
   * Maximum number of registers to store
   */
  private readonly maxSize: number;

  /**
   * Maximum number of search history entries
   */
  private readonly maxSearchHistory: number;

  /**
   * Maximum number of command history entries
   */
  private readonly maxCommandHistory: number;

  /**
   * Maximum number of jump list entries
   */
  private readonly maxJumpList: number;

  /**
   * Maximum number of change list entries
   */
  private readonly maxChangeList: number;

  /**
   * Create a new HistoryState
   *
   * @param options - Optional configuration for size limits
   *
   * @example
   * ```typescript
   * // Default limits
   * const history = new HistoryState();
   *
   * // Custom limits
   * const custom = new HistoryState({
   *   maxSize: 25,
   *   maxSearchHistory: 10,
   *   maxCommandHistory: 30,
   *   maxJumpList: 50,
   *   maxChangeList: 50,
   * });
   * ```
   */
  constructor(options?: HistoryStateOptions) {
    this.maxSize = options?.maxSize ?? HISTORY_CONFIG.MAX_SIZE;
    this.maxSearchHistory = options?.maxSearchHistory ?? HISTORY_CONFIG.MAX_SEARCH_HISTORY;
    this.maxCommandHistory = options?.maxCommandHistory ?? HISTORY_CONFIG.MAX_COMMAND_HISTORY;
    this.maxJumpList = options?.maxJumpList ?? HISTORY_CONFIG.MAX_JUMP_LIST;
    this.maxChangeList = options?.maxChangeList ?? HISTORY_CONFIG.MAX_CHANGE_LIST;

    // Initialize with defaults
    this.registers = {};
    this.markPositions = {};
    this.jumpList = [];
    this.changeList = [];
    this.searchHistory = [];
    this.commandHistory = [];
  }

  /**
   * Add a position to the jump list
   *
   * Records the position for Ctrl-O/Ctrl-I navigation.
   * Removes oldest entry if limit exceeded.
   *
   * @param position - The cursor position to add (will be cloned)
   *
   * @example
   * ```typescript
   * history.addToJumpList(new CursorPosition(5, 10));
   * ```
   */
  addToJumpList(position: CursorPosition): void {
    this.jumpList.push(position.clone());
    if (this.jumpList.length > this.maxJumpList) {
      this.jumpList.shift();
    }
  }

  /**
   * Add a position to the change list
   *
   * Records the position after a change for . repeat functionality.
   * Removes oldest entry if limit exceeded.
   *
   * @param position - The cursor position to add (will be cloned)
   *
   * @example
   * ```typescript
   * history.addToChangeList(new CursorPosition(5, 10));
   * ```
   */
  addToChangeList(position: CursorPosition): void {
    this.changeList.push(position.clone());
    if (this.changeList.length > this.maxChangeList) {
      this.changeList.shift();
    }
  }

  /**
   * Add a search term to history
   *
   * @param query - The search term to record
   *
   * @example
   * ```typescript
   * history.addToSearchHistory('pattern');
   * ```
   */
  addToSearchHistory(query: string): void {
    this.searchHistory.push(query);
    if (this.searchHistory.length > this.maxSearchHistory) {
      this.searchHistory.shift();
    }
  }

  /**
   * Add a command to history
   *
   * @param command - The command string to record
   *
   * @example
   * ```typescript
   * history.addToCommandHistory(':w');
   * ```
   */
  addToCommandHistory(command: string): void {
    this.commandHistory.push(command);
    if (this.commandHistory.length > this.maxCommandHistory) {
      this.commandHistory.shift();
    }
  }

  /**
   * Set register content
   *
   * @param key - The register name (e.g., 'a', '"', '+')
   * @param content - The content to store
   *
   * @example
   * ```typescript
   * history.setRegister('a', 'clipboard content');
   * ```
   */
  setRegister(key: string, content: string): void {
    this.registers[key] = content;
    this.cleanupRegistersIfNeeded();
  }

  /**
   * Get register content
   *
   * @param key - The register name
   * @returns The register content or undefined if not set
   *
   * @example
   * ```typescript
   * const content = history.getRegister('a');
   * ```
   */
  getRegister(key: string): string | undefined {
    return this.registers[key];
  }

  /**
   * Clean up registers if the count exceeds max size
   *
   * Removes oldest registers (first in object key order).
   */
  private cleanupRegistersIfNeeded(): void {
    const keys = Object.keys(this.registers);
    if (keys.length > this.maxSize) {
      // Remove oldest registers (first in object is typically oldest)
      const toRemove = keys.slice(0, keys.length - this.maxSize);
      toRemove.forEach(key => delete this.registers[key]);
    }
  }

  /**
   * Create a deep copy of this history state
   *
   * @returns A new HistoryState with copied content
   *
   * @example
   * ```typescript
   * const cloned = history.clone();
   * ```
   */
  clone(): HistoryState {
    const cloned = new HistoryState({
      maxSize: this.maxSize,
      maxSearchHistory: this.maxSearchHistory,
      maxCommandHistory: this.maxCommandHistory,
      maxJumpList: this.maxJumpList,
      maxChangeList: this.maxChangeList,
    });

    // Copy registers
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

    return cloned;
  }

  /**
   * Reset history state to initial values
   *
   * Clears all history data.
   *
   * @example
   * ```typescript
   * history.reset();
   * ```
   */
  reset(): void {
    this.registers = {};
    this.markPositions = {};
    this.jumpList = [];
    this.changeList = [];
    this.searchHistory = [];
    this.commandHistory = [];
  }
}
