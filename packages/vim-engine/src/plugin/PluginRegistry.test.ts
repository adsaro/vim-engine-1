/**
 * PluginRegistry Tests
 */
import { PluginRegistry } from './plugin/PluginRegistry';
import { VimPlugin } from './plugin/VimPlugin';
import { VimMode } from './VimMode';

/**
 * Helper function to create a mock VimPlugin
 */
function createMockPlugin(
  name: string,
  patterns: string[] = ['test'],
  modes: VimMode[] = ['NORMAL' as VimMode]
): VimPlugin {
  return {
    name,
    version: '1.0.0',
    description: `Test plugin: ${name}`,
    patterns,
    modes,
    initialize: jest.fn(),
    destroy: jest.fn(),
    execute: jest.fn(),
    canExecute: jest.fn(() => true),
    validatePattern: jest.fn((pattern: string) => patterns.includes(pattern)),
    onRegister: jest.fn(),
    onUnregister: jest.fn(),
    enable: jest.fn(),
    disable: jest.fn(),
    isEnabled: jest.fn(() => true),
  };
}

describe('PluginRegistry', () => {
  let registry: PluginRegistry;

  beforeEach(() => {
    registry = new PluginRegistry();
  });

  describe('constructor', () => {
    it('should create an instance', () => {
      expect(registry).toBeInstanceOf(PluginRegistry);
    });
  });

  describe('register', () => {
    it('should register a plugin', () => {
      const plugin = createMockPlugin('test-plugin');

      registry.register(plugin);

      expect(registry.hasPlugin('test-plugin')).toBe(true);
    });

    it('should call onRegister hook when registering', () => {
      const plugin = createMockPlugin('test-plugin');

      registry.register(plugin);

      expect(plugin.onRegister).toHaveBeenCalledWith();
    });

    it('should allow registering multiple plugins', () => {
      const plugin1 = createMockPlugin('plugin1', ['p1']);
      const plugin2 = createMockPlugin('plugin2', ['p2'], ['INSERT' as VimMode]);

      registry.register(plugin1);
      registry.register(plugin2);

      expect(registry.hasPlugin('plugin1')).toBe(true);
      expect(registry.hasPlugin('plugin2')).toBe(true);
      expect(registry.getPluginCount()).toBe(2);
    });
  });

  describe('unregister', () => {
    it('should unregister a plugin by name', () => {
      const plugin = createMockPlugin('test-plugin');

      registry.register(plugin);
      expect(registry.hasPlugin('test-plugin')).toBe(true);

      registry.unregister('test-plugin');
      expect(registry.hasPlugin('test-plugin')).toBe(false);
    });

    it('should call onUnregister hook when unregistering', () => {
      const plugin = createMockPlugin('test-plugin');

      registry.register(plugin);
      registry.unregister('test-plugin');

      expect(plugin.onUnregister).toHaveBeenCalledWith();
    });

    it('should do nothing when unregistering non-existent plugin', () => {
      expect(() => {
        registry.unregister('non-existent');
      }).not.toThrow();
    });
  });

  describe('unregisterByPattern', () => {
    it('should unregister plugin by pattern', () => {
      const plugin1 = createMockPlugin('test-plugin-1', ['test-pattern']);
      const otherPlugin = createMockPlugin('other-plugin', ['other']);

      registry.register(plugin1);
      registry.register(otherPlugin);

      registry.unregisterByPattern('test-pattern');

      expect(registry.hasPlugin('test-plugin-1')).toBe(false);
      expect(registry.hasPlugin('other-plugin')).toBe(true);
    });
  });

  describe('hasPlugin', () => {
    it('should return true for registered plugin', () => {
      const plugin = createMockPlugin('test-plugin');

      registry.register(plugin);

      expect(registry.hasPlugin('test-plugin')).toBe(true);
    });

    it('should return false for non-registered plugin', () => {
      expect(registry.hasPlugin('non-existent')).toBe(false);
    });
  });

  describe('hasPattern', () => {
    it('should return true for registered pattern', () => {
      const plugin = createMockPlugin('test-plugin', ['test-pattern', 'tp']);

      registry.register(plugin);

      expect(registry.hasPattern('test-pattern')).toBe(true);
      expect(registry.hasPattern('tp')).toBe(true);
    });

    it('should return false for non-registered pattern', () => {
      expect(registry.hasPattern('non-existent')).toBe(false);
    });
  });

  describe('getPlugin', () => {
    it('should return plugin by name', () => {
      const plugin = createMockPlugin('test-plugin');

      registry.register(plugin);

      const retrieved = registry.getPlugin('test-plugin');
      expect(retrieved).toBe(plugin);
    });

    it('should return null for non-existent plugin', () => {
      expect(registry.getPlugin('non-existent')).toBeNull();
    });
  });

  describe('getPluginByPattern', () => {
    it('should return plugin by pattern', () => {
      const plugin = createMockPlugin('test-plugin', ['test-pattern']);

      registry.register(plugin);

      const retrieved = registry.getPluginByPattern('test-pattern');
      expect(retrieved).toBe(plugin);
    });

    it('should return null for non-existent pattern', () => {
      expect(registry.getPluginByPattern('non-existent')).toBeNull();
    });
  });

  describe('getAllPlugins', () => {
    it('should return all registered plugins', () => {
      const plugin1 = createMockPlugin('plugin1', ['p1']);
      const plugin2 = createMockPlugin('plugin2', ['p2'], ['INSERT' as VimMode]);

      registry.register(plugin1);
      registry.register(plugin2);

      const plugins = registry.getAllPlugins();
      expect(plugins).toHaveLength(2);
      expect(plugins).toContain(plugin1);
      expect(plugins).toContain(plugin2);
    });

    it('should return empty array when no plugins registered', () => {
      expect(registry.getAllPlugins()).toEqual([]);
    });
  });

  describe('getAllPatterns', () => {
    it('should return all registered patterns', () => {
      const plugin1 = createMockPlugin('plugin1', ['p1', 'p1-alt']);
      const plugin2 = createMockPlugin('plugin2', ['p2'], ['INSERT' as VimMode]);

      registry.register(plugin1);
      registry.register(plugin2);

      const patterns = registry.getAllPatterns();
      expect(patterns).toContain('p1');
      expect(patterns).toContain('p1-alt');
      expect(patterns).toContain('p2');
    });
  });

  describe('validatePlugin', () => {
    it('should return valid for correct plugin', () => {
      const plugin = createMockPlugin('test-plugin');

      const result = registry.validatePlugin(plugin);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return errors for plugin without name', () => {
      const plugin = {
        name: '',
        version: '1.0.0',
        description: 'A test plugin',
        patterns: ['test'],
        modes: ['NORMAL' as VimMode],
        initialize: jest.fn(),
        destroy: jest.fn(),
        execute: jest.fn(),
        canExecute: jest.fn(() => true),
        validatePattern: jest.fn(() => true),
        onRegister: jest.fn(),
        onUnregister: jest.fn(),
        enable: jest.fn(),
        disable: jest.fn(),
        isEnabled: jest.fn(() => true),
      } as VimPlugin;

      const result = registry.validatePlugin(plugin);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('isPatternAvailable', () => {
    it('should return true when pattern is not registered', () => {
      expect(registry.isPatternAvailable('test')).toBe(true);
    });

    it('should return false when pattern is registered', () => {
      const plugin = createMockPlugin('test-plugin');

      registry.register(plugin);

      expect(registry.isPatternAvailable('test')).toBe(false);
    });

    it('should exclude specified plugin when checking availability', () => {
      const plugin = createMockPlugin('test-plugin');

      registry.register(plugin);

      expect(registry.isPatternAvailable('test', 'test-plugin')).toBe(true);
      expect(registry.isPatternAvailable('test', 'other-plugin')).toBe(false);
    });
  });

  describe('getPluginCount', () => {
    it('should return 0 initially', () => {
      expect(registry.getPluginCount()).toBe(0);
    });

    it('should return correct count after registering plugins', () => {
      const plugin1 = createMockPlugin('plugin1', ['p1']);
      registry.register(plugin1);
      expect(registry.getPluginCount()).toBe(1);

      const plugin2 = createMockPlugin('plugin2', ['p2'], ['INSERT' as VimMode]);
      registry.register(plugin2);
      expect(registry.getPluginCount()).toBe(2);

      registry.unregister('plugin1');
      expect(registry.getPluginCount()).toBe(1);
    });
  });

  describe('clear', () => {
    it('should remove all plugins', () => {
      const plugin1 = createMockPlugin('plugin1', ['p1']);
      const plugin2 = createMockPlugin('plugin2', ['p2'], ['INSERT' as VimMode]);

      registry.register(plugin1);
      registry.register(plugin2);
      expect(registry.getPluginCount()).toBe(2);

      registry.clear();

      expect(registry.getPluginCount()).toBe(0);
      expect(registry.hasPlugin('plugin1')).toBe(false);
      expect(registry.hasPlugin('plugin2')).toBe(false);
    });
  });
});
