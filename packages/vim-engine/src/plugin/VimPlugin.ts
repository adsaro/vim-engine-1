/**
 * VimPlugin interface - Contract for all vim plugin implementations
 *
 * This module defines the interface that all vim plugins must implement.
 * Plugins provide functionality for specific keystroke patterns and can
 * be registered with the plugin registry.
 *
 * @example
 * ```typescript
 * import { VimPlugin, ExecutionContextType } from './plugin/VimPlugin';
 * import { VimMode } from './state/VimMode';
 *
 * const myPlugin: VimPlugin = {
 *   name: 'movement',
 *   version: '1.0.0',
 *   description: 'Basic movement commands',
 *   patterns: ['h', 'j', 'k', 'l'],
 *   modes: ['NORMAL'],
 *
 *   initialize: (context) => {
 *     console.log('Plugin initialized');
 *   },
 *
 *   destroy: () => {
 *     console.log('Plugin destroyed');
 *   },
 *
 *   execute: (context) => {
 *     // Handle movement
 *   },
 *
 *   canExecute: (context) => {
 *     return context.getMode() === 'NORMAL';
 *   },
 *
 *   validatePattern: (pattern) => {
 *     return ['h', 'j', 'k', 'l'].includes(pattern);
 *   },
 *
 *   onRegister: () => {
 *     console.log('Plugin registered');
 *   },
 *
 *   onUnregister: () => {
 *     console.log('Plugin unregistered');
 *   },
 * };
 * ```
 *
 * @see AbstractVimPlugin For a base class implementation
 * @see PluginRegistry For plugin management
 */
import { VimMode, CursorPosition, TextBuffer, VimState } from '../state';

/**
 * ExecutionContext type for use in VimPlugin methods
 *
 * Provides a type-safe interface for plugins to interact with the
 * editor state and execution environment.
 */
export type ExecutionContextType = {
  /**
   * Get the current editor state
   * @returns The current state object
   */
  getState(): VimState;

  /**
   * Set a new state
   * @param state - The new state to set
   */
  setState(state: VimState): void;

  /**
   * Get the current buffer
   * @returns The current text buffer
   */
  getBuffer(): TextBuffer;

  /**
   * Set a new buffer
   * @param buffer - The new text buffer
   */
  setBuffer(buffer: TextBuffer): void;

  /**
   * Get the current cursor position
   * @returns The cursor position
   */
  getCursor(): CursorPosition;

  /**
   * Set a new cursor position
   * @param position - The new cursor position
   */
  setCursor(position: CursorPosition): void;

  /**
   * Move cursor by delta
   * @param deltaLine - Lines to move (positive = down, negative = up)
   * @param deltaColumn - Columns to move (positive = right, negative = left)
   */
  moveCursor(deltaLine: number, deltaColumn: number): void;

  /**
   * Get the current vim mode
   * @returns The current mode
   */
  getMode(): VimMode;

  /**
   * Set the current mode
   * @param mode - The mode to set
   */
  setMode(mode: VimMode): void;

  /**
   * Check if current mode matches a specific mode
   * @param mode - The mode to check
   * @returns True if current mode matches
   */
  isMode(mode: VimMode): boolean;

  /**
   * Get register content
   * @param name - The register name (a-z, *, etc.)
   * @returns The register content or null if empty
   */
  getRegister(name: string): string | null;

  /**
   * Set register content
   * @param name - The register name
   * @param value - The content to store
   */
  setRegister(name: string, value: string): void;

  /**
   * Yank text to register
   * @param name - The register name
   * @param text - The text to yank
   */
  yankToRegister(name: string, text: string): void;

  /**
   * Get clipboard content
   * @returns The clipboard content or empty string
   */
  getClipboard(): string;

  /**
   * Set clipboard content
   * @param text - The text to set on clipboard
   */
  setClipboard(text: string): void;

  /**
   * Get the current line content
   * @returns The content of the current line
   */
  getCurrentLine(): string;

  /**
   * Get the current line number
   * @returns The current line index (0-based)
   */
  getLineNumber(): number;

  /**
   * Get the current count for command repetition
   * @returns The current count (default 1 if not set)
   */
  getCount(): number;

  /**
   * Set the count for command repetition
   * @param count - The count to set
   */
  setCount(count: number): void;

  /**
   * Create a deep copy of this context
   * @returns A new context with cloned state
   */
  clone(): ExecutionContextType;
};

