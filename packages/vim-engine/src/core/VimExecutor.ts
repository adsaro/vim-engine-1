/**
 * VimExecutor - Main orchestrator for the vim command execution system
 *
 * The VimExecutor is the central entry point for the vim game system. It manages
 * the plugin registry, command routing, keystroke debouncing, and error handling.
 * It provides a unified interface for registering plugins, handling keyboard events,
 * and executing vim commands through the plugin system.
 *
 * @example
 * ```typescript
 * import { VimExecutor } from './core/VimExecutor';
 * import { VimPlugin } from './plugin/VimPlugin';
 *
 * // Create executor with default settings
 * const executor = new VimExecutor();
 *
 * // Initialize and start
 * executor.initialize();
 * executor.start();
 *
 * // Register a plugin
 * executor.registerPlugin(myPlugin);
 *
 * // Handle keyboard events
 * document.addEventListener('keydown', (event) => {
 *   executor.handleKeyboardEvent(event);
 * });
 *
 * // Get executor statistics
 * const stats = executor.getStats();
 * console.log(`Plugins: ${stats.pluginCount}, Keystrokes: ${stats.keystrokeCount}`);
 *
 * // Cleanup when done
 * executor.destroy();
 * ```
 *
 * @see CommandRouter For command routing logic
 * @see PluginRegistry For plugin management
 * @see DebounceManager For keystroke debouncing
 */
import { VimPlugin } from '../plugin/VimPlugin';
import { PluginRegistry } from '../plugin/PluginRegistry';
import { ExecutionContext } from '../plugin/ExecutionContext';
import { VimMode, VimState } from '../state';
import { CursorPosition } from '../state/CursorPosition';
import { TextBuffer } from '../state/TextBuffer';
import { CommandRouter } from './CommandRouter';
import { DebounceManager } from './DebounceManager';
import { ErrorHandler } from './ErrorHandler';
import { MODIFIER_KEYS } from '../config/keyboard';

/**
 * Default debounce time in milliseconds
 */
const DEFAULT_DEBOUNCE_MS = 100;

/**
 * Interface for VimExecutor dependencies
 *
 * Allows optional injection of dependencies for testing and customization.
 * All properties are optional - missing dependencies will be created with defaults.
 */
export interface VimExecutorDependencies {
  /** Optional PluginRegistry instance */
  pluginRegistry?: PluginRegistry;

  /** Optional CommandRouter instance */
  commandRouter?: CommandRouter;

  /** Optional DebounceManager instance */
  debounceManager?: DebounceManager;

  /** Optional ErrorHandler instance */
  errorHandler?: ErrorHandler;

  /** Optional ExecutionContext instance */
  executionContext?: ExecutionContext;
}

export class VimExecutor {
  private pluginRegistry: PluginRegistry;
  private commandRouter: CommandRouter;
  private debounceManager: DebounceManager;
  private errorHandler: ErrorHandler;
  private executionContext: ExecutionContext;
  private _isRunning: boolean = false;
  private keystrokeCount: number = 0;
  private keystrokeBuffer: string[] = [];

  /**
   * Create a new VimExecutor instance
   *
   * @param debounceMs - Optional debounce time in milliseconds for keystroke handling.
   *                    Defaults to 100ms if not specified.
   * @param dependencies - Optional dependencies for testing and customization.
   *                      Missing dependencies will be created with defaults.
   *
   * @example
   * ```typescript
   * // Using default debounce time (100ms)
   * const executor = new VimExecutor();
   *
   * // Using custom debounce time
   * const executorWithCustomDebounce = new VimExecutor(50);
   *
   * // Injecting dependencies for testing
   * const mockRegistry = new PluginRegistry();
   * const executor = new VimExecutor(100, { pluginRegistry: mockRegistry });
   * ```
   */
  constructor(debounceMs?: number, dependencies?: VimExecutorDependencies) {
    this.pluginRegistry = dependencies?.pluginRegistry ?? new PluginRegistry();
    this.commandRouter = dependencies?.commandRouter ?? new CommandRouter(this.pluginRegistry);
    this.debounceManager =
      dependencies?.debounceManager ?? new DebounceManager(debounceMs ?? DEFAULT_DEBOUNCE_MS);
    this.errorHandler = dependencies?.errorHandler ?? new ErrorHandler();
    this.executionContext = dependencies?.executionContext ?? new ExecutionContext();
  }

