/**
 * PluginRegistry - Manages plugin registration and lookup
 *
 * The PluginRegistry handles plugin lifecycle management including registration,
 * unregistration, pattern mapping, and validation. It maintains both a plugin
 * registry and a pattern-to-plugin mapping for efficient lookup.
 *
 * @example
 * ```typescript
 * import { PluginRegistry } from './plugin/PluginRegistry';
 * import { VimPlugin } from './plugin/VimPlugin';
 *
 * const registry = new PluginRegistry();
 *
 * // Register a plugin
 * registry.register(myPlugin);
 *
 * // Check if registered
 * if (registry.hasPlugin('movement')) {
 *   const plugin = registry.getPlugin('movement');
 * }
 *
 * // Get plugin by pattern
 * const plugin = registry.getPluginByPattern('h');
 *
 * // Validate a plugin
 * const validation = registry.validatePlugin(newPlugin);
 * if (!validation.valid) {
 *   console.error(validation.errors);
 * }
 *
 * // Unregister
 * registry.unregister('movement');
 *
 * // Clear all
 * registry.clear();
 * ```
 */
import { VimPlugin } from './VimPlugin';

/**
 * PluginRegistry - Manages plugin registration, lookup, and lifecycle
 */
export class PluginRegistry {
  private plugins: Map<string, VimPlugin> = new Map();
  private patternToPlugin: Map<string, string> = new Map();

  /**
   * Register a plugin
   *
   * Adds the plugin to the registry and registers all its patterns.
   * Calls the plugin's onRegister hook.
   *
   * @param plugin - The plugin to register
   * @returns {void}
   *
   * @example
   * ```typescript
   * registry.register(myMovementPlugin);
   * ```
   */
  register(plugin: VimPlugin): void {
    this.plugins.set(plugin.name, plugin);

    // Register patterns
    for (const pattern of plugin.patterns) {
      this.patternToPlugin.set(pattern, plugin.name);
    }

    // Call onRegister hook
    plugin.onRegister();
  }

  /**
   * Unregister a plugin by name
   *
   * Removes the plugin and all its patterns from the registry.
   * Calls the plugin's onUnregister hook.
   *
   * @param pluginName - The name of the plugin to unregister
   * @returns {void}
   *
   * @example
   * ```typescript
   * registry.unregister('movement');
   * ```
   */
  unregister(pluginName: string): void {
    const plugin = this.plugins.get(pluginName);
    if (plugin) {
      // Remove patterns
      for (const pattern of plugin.patterns) {
        this.patternToPlugin.delete(pattern);
      }

      // Remove plugin
      this.plugins.delete(pluginName);

      // Call onUnregister hook
      plugin.onUnregister();
    }
  }

  /**
   * Unregister plugins by pattern
   *
   * Finds and removes the plugin that owns the given pattern.
   *
   * @param pattern - The pattern whose plugin should be unregistered
   * @returns {void}
   *
   * @example
   * ```typescript
   * registry.unregisterByPattern('h');
   * ```
   */
  unregisterByPattern(pattern: string): void {
    const pluginName = this.patternToPlugin.get(pattern);
    if (pluginName) {
      this.unregister(pluginName);
    }
  }

  /**
   * Check if a plugin is registered
   *
   * @param pluginName - The plugin name to check
   * @returns {boolean} True if the plugin is registered
   *
   * @example
   * ```typescript
   * if (registry.hasPlugin('movement')) {
   *   // Plugin exists
   * }
   * ```
   */
  hasPlugin(pluginName: string): boolean {
    return this.plugins.has(pluginName);
  }

  /**
   * Check if a pattern is registered
   *
   * @param pattern - The pattern to check
   * @returns {boolean} True if the pattern is registered
   *
   * @example
   * ```typescript
   * if (registry.hasPattern('h')) {
   *   // Pattern exists
   * }
   * ```
   */
  hasPattern(pattern: string): boolean {
    return this.patternToPlugin.has(pattern);
  }

