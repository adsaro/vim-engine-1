/**
 * CommandRouter - Routes keystroke commands to appropriate plugins based on patterns
 *
 * The CommandRouter is responsible for routing keystroke commands to the appropriate
 * plugins. It maintains a mapping of keystroke patterns to plugins and provides
 * both synchronous and asynchronous execution methods.
 *
 * Patterns can be:
 * - Single characters (e.g., 'h', 'j', 'k', 'l')
 * - Multi-character sequences (e.g., 'gg', 'dd', 'yy')
 * - Special keys (e.g., '<Esc>', '<Enter>')
 *
 * @example
 * ```typescript
 * import { CommandRouter } from './core/CommandRouter';
 * import { PluginRegistry } from './plugin/PluginRegistry';
 * import { VimPlugin } from './plugin/VimPlugin';
 *
 * const router = new CommandRouter();
 *
 * const movementPlugin: VimPlugin = {
 *   name: 'movement',
 *   patterns: ['h', 'j', 'k', 'l'],
 *   execute: (ctx) => { /* ... *\/ }
 * };
 *
 * // Register patterns
 * router.registerPattern('h', movementPlugin);
 * router.registerPattern('j', movementPlugin);
 *
 * // Execute commands
 * const plugin = router.matchPattern('h');
 * if (plugin) {
 *   plugin.execute(context);
 * }
 * ```
 *
 * @see VimPlugin For plugin interface
 * @see PluginRegistry For plugin management
 */
import { VimPlugin } from '../plugin/VimPlugin';
import { PluginRegistry } from '../plugin/PluginRegistry';
import { ExecutionContext } from '../plugin/ExecutionContext';

export class CommandRouter {
  private pluginRegistry: PluginRegistry | null = null;
  private patternToPlugin: Map<string, VimPlugin> = new Map();

  /**
   * Create a new CommandRouter instance
   *
   * @param pluginRegistry - Optional plugin registry to associate with this router
   *
   * @example
   * ```typescript
   * // Create without registry
   * const router = new CommandRouter();
   *
   * // Create with registry
   * const registry = new PluginRegistry();
   * const routerWithRegistry = new CommandRouter(registry);
   * ```
   */
  constructor(pluginRegistry?: PluginRegistry) {
    this.pluginRegistry = pluginRegistry ?? null;
  }

  /**
   * Set the plugin registry
   *
   * Associates a plugin registry with this router for enhanced plugin lookup.
   *
   * @param registry - The plugin registry to set
   * @returns {void}
   *
   * @example
   * ```typescript
   * const router = new CommandRouter();
   * router.setPluginRegistry(myRegistry);
   * ```
   */
  setPluginRegistry(registry: PluginRegistry): void {
    this.pluginRegistry = registry;
  }

  /**
   * Get the plugin registry
   *
   * @returns {PluginRegistry | null} The associated plugin registry, or null if not set
   *
   * @example
   * ```typescript
   * const registry = router.getPluginRegistry();
   * if (registry) {
   *   // Use registry
   * }
   * ```
   */
  getPluginRegistry(): PluginRegistry | null {
    return this.pluginRegistry;
  }

  /**
   * Register a pattern with a plugin
   *
   * Maps a keystroke pattern to a plugin for command routing.
   *
   * @param pattern - The keystroke pattern (e.g., 'h', 'gg', '<Esc>')
   * @param plugin - The plugin to associate with the pattern
   * @returns {void}
   *
   * @throws {Error} If plugin is null or undefined
   *
   * @example
   * ```typescript
   * router.registerPattern('h', movementPlugin);
   * router.registerPattern('j', movementPlugin);
   * ```
   */
  registerPattern(pattern: string, plugin: VimPlugin): void {
    if (!plugin) {
      throw new Error('Plugin is required to register a pattern');
    }
    this.patternToPlugin.set(pattern, plugin);
  }

  /**
   * Unregister a pattern
   *
   * Removes a pattern-to-plugin mapping.
   *
   * @param pattern - The pattern to unregister
   * @returns {void}
   *
   * @example
   * ```typescript
   * router.unregisterPattern('h');
   * ```
   */
  unregisterPattern(pattern: string): void {
    this.patternToPlugin.delete(pattern);
  }