  /**
   * Initialize the executor
   *
   * This method prepares the executor for use. Currently a no-op as the executor
   * is ready to use immediately after construction, but may perform initialization
   * tasks in future versions.
   *
   * @returns {void}
   *
   * @example
   * ```typescript
   * const executor = new VimExecutor();
   * executor.initialize();
   * executor.start();
   * ```
   */
  initialize(): void {
    // No-op: ready to use
  }

  /**
   * Start the executor
   *
   * Marks the executor as running, allowing it to process keyboard events.
   * Call this method after initialization and plugin registration.
   *
   * @returns {void}
   *
   * @example
   * ```typescript
   * const executor = new VimExecutor();
   * executor.registerPlugin(myPlugin);
   * executor.start();
   * // Now handling keyboard events
   * ```
   */
  start(): void {
    this._isRunning = true;
  }

  /**
   * Stop the executor
   *
   * Marks the executor as stopped, preventing it from processing keyboard events.
   * Use start() to resume processing.
   *
   * @returns {void}
   *
   * @example
   * ```typescript
   * executor.start();
   * // ... handle events ...
   * executor.stop();
   * // Events no longer processed
   * ```
   */
  stop(): void {
    this._isRunning = false;
  }

  /**
   * Destroy the executor and clean up all resources
   *
   * This method performs cleanup by:
   * - Stopping the executor
   * - Resetting keystroke count
   * - Clearing keystroke buffer
   * - Resetting the count in execution context
   * - Destroying the error handler
   * - Destroying the debounce manager
   * - Clearing all registered plugins
   *
   * After calling this method, the executor should not be used.
   *
   * @returns {void}
   *
   * @example
   * ```typescript
   * executor.destroy();
   * console.log(executor.isRunning()); // false
   * ```
   */
  destroy(): void {
    this._isRunning = false;
    this.keystrokeCount = 0;

    // Clear keystroke buffer
    this.clearKeystrokeBuffer();

    // Reset the count in execution context
    this.executionContext.setCount(0);

    // Clean up all components in reverse order of initialization
    if (this.errorHandler) {
      this.errorHandler.destroy();
    }

    if (this.debounceManager) {
      this.debounceManager.destroy();
    }

    if (this.pluginRegistry) {
      this.pluginRegistry.clear();
    }
  }

  /**
   * Register a plugin with the executor
   *
   * Registers the plugin with the registry and registers all its command patterns
   * with the command router. If a plugin with the same name is already registered,
   * this call is ignored.
   *
   * @param plugin - The plugin to register. Must have a unique name and valid patterns.
   * @returns {void}
   *
   * @throws {Error} If the plugin is invalid or already registered
   *
   * @example
   * ```typescript
   * const myPlugin: VimPlugin = {
   *   name: 'movement',
   *   patterns: ['h', 'j', 'k', 'l'],
   *   execute: (ctx) => { /* ... *\/ }
   * };
   * executor.registerPlugin(myPlugin);
   * ```
   */
  registerPlugin(plugin: VimPlugin): void {
    if (!this.pluginRegistry.hasPlugin(plugin.name)) {
      this.pluginRegistry.register(plugin);

      // Register plugin patterns with command router
      for (const pattern of plugin.patterns) {
        this.commandRouter.registerPattern(pattern, plugin);
      }
    }
  }

  /**
   * Unregister a plugin by name
   *
   * Removes the plugin from the registry and clears all its patterns from
   * the command router.
   *
   * @param pluginName - The name of the plugin to unregister
   * @returns {void}
   *
   * @example
   * ```typescript
   * executor.unregisterPlugin('movement');
   * ```
   */
  unregisterPlugin(pluginName: string): void {
    this.pluginRegistry.unregister(pluginName);
  }

  /**
   * Get all registered plugins
   *
   * @returns {VimPlugin[]} Array of all registered plugins
   *
   * @example
   * ```typescript
   * const plugins = executor.getRegisteredPlugins();
   * console.log(`Registered ${plugins.length} plugins`);
   * ```
   */
  getRegisteredPlugins(): VimPlugin[] {
    return this.pluginRegistry.getAllPlugins();
  }

  /**
   * Get the current execution context
   *
   * The execution context contains the current vim state including mode,
   * cursor position, and text buffer.
   *
   * @returns {ExecutionContext} The current execution context
   *
   * @example
   * ```typescript
   * const context = executor.getExecutionContext();
   * const mode = context.getMode();
   * ```
   */
  getExecutionContext(): ExecutionContext {
    return this.executionContext;
  }

