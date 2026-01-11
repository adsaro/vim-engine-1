/**
 * Dependency Injection Container
 *
 * A simple DI container that supports factory functions and instance registration.
 * Provides lazy initialization with caching for better performance.
 *
 * @example
 * ```typescript
 * import { DIContainer, DI_KEYS } from './di/container';
 *
 * const container = new DIContainer();
 *
 * // Register a factory
 * container.register('MyService', () => new MyService());
 *
 * // Register an instance
 * container.registerInstance('Config', { debug: true });
 *
 * // Resolve dependency
 * const service = container.resolve<MyService>('MyService');
 * ```
 */
export class DIContainer {
  private dependencies: Map<string, unknown> = new Map();
  private factories: Map<string, () => unknown> = new Map();

  /**
   * Register a factory function for a dependency key
   *
   * The factory will be called lazily when the dependency is first resolved.
   * The result is cached for subsequent resolutions.
   *
   * @param key - The dependency key (usually a class name or identifier)
   * @param factory - A function that creates the dependency instance
   *
   * @example
   * ```typescript
   * container.register('UserService', () => new UserService(repository));
   * ```
   */
  register<T>(key: string, factory: () => T): void {
    this.factories.set(key, factory);
  }

  /**
   * Register a pre-created instance
   *
   * Instances are resolved immediately and take precedence over factories.
   *
   * @param key - The dependency key
   * @param instance - The pre-created instance to register
   *
   * @example
   * ```typescript
   * container.registerInstance('Config', { debug: true, apiUrl: '...' });
   * ```
   */
  registerInstance<T>(key: string, instance: T): void {
    this.dependencies.set(key, instance);
  }

  /**
   * Resolve a dependency by key
   *
   * If an instance is registered, it is returned immediately.
   * If a factory is registered, the factory is called (once) and the result is cached.
   * If neither is registered, an error is thrown.
   *
   * @param key - The dependency key to resolve
   * @returns The resolved dependency instance
   * @throws Error if the dependency is not registered
   *
   * @example
   * ```typescript
   * const service = container.resolve<MyService>('MyService');
   * ```
   */
  resolve<T>(key: string): T {
    if (this.dependencies.has(key)) {
      return this.dependencies.get(key) as T;
    }

    if (this.factories.has(key)) {
      const factory = this.factories.get(key)!;
      const instance = factory();
      this.dependencies.set(key, instance);
      return instance as T;
    }

    throw new Error(`Dependency '${key}' not found`);
  }

  /**
   * Check if a dependency is registered
   *
   * @param key - The dependency key to check
   * @returns True if the dependency is registered (either as instance or factory)
   *
   * @example
   * ```typescript
   * if (container.has('MyService')) {
   *   // Safe to resolve
   * }
   * ```
   */
  has(key: string): boolean {
    return this.dependencies.has(key) || this.factories.has(key);
  }

  /**
   * Clear all registered dependencies
   *
   * Useful for testing or resetting the container state.
   *
   * @example
   * ```typescript
   * container.clear();
   * ```
   */
  clear(): void {
    this.dependencies.clear();
    this.factories.clear();
  }
}

/**
 * Dependency keys for the application
 *
 * These constants provide a centralized way to reference dependencies
 * across the application, reducing magic strings and improving maintainability.
 *
 * @example
 * ```typescript
 * import { DIContainer, DI_KEYS } from './di/container';
 *
 * const container = new DIContainer();
 * container.register(DI_KEYS.PluginRegistry, () => new PluginRegistry());
 * ```
 */
export const DI_KEYS = {
  /** PluginRegistry dependency key */
  PluginRegistry: 'PluginRegistry',

  /** CommandRouter dependency key */
  CommandRouter: 'CommandRouter',

  /** DebounceManager dependency key */
  DebounceManager: 'DebounceManager',

  /** ErrorHandler dependency key */
  ErrorHandler: 'ErrorHandler',

  /** ExecutionContext dependency key */
  ExecutionContext: 'ExecutionContext',
} as const;

/**
 * Type representing the value of a DI key
 */
export type DIKey = (typeof DI_KEYS)[keyof typeof DI_KEYS];
