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
    // Add keystroke to buffer
    this.keystrokeBuffer.push(keystroke);

    // Check if the buffered keystrokes form a complete command
    const bufferedKeystrokes = this.keystrokeBuffer.join('');

    // Try to parse numeric prefix (e.g., '10G' -> count=10, command='G')
    // First check if the entire buffer is just digits - if so, keep buffering
    if (/^\d+$/.test(bufferedKeystrokes)) {
      // Entire buffer is just digits - keep buffering
      // Continue to normal matching
    } else {
      // Buffer is not just digits - try to match as numeric prefix + command
      const numericMatch = bufferedKeystrokes.match(/^(\d+)(.+)$/);

      if (numericMatch) {
        const count = parseInt(numericMatch[1], 10);
        const command = numericMatch[2];

        // Set the count in the execution context
        this.executionContext.setCount(count);

        // Try to match the command without the numeric prefix
        const matchedPlugin = this.commandRouter.matchPattern(command);
        if (matchedPlugin) {
          // We have a match - execute the command with count
          this.commandRouter.executeSync(command, this.executionContext);
          this.keystrokeCount++;
          // Reset the count after executing the command
          this.executionContext.setCount(0);
          this.clearKeystrokeBuffer();
          return;
        } else {
          // Command part is not a valid pattern - keep buffering
          // Don't clear the buffer, continue to normal matching
        }
      }
    }

    // No numeric prefix or no match with numeric prefix - try normal matching
    const matchedPlugin = this.commandRouter.matchPattern(bufferedKeystrokes);

    if (matchedPlugin) {
      // We have a match - execute the command
      this.commandRouter.executeSync(bufferedKeystrokes, this.executionContext);
      this.keystrokeCount++;
      // Reset the count after executing the command
      this.executionContext.setCount(0);
      this.clearKeystrokeBuffer();
    } else {
      // Check if the buffered keystrokes could be a prefix of a valid command
      const couldBePrefix = this.commandRouter
        .getAllPatterns()
        .some((pattern) => pattern.startsWith(bufferedKeystrokes));

      // Also keep buffering if the keystrokes are all digits (numeric prefix)
      const isNumericPrefix = /^\d+$/.test(bufferedKeystrokes);

      // Also keep buffering if we have a numeric prefix (e.g., '5g' waiting for 'gg')
      const hasNumericPrefixPattern = /^\d+.+$/.test(bufferedKeystrokes);

      if (!couldBePrefix && !isNumericPrefix && !hasNumericPrefixPattern) {
        // Not a valid prefix and not numeric - try executing just the last keystroke
        const lastKeystrokeMatch = this.commandRouter.matchPattern(keystroke);
        if (lastKeystrokeMatch) {
          this.commandRouter.executeSync(keystroke, this.executionContext);
          this.keystrokeCount++;
          // Reset the count after executing the command
          this.executionContext.setCount(0);
        }
        this.clearKeystrokeBuffer();
      }
      // Otherwise, keep buffering and wait for more keystrokes
    }
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
      let keystroke = key;

      if (event.ctrlKey) {
        keystroke = `C-${keystroke}`;
      }
      if (event.altKey) {
        keystroke = `A-${keystroke}`;
      }
      if (event.shiftKey && key >= 'a' && key <= 'z') {
        keystroke = key.toUpperCase();
      }

      return keystroke;
    }

    // Handle special keys
    if (key === 'Enter') return '<Enter>';
    if (key === 'Escape') return '<Esc>';
    if (key === 'Tab') return '<Tab>';
    if (key === 'Backspace') return '<BS>';
    if (key === 'Delete') return '<Del>';
    if (key === 'ArrowUp') return '<Up>';
    if (key === 'ArrowDown') return '<Down>';
    if (key === 'ArrowLeft') return '<Left>';
    if (key === 'ArrowRight') return '<Right>';

    return key;
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
}