  /**
   * Get the current vim mode
   *
   * @returns {VimMode} The current mode (NORMAL, INSERT, VISUAL, etc.)
   *
   * @example
   * ```typescript
   * const mode = executor.getCurrentMode();
   * if (mode === VimMode.NORMAL) {
   *   console.log('In normal mode');
   * }
   * ```
   */
  getCurrentMode(): VimMode {
    return this.executionContext.getMode();
  }

  /**
   * Set the current vim mode
   *
   * Changes the current mode, which affects how keystrokes are interpreted.
   *
   * @param mode - The mode to set
   * @returns {void}
   *
   * @example
   * ```typescript
   * executor.setCurrentMode(VimMode.INSERT);
   * ```
   */
  setCurrentMode(mode: VimMode): void {
    this.executionContext.setMode(mode);
  }

  /**
   * Get the current vim state
   *
   * Returns the complete vim state including cursor position, text buffer,
   * and mode.
   *
   * @returns {VimState} The current vim state
   *
   * @example
   * ```typescript
   * const state = executor.getState();
   * console.log(`Line: ${state.cursor.row}, Col: ${state.cursor.col}`);
   * ```
   */
  getState(): VimState {
    return this.executionContext.getState();
  }

  /**
   * Handle a keyboard event
   *
   * Extracts the keystroke from the event and routes it to the appropriate
   * plugin for execution. Modifier keys (Ctrl, Alt, Shift) are handled
   * according to vim conventions.
   *
   * @param event - The keyboard event to handle
   * @returns {void}
   *
   * @example
   * ```typescript
   * document.addEventListener('keydown', (event) => {
   *   executor.handleKeyboardEvent(event);
   * });
   * ```
   */
  handleKeyboardEvent(event: KeyboardEvent): void {
    // Skip modifier-only key events (Control, Alt, Shift, Meta)
    if (MODIFIER_KEYS.includes(event.key)) {
      return;
    }
    // Process the keystroke
    const keystroke = this.extractKeystroke(event);
    this.handleKeystroke(keystroke);
  }

  /**
   * Handle a keystroke string
   *
   * Routes the keystroke to the appropriate plugin for execution.
   * Handles multi-key sequences by buffering keystrokes and checking
   * if they form a complete command.
   *
   * Also handles numeric prefixes for count-based commands (e.g., '10G' jumps to line 10).
   *
   * @param keystroke - The keystroke string to handle (e.g., 'h', '<Esc>', 'C-c')
   * @returns {void}
   *
   * @example
   * ```typescript
   * executor.handleKeystroke('h'); // Move left
   * executor.handleKeystroke('<Esc>'); // Return to normal mode
   * executor.handleKeystroke('g'); // Buffer 'g', waiting for next key
   * executor.handleKeystroke('e'); // Execute 'ge' command
   * executor.handleKeystroke('1'); // Buffer '1'
   * executor.handleKeystroke('0'); // Buffer '10'
   * executor.handleKeystroke('G'); // Execute '10G' command
   * ```
   */
  handleKeystroke(keystroke: string): void {
    this.keystrokeBuffer.push(keystroke);
    const bufferedKeystrokes = this.keystrokeBuffer.join('');

    // Try to match with numeric prefix first
    if (this.tryMatchNumericPrefix(bufferedKeystrokes)) {
      return;
    }

    // Try to match the full buffer without numeric prefix
    if (this.tryMatchFullBuffer(bufferedKeystrokes)) {
      return;
    }

    // No match - decide whether to keep buffering or clear
    this.handleNoMatch(bufferedKeystrokes, keystroke);
  }

  /**
   * Try to match keystrokes as a numeric prefix + command pattern
   *
   * @param bufferedKeystrokes - The buffered keystrokes to match
   * @returns {boolean} True if matched and executed, false otherwise
   */
  private tryMatchNumericPrefix(bufferedKeystrokes: string): boolean {
    // Skip if buffer is just digits - continue to normal matching
    if (this.isAllDigits(bufferedKeystrokes)) {
      return false;
    }

    const numericMatch = bufferedKeystrokes.match(/^(\d+)(.+)$/);
    if (!numericMatch) {
      return false;
    }

    const count = parseInt(numericMatch[1], 10);
    const command = numericMatch[2];

    this.executionContext.setCount(count);

    const matchedPlugin = this.commandRouter.matchPattern(command);
    if (matchedPlugin) {
      this.executeCommand(command);
      return true;
    }

    // Reset count since command didn't match
    this.executionContext.setCount(0);
    return false;
  }

