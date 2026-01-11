/**
 * AbstractVimPlugin - Base class for all vim plugins
 *
 * This abstract class provides a foundation for implementing vim plugins.
 * It implements the VimPlugin interface and provides default implementations
 * for common plugin functionality, allowing subclasses to focus on their
 * specific behavior.
 *
 * @example
 * ```typescript
 * import { AbstractVimPlugin } from './plugin/AbstractVimPlugin';
 * import { VimMode } from './state/VimMode';
 * import { ExecutionContext } from './plugin/ExecutionContext';
 *
 * class MovementPlugin extends AbstractVimPlugin {
 *   constructor() {
 *     super(
 *       'movement',
 *       'Basic movement commands',
 *       ['h', 'j', 'k', 'l'],
 *       [VimMode.NORMAL]
 *     );
 *   }
 *
 *   protected performAction(context: ExecutionContextType): void {
 *     const cursor = context.getCursor();
 *     // Handle movement based on pattern
 *   }
 * }
 * ```
 *
 * @see VimPlugin For the interface this class implements
 * @see ExecutionContext For the execution context provided to plugins
 */
import { VimPlugin, ExecutionContextType } from './VimPlugin';
import { VimMode } from '../state/VimMode';

/**
 * AbstractVimPlugin - Base class implementing VimPlugin interface
 *
 * Provides:
 * - Default implementations for all VimPlugin methods
 * - Protected hooks for lifecycle events (onInitialize, onDestroy)
 * - Context validation and mode checking utilities
 * - Pattern validation
 */
export abstract class AbstractVimPlugin implements VimPlugin {
  /**
   * Unique plugin name
   */
  readonly name: string;

  /**
   * Plugin version (default: '1.0.0')
   */
  readonly version: string = '1.0.0';

  /**
   * Plugin description
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

  /**
   * The execution context (set during initialize)
   */
  protected context: ExecutionContextType | null = null;

  /**
   * Plugin enabled state (default: true)
   */
  private _enabled: boolean = true;

  /**
   * Create a new plugin
   *
   * @param name - Unique plugin name
   * @param description - Brief description
   * @param patterns - Keystroke patterns this plugin handles
   * @param modes - Vim modes this plugin is active in
   *
   * @example
   * ```typescript
   * class MyPlugin extends AbstractVimPlugin {
   *   constructor() {
   *     super('my-plugin', 'My plugin', ['gg', 'G'], ['NORMAL']);
   *   }
   * }
   * ```
   */
  constructor(name: string, description: string, patterns: string[], modes: VimMode[]) {
    this.name = name;
    this.description = description;
    this.patterns = patterns;
    this.modes = modes;
  }

  /**
   * Initialize the plugin with a context
   *
   * Sets the context, calls onInitialize, and performs initial action
   * if the current mode is supported.
   *
   * @param context - The execution context
   * @returns {void}
   */
  initialize(context: ExecutionContextType): void {
    this.context = context;
    this.onInitialize();

    // Execute if in supported mode
    if (this.isInSupportedMode(context)) {
      this.performAction(context);
    }
  }

  /**
   * Destroy the plugin
   *
   * Calls onDestroy and clears the context.
   *
   * @returns {void}
   */
  destroy(): void {
    this.onDestroy();
    this.context = null;
  }

  /**
   * Execute the plugin action
   *
   * Validates the context and mode, then performs the action.
   *
   * @param context - The execution context
   * @returns {void}
   */
  execute(context: ExecutionContextType): void {
    if (this.isValidContext(context) && this.isInSupportedMode(context)) {
      this.performAction(context);
    }
  }

  /**
   * Check if the plugin can execute in the given context
   *
   * Returns true only if the plugin is enabled AND the current
   * mode is supported.
   *
   * @param context - The execution context
   * @returns {boolean} True if the plugin can execute
   */
  canExecute(context: ExecutionContextType): boolean {
    return this._enabled && this.isInSupportedMode(context);
  }

  /**
   * Validate if a pattern is supported by this plugin
   *
   * @param pattern - The keystroke pattern to validate
   * @returns {boolean} True if the pattern is in the patterns array
   */
  validatePattern(pattern: string): boolean {
    return this.patterns.includes(pattern);
  }

  /**
   * Called when the plugin is registered
   *
   * Override in subclass for custom registration logic.
   *
   * @returns {void}
   */
  onRegister(): void {
    // Override in subclass if needed
  }

  /**
   * Called when the plugin is unregistered
   *
   * Override in subclass for custom cleanup logic.
   *
   * @returns {void}
   */
  onUnregister(): void {
    // Override in subclass if needed
  }

  /**
   * Enable the plugin
   *
   * Sets the enabled state to true and calls onEnable hook.
   *
   * @returns {void}
   */
  enable(): void {
    this._enabled = true;
    this.onEnable();
  }

  /**
   * Disable the plugin
   *
   * Sets the enabled state to false and calls onDisable hook.
   *
   * @returns {void}
   */
  disable(): void {
    this._enabled = false;
    this.onDisable();
  }

  /**
   * Check if plugin is enabled
   *
   * @returns {boolean} True if the plugin is enabled
   */
  isEnabled(): boolean {
    return this._enabled;
  }

  /**
   * Called when the plugin is enabled
   *
   * Override in subclass for custom enable logic.
   *
   * @returns {void}
   */
  protected onEnable(): void {
    // Override in subclass if needed
  }

  /**
   * Called when the plugin is disabled
   *
   * Override in subclass for custom disable logic.
   *
   * @returns {void}
   */
  protected onDisable(): void {
    // Override in subclass if needed
  }

  /**
   * Called when the plugin is initialized
   *
   * Override in subclass for custom initialization logic.
   *
   * @returns {void}
   */
  protected onInitialize(): void {
    // Override in subclass if needed
  }

  /**
   * Called when the plugin is destroyed
   *
   * Override in subclass for custom cleanup logic.
   *
   * @returns {void}
   */
  protected onDestroy(): void {
    // Override in subclass if needed
  }

  /**
   * Perform the plugin action - override in subclass
   *
   * This is the main method to override in subclasses to implement
   * the plugin's specific behavior.
   *
   * @param _context - The execution context
   * @returns {void}
   *
   * @example
   * ```typescript
   * protected performAction(context: ExecutionContextType): void {
   *   const cursor = context.getCursor();
   *   cursor.moveDown();
   * }
   * ```
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected performAction(_context: ExecutionContextType): void {
    // Override in subclass to implement plugin behavior
    // Base implementation does nothing
  }

  /**
   * Check if the context is valid - override in subclass
   *
   * Override to add custom context validation.
   *
   * @param context - The execution context
   * @returns {boolean} True if the context is valid
   */
  protected isValidContext(context: ExecutionContextType): boolean {
    return context.getState() !== null;
  }

  /**
   * Check if the current mode is supported - override in subclass
   *
   * Override to add custom mode checking logic.
   *
   * @param context - The execution context
   * @returns {boolean} True if the mode is supported
   */
  protected isInSupportedMode(context: ExecutionContextType): boolean {
    return this.modes.includes(context.getMode());
  }
}