  /**
   * Get a plugin by name
   *
   * @param pluginName - The plugin name to retrieve
   * @returns {VimPlugin | null} The plugin or null if not found
   *
   * @example
   * ```typescript
   * const plugin = registry.getPlugin('movement');
   * if (plugin) {
   *   console.log(plugin.name);
   * }
   * ```
   */
  getPlugin(pluginName: string): VimPlugin | null {
    return this.plugins.get(pluginName) || null;
  }

  /**
   * Get a plugin by pattern
   *
   * @param pattern - The pattern to look up
   * @returns {VimPlugin | null} The plugin or null if not found
   *
   * @example
   * ```typescript
   * const plugin = registry.getPluginByPattern('h');
   * ```
   */
  getPluginByPattern(pattern: string): VimPlugin | null {
    const pluginName = this.patternToPlugin.get(pattern);
    if (pluginName) {
      return this.plugins.get(pluginName) || null;
    }
    return null;
  }

  /**
   * Get all registered plugins
   *
   * @returns {VimPlugin[]} Array of all registered plugins
   *
   * @example
   * ```typescript
   * const plugins = registry.getAllPlugins();
   * console.log(`Registered ${plugins.length} plugins`);
   * ```
   */
  getAllPlugins(): VimPlugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Get all registered patterns
   *
   * @returns {string[]} Array of all registered patterns
   *
   * @example
   * ```typescript
   * const patterns = registry.getAllPatterns();
   * ```
   */
  getAllPatterns(): string[] {
    return Array.from(this.patternToPlugin.keys());
  }

  /**
   * Validate a plugin
   *
   * Checks that the plugin has all required properties and that
   * its patterns don't conflict with existing registrations.
   *
   * @param plugin - The plugin to validate
   * @returns {Object} Validation result with valid flag and error array
   *   - valid: True if the plugin is valid
   *   - errors: Array of validation error messages
   *
   * @example
   * ```typescript
   * const validation = registry.validatePlugin(newPlugin);
   * if (!validation.valid) {
   *   validation.errors.forEach(err => console.error(err));
   * }
   * ```
   */
  validatePlugin(plugin: VimPlugin): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!plugin.name || plugin.name.trim() === '') {
      errors.push('Plugin name is required');
    }

    if (!plugin.version) {
      errors.push('Plugin version is required');
    }

    if (!plugin.description) {
      errors.push('Plugin description is required');
    }

    if (!plugin.patterns || plugin.patterns.length === 0) {
      errors.push('Plugin must have at least one pattern');
    }

    if (!plugin.modes || plugin.modes.length === 0) {
      errors.push('Plugin must have at least one mode');
    }

    // Check for pattern conflicts
    for (const pattern of plugin.patterns) {
      if (this.hasPattern(pattern)) {
        errors.push(`Pattern '${pattern}' is already registered`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Check if a pattern is available
   *
   * @param pattern - The pattern to check
   * @param excludePlugin - Optional plugin name to exclude from check
   * @returns {boolean} True if the pattern can be registered
   *
   * @example
   * ```typescript
   * if (registry.isPatternAvailable('gg')) {
   *   // Pattern is available
   * }
   * ```
   */
  isPatternAvailable(pattern: string, excludePlugin?: string): boolean {
    const pluginName = this.patternToPlugin.get(pattern);
    if (!pluginName) {
      return true;
    }
    return pluginName === excludePlugin;
  }

  /**
   * Get the number of registered plugins
   *
   * @returns {number} The plugin count
   *
   * @example
   * ```typescript
   * console.log(`Total plugins: ${registry.getPluginCount()}`);
   * ```
   */
  getPluginCount(): number {
    return this.plugins.size;
  }

  /**
   * Clear all plugins
   *
   * Removes all plugins and patterns from the registry.
   *
   * @returns {void}
   *
   * @example
   * ```typescript
   * registry.clear();
   * ```
   */
  clear(): void {
    this.plugins.clear();
    this.patternToPlugin.clear();
  }
}