  /**
   * Try to match the full buffer as a command pattern
   *
   * @param bufferedKeystrokes - The buffered keystrokes to match
   * @returns {boolean} True if matched and executed, false otherwise
   */
  private tryMatchFullBuffer(bufferedKeystrokes: string): boolean {
    const matchedPlugin = this.commandRouter.matchPattern(bufferedKeystrokes);

    if (matchedPlugin) {
      this.executeCommand(bufferedKeystrokes);
      return true;
    }

    return false;
  }

  /**
   * Handle the case when no pattern matched the buffered keystrokes
   *
   * @param bufferedKeystrokes - The buffered keystrokes that didn't match
   * @param lastKeystroke - The last keystroke that was added
   * @returns {void}
   */
  private handleNoMatch(bufferedKeystrokes: string, lastKeystroke: string): void {
    if (this.shouldKeepBuffering(bufferedKeystrokes)) {
      return;
    }

    // Try to execute just the last keystroke
    this.tryExecuteLastKeystroke(lastKeystroke);
    this.clearKeystrokeBuffer();
  }

  /**
   * Check if the buffer should continue waiting for more keystrokes
   *
   * @param bufferedKeystrokes - The buffered keystrokes to check
   * @returns {boolean} True if should keep buffering, false otherwise
   */
  private shouldKeepBuffering(bufferedKeystrokes: string): boolean {
    // Check if buffer could be a prefix of a valid command
    const couldBePrefix = this.commandRouter
      .getAllPatterns()
      .some((pattern) => pattern.startsWith(bufferedKeystrokes));

    // Keep buffering if it's a prefix, all digits, or has numeric prefix
    return (
      couldBePrefix ||
      this.isAllDigits(bufferedKeystrokes) ||
      this.hasNumericPrefix(bufferedKeystrokes)
    );
  }

  /**
   * Try to execute just the last keystroke
   *
   * @param keystroke - The keystroke to execute
   * @returns {void}
   */
  private tryExecuteLastKeystroke(keystroke: string): void {
    const matchedPlugin = this.commandRouter.matchPattern(keystroke);
    if (matchedPlugin) {
      this.executeCommand(keystroke);
    }
  }

  /**
   * Execute a command and reset state
   *
   * @param command - The command pattern to execute
   * @returns {void}
   */
  private executeCommand(command: string): void {
    // Set the current pattern in the execution context before executing
    this.executionContext.setCurrentPattern(command);
    this.commandRouter.executeSync(command, this.executionContext);
    this.keystrokeCount++;
    this.executionContext.setCount(0);
    this.clearKeystrokeBuffer();
  }

  /**
   * Check if a string consists only of digits
   *
   * @param str - The string to check
   * @returns {boolean} True if all digits, false otherwise
   */
  private isAllDigits(str: string): boolean {
    return /^\d+$/.test(str);
  }

  /**
   * Check if a string has a numeric prefix followed by other characters
   *
   * @param str - The string to check
   * @returns {boolean} True if has numeric prefix, false otherwise
   */
  private hasNumericPrefix(str: string): boolean {
    return /^\d+.+$/.test(str);
  }

  /**
   * Clear the keystroke buffer
   *
   * Removes all buffered keystrokes and cancels any pending timeout.
   *
   * @returns {void}
   *
   * @example
   * ```typescript
   * executor.clearKeystrokeBuffer();
   * ```
   */
  private clearKeystrokeBuffer(): void {
    this.keystrokeBuffer = [];
  }

  /**
   * Mapping of special keys to their vim representation
   */
  private static readonly SPECIAL_KEY_MAP: Record<string, string> = {
    Enter: '<Enter>',
    Escape: '<Esc>',
    Tab: '<Tab>',
    Backspace: '<BS>',
    Delete: '<Del>',
    ArrowUp: '<Up>',
    ArrowDown: '<Down>',
    ArrowLeft: '<Left>',
    ArrowRight: '<Right>',
  };