  /**
   * Check if a pattern is registered
   *
   * @param pattern - The pattern to check
   * @returns {boolean} True if the pattern is registered
   *
   * @example
   * ```typescript
   * if (router.hasPattern('h')) {
   *   // Pattern exists
   * }
   * ```
   */
  hasPattern(pattern: string): boolean {
    return this.patternToPlugin.has(pattern);
  }

  /**
   * Match a pattern and return the associated plugin
   *
   * Checks for exact pattern match first, then falls back to prefix matching
   * for partial keystroke sequences (useful for motion commands).
   *
   * @param keystrokes - The keystroke string to match
   * @returns {VimPlugin | null} The matching plugin, or null if no match
   *
   * @example
   * ```typescript
   * // Exact match
   * const plugin1 = router.matchPattern('h');
   *
   * // Prefix match (e.g., 'gg' matches pattern 'g')
   * const plugin2 = router.matchPattern('gg');
   * ```
   */
  matchPattern(keystrokes: string): VimPlugin | null {
    // Check direct pattern match
    if (this.patternToPlugin.has(keystrokes)) {
      return this.patternToPlugin.get(keystrokes) ?? null;
    }

    // Check if keystrokes match any registered pattern prefix
    for (const [pattern, plugin] of this.patternToPlugin) {
      if (keystrokes.startsWith(pattern)) {
        return plugin;
      }
    }

    return null;
  }

  /**
   * Find the matching plugin for given keystrokes
   *
   * An alias for matchPattern for clearer semantics.
   *
   * @param keystrokes - The keystroke string to match
   * @returns {VimPlugin | null} The matching plugin, or null if no match
   *
   * @example
   * ```typescript
   * const plugin = router.findMatchingPlugin('h');
   * if (plugin) {
   *   plugin.execute(context);
   * }
   * ```
   */
  findMatchingPlugin(keystrokes: string): VimPlugin | null {
    return this.matchPattern(keystrokes);
  }

  /**
   * Execute a command asynchronously
   *
   * Finds the matching plugin and executes it asynchronously.
   *
   * @param keystrokes - The keystroke string to execute
   * @param context - The execution context
   * @returns {Promise<void>} Promise that resolves when execution completes
   *
   * @example
   * ```typescript
   * await router.execute('gg', executionContext);
   * ```
   */
  async execute(keystrokes: string, context: ExecutionContext): Promise<void> {
    const plugin = this.matchPattern(keystrokes);

    if (plugin) {
      plugin.execute(context);
    }
  }

  /**
   * Execute a command synchronously
   *
   * Finds the matching plugin and executes it synchronously.
   * This is the preferred method for real-time keystroke handling.
   *
   * @param keystrokes - The keystroke string to execute
   * @param context - The execution context
   * @returns {void}
   *
   * @example
   * ```typescript
   * router.executeSync('h', executionContext);
   * ```
   */
  executeSync(keystrokes: string, context: ExecutionContext): void {
    const plugin = this.matchPattern(keystrokes);

    if (plugin) {
      plugin.execute(context);
    }
  }

  /**
   * Get all registered patterns
   *
   * @returns {string[]} Array of all registered patterns
   *
   * @example
   * ```typescript
   * const patterns = router.getAllPatterns();
   * console.log('Registered patterns:', patterns);
   * ```
   */
  getAllPatterns(): string[] {
    return Array.from(this.patternToPlugin.keys());
  }

  /**
   * Get the plugin for a specific pattern
   *
   * @param pattern - The pattern to look up
   * @returns {VimPlugin | null} The associated plugin, or null if not found
   *
   * @example
   * ```typescript
   * const plugin = router.getPluginForPattern('h');
   * ```
   */
  getPluginForPattern(pattern: string): VimPlugin | null {
    return this.patternToPlugin.get(pattern) ?? null;
  }

  /**
   * Clear all registered patterns
   *
   * Removes all pattern-to-plugin mappings and dissociates the plugin registry.
   *
   * @returns {void}
   *
   * @example
   * ```typescript
   * router.clear();
   * ```
   */
  clear(): void {
    this.patternToPlugin.clear();
    this.pluginRegistry = null;
  }
}