/**
 * PluginRegistry type for use in VimPlugin hooks
 *
 * Provides a minimal interface for plugins to interact with the
 * plugin registry during their lifecycle.
 */
export type PluginRegistryType = {
  /**
   * Check if a plugin is registered
   * @param pluginName - The plugin name to check
   * @returns True if the plugin exists
   */
  hasPlugin(pluginName: string): boolean;

  /**
   * Get a plugin by name
   * @param pluginName - The plugin name to retrieve
   * @returns The plugin or null if not found
   */
  getPlugin(pluginName: string): VimPlugin | null;

  /**
   * Get the number of registered plugins
   * @returns The plugin count
   */
  getPluginCount(): number;
};

/**
 * VimPlugin interface - Contract for all plugins
 *
 * All vim plugins must implement this interface. It defines:
 * - Metadata (name, version, description, patterns, modes)
 * - Lifecycle methods (initialize, destroy)
 * - Execution methods (execute, canExecute, validatePattern)
 * - Lifecycle hooks (onRegister, onUnregister)
 */
export interface VimPlugin {
  //
  // Metadata
  //

  /**
   * Unique plugin name
   */
  readonly name: string;

  /**
   * Plugin version string (semver recommended)
   */
  readonly version: string;

  /**
   * Brief description of plugin functionality
   */
  readonly description: string;

  /**
   * Keystroke patterns this plugin handles
   */
  readonly patterns: string[];

  /**
   * Vim modes this plugin is active in
   */
  readonly modes: VimMode[];

  //
  // Lifecycle
  //

  /**
   * Initialize the plugin with an execution context
   *
   * Called once when the plugin is first registered.
   *
   * @param context - The execution context
   */
  initialize(context: ExecutionContextType): void;

  /**
   * Destroy the plugin and release resources
   *
   * Called when the plugin is unregistered or the editor closes.
   */
  destroy(): void;

  //
  // Execution
  //

  /**
   * Execute the plugin action
   *
   * Called when a matching keystroke pattern is received.
   *
   * @param context - The execution context
   */
  execute(context: ExecutionContextType): void;

  /**
   * Check if the plugin can execute in the current context
   *
   * Used to determine if execute() should be called.
   *
   * @param context - The execution context
   * @returns True if the plugin can execute
   */
  canExecute(context: ExecutionContextType): boolean;

  /**
   * Validate if a pattern is supported by this plugin
   *
   * @param pattern - The keystroke pattern to validate
   * @returns True if the pattern is supported
   */
  validatePattern(pattern: string): boolean;

  //
  // Hooks
  //

  /**
   * Called when the plugin is registered
   *
   * Use this hook for initialization that requires the registry.
   */
  onRegister(): void;

  /**
   * Called when the plugin is unregistered
   *
   * Use this hook for cleanup before removal.
   */
  onUnregister(): void;

  //
  // Enable/Disable
  //

  /**
   * Enable the plugin
   *
   * Called to enable the plugin after it has been disabled.
   * The plugin will be able to execute when enabled.
   */
  enable(): void;

  /**
   * Disable the plugin
   *
   * Called to disable the plugin. When disabled, the plugin
   * will not execute even if canExecute returns true.
   */
  disable(): void;

  /**
   * Check if plugin is enabled
   *
   * @returns True if the plugin is enabled and can execute
   */
  isEnabled(): boolean;
}