  /**
   * Extract keystroke string from keyboard event
   *
   * Converts a KeyboardEvent into a standardized keystroke string format.
   * Supports:
   * - Regular character keys
   * - Modifier combinations (C- for Ctrl, A- for Alt)
   * - Special keys (Enter, Escape, Tab, Backspace, Delete, Arrow keys)
   *
   * @param event - The keyboard event to process
   * @returns {string} The standardized keystroke string
   *
   * @example
   * ```typescript
   * // Regular key
   * extractKeystroke({ key: 'a', ctrlKey: false })); // 'a'
   * // With Ctrl modifier
   * extractKeystroke({ key: 'c', ctrlKey: true })); // 'C-c'
   * // Special key
   * extractKeystroke({ key: 'Enter', ctrlKey: false })); // '<Enter>'
   * ```
   */
  private extractKeystroke(event: KeyboardEvent): string {
    const key = event.key;

    if (key.length === 1) {
      return this.applyModifiers(key, event.ctrlKey, event.altKey, event.shiftKey);
    }

    return this.getSpecialKeyRepresentation(key);
  }

  /**
   * Apply modifier prefixes to a single character key
   *
   * @param key - The single character key
   * @param ctrlKey - Whether Ctrl is pressed
   * @param altKey - Whether Alt is pressed
   * @param shiftKey - Whether Shift is pressed
   * @returns {string} The key with appropriate modifiers
   */
  private applyModifiers(
    key: string,
    ctrlKey: boolean,
    altKey: boolean,
    shiftKey: boolean,
  ): string {
    let keystroke = key;

    if (shiftKey && key >= 'a' && key <= 'z') {
      keystroke = key.toUpperCase();
    }

    if (ctrlKey) {
      keystroke = `C-${keystroke}`;
    }

    if (altKey) {
      keystroke = `A-${keystroke}`;
    }

    return keystroke;
  }

  /**
   * Get vim representation of a special key
   *
   * @param key - The special key name
   * @returns {string} The vim representation, or the original key if not found
   */
  private getSpecialKeyRepresentation(key: string): string {
    return VimExecutor.SPECIAL_KEY_MAP[key] ?? key;
  }

  /**
   * Check if the executor is currently running
   *
   * @returns {boolean} True if the executor is running and processing events
   *
   * @example
   * ```typescript
   * executor.start();
   * console.log(executor.isRunning()); // true
   * executor.stop();
   * console.log(executor.isRunning()); // false
   * ```
   */
  isRunning(): boolean {
    return this._isRunning;
  }

  /**
   * Get the total number of keystrokes processed
   *
   * Returns the count of keystrokes that had matching plugin patterns.
   *
   * @returns {number} The keystroke count
   *
   * @example
   * ```typescript
   * executor.handleKeystroke('h');
   * executor.handleKeystroke('j');
   * console.log(executor.getKeystrokeCount()); // 2
   * ```
   */
  getKeystrokeCount(): number {
    return this.keystrokeCount;
  }

  /**
   * Get executor statistics
   *
   * Returns an object containing current statistics about the executor's
   * state and usage.
   *
   * @returns {Object} Statistics object containing:
   *   - pluginCount: Number of registered plugins
   *   - errorCount: Number of errors handled
   *   - keystrokeCount: Number of keystrokes processed
   *
   * @example
   * ```typescript
   * const stats = executor.getStats();
   * console.log(`Plugins: ${stats.pluginCount}, Errors: ${stats.errorCount}`);
   * ```
   */
  getStats(): { pluginCount: number; errorCount: number; keystrokeCount: number } {
    return {
      pluginCount: this.pluginRegistry.getPluginCount(),
      errorCount: this.errorHandler.getErrorCount(),
      keystrokeCount: this.keystrokeCount,
    };
  }

  /**
   * Start search mode - called when user presses /
   *
   * Transitions the editor to SEARCH mode and initializes the search pattern.
   * The frontend will handle collecting keystrokes and relaying them to addSearchCharacter.
   *
   * @returns {void}
   *
   * @example
   * ```typescript
   * executor.startSearchMode();
   * ```
   */
  startSearchMode(): void {
    this.executionContext.setMode('SEARCH');
    this.executionContext.getState().clearSearchPattern();
  }

  /**
   * Add a character to the current search pattern
   *
   * Called by frontend for each character typed during search mode.
   *
   * @param char - The character to add to the search pattern
   * @returns {void}
   *
   * @example
   * ```typescript
   * executor.addSearchCharacter('h');
   * executor.addSearchCharacter('e');
   * ```
   */
  addSearchCharacter(char: string): void {
    const currentPattern = this.executionContext.getState().getCurrentSearchPattern();
    this.executionContext.getState().setCurrentSearchPattern(currentPattern + char);
  }

  /**
   * Remove the last character from the search pattern
   *
   * Called when user presses Backspace during search mode.
   *
   * @returns {void}
   *
   * @example
   * ```typescript
   * executor.removeSearchCharacter();
   * ```
   */
  removeSearchCharacter(): void {
    const currentPattern = this.executionContext.getState().getCurrentSearchPattern();
    if (currentPattern.length > 0) {
      this.executionContext.getState().setCurrentSearchPattern(currentPattern.slice(0, -1));
    }
  }

  /**
   * Execute the search with the current pattern
   *
   * Searches for the pattern in the buffer starting from the current cursor position.
   * If found, moves cursor to the match. If not found, returns an error.
   *
   * @returns {Object} Search result
   *   - success: boolean - Whether the search found a match
   *   - line: number - Line of match (if success)
   *   - column: number - Column of match (if success)
   *   - error: string - Error message (if not success)
   *
   * @example
   * ```typescript
   * const result = executor.executeSearch();
   * if (result.success) {
   *   console.log(`Found at line ${result.line}, column ${result.column}`);
   * } else {
   *   console.error(result.error);
   * }
   * ```
   */
  executeSearch(): { success: boolean; line: number; column: number; error?: string } {
    const state = this.executionContext.getState();
    const pattern = state.getCurrentSearchPattern();
    const buffer = state.buffer;
    const cursor = state.cursor;

    // Search from current position (line, column + 1 to avoid current match)
    const match = this.findNextMatch(buffer, pattern, cursor.line, cursor.column);

    if (match) {
      // Save the pattern for future n/N commands
      state.setLastSearchPattern(pattern);
      state.addJump(cursor.clone());
      state.cursor = new CursorPosition(match.line, match.column);
      return { success: true, line: match.line, column: match.column };
    }

    // No match found
    return {
      success: false,
      line: -1,
      column: -1,
      error: `Pattern not found: ${pattern}`,
    };
  }

  /**
   * Exit search mode and return to normal mode
   *
   * Called after successful search execution.
   *
   * @returns {void}
   *
   * @example
   * ```typescript
   * executor.exitSearchMode();
   * ```
   */
  exitSearchMode(): void {
    this.executionContext.setMode('NORMAL');
    this.executionContext.getState().clearSearchPattern();
  }

  /**
   * Get the current search pattern
   *
   * @returns {string} The current search pattern being built
   *
   * @example
   * ```typescript
   * const pattern = executor.getCurrentSearchPattern();
   * ```
   */
  getCurrentSearchPattern(): string {
    return this.executionContext.getState().getCurrentSearchPattern();
  }

  /**
   * Cancel search and return to normal mode without executing
   *
   * Called when user presses Escape during search mode.
   *
   * @returns {void}
   *
   * @example
   * ```typescript
   * executor.cancelSearch();
   * ```
   */
  cancelSearch(): void {
    this.executionContext.setMode('NORMAL');
    this.executionContext.getState().clearSearchPattern();
  }

  /**
   * Find next occurrence of pattern in buffer
   *
   * @param buffer - The text buffer to search
   * @param pattern - The search pattern
   * @param startLine - Line to start searching from
   * @param startColumn - Column to start searching from
   * @returns Position of match or null if not found
   * @private
   */
  private findNextMatch(
    buffer: TextBuffer,
    pattern: string,
    startLine: number,
    startColumn: number,
  ): { line: number; column: number } | null {
    if (!pattern) return null;

    const lineCount = buffer.getLineCount();
    if (lineCount === 0) return null;

    // Search from current position to end of buffer
    for (let line = startLine; line < lineCount; line++) {
      const lineContent = buffer.getLine(line) || '';
      const searchStartColumn = line === startLine ? startColumn + 1 : 0;
      const searchText = lineContent.slice(searchStartColumn);

      const matchIndex = searchText.indexOf(pattern);
      if (matchIndex !== -1) {
        return { line, column: searchStartColumn + matchIndex };
      }
    }

    // Wrap around to beginning of buffer
    for (let line = 0; line < startLine; line++) {
      const lineContent = buffer.getLine(line) || '';
      const matchIndex = lineContent.indexOf(pattern);
      if (matchIndex !== -1) {
        return { line, column: matchIndex };
      }
    }

    return null;
  }
}
