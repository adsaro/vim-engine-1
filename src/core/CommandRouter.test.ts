/**
 * CommandRouter Tests
 */
import { CommandRouter } from './index';
import { PluginRegistry } from '../plugin/index';
import { VimPlugin, ExecutionContext } from '../plugin/index';
import { VimMode, VimState } from '../state/index';
import { CursorPosition, TextBuffer } from '../state/index';

describe('CommandRouter', () => {
  let commandRouter: CommandRouter;
  let pluginRegistry: PluginRegistry;
  let mockPlugin: MockVimPlugin;

  beforeEach(() => {
    commandRouter = new CommandRouter();
    pluginRegistry = new PluginRegistry();
    mockPlugin = new MockVimPlugin('test-plugin', ['h', 'j', 'k', 'l']);
    commandRouter.setPluginRegistry(pluginRegistry);
  });

  afterEach(() => {
    commandRouter.clear();
  });

  describe('constructor', () => {
    it('should create an instance without plugin registry', () => {
      const router = new CommandRouter();
      expect(router).toBeInstanceOf(CommandRouter);
      expect(router.getPluginRegistry()).toBeNull();
      router.clear();
    });

    it('should create an instance with plugin registry', () => {
      const router = new CommandRouter(pluginRegistry);
      expect(router).toBeInstanceOf(CommandRouter);
      expect(router.getPluginRegistry()).toBe(pluginRegistry);
      router.clear();
    });
  });

  describe('setPluginRegistry', () => {
    it('should set the plugin registry', () => {
      const registry = new PluginRegistry();
      commandRouter.setPluginRegistry(registry);
      expect(commandRouter.getPluginRegistry()).toBe(registry);
    });
  });

  describe('getPluginRegistry', () => {
    it('should return the plugin registry', () => {
      expect(commandRouter.getPluginRegistry()).toBe(pluginRegistry);
    });

    it('should return null if no registry set', () => {
      const router = new CommandRouter();
      expect(router.getPluginRegistry()).toBeNull();
    });
  });

  describe('registerPattern', () => {
    it('should register a pattern with a plugin', () => {
      commandRouter.registerPattern('gg', mockPlugin);
      expect(commandRouter.hasPattern('gg')).toBe(true);
    });

    it('should allow registering multiple patterns for same plugin', () => {
      commandRouter.registerPattern('gg', mockPlugin);
      commandRouter.registerPattern('G', mockPlugin);
      expect(commandRouter.hasPattern('gg')).toBe(true);
      expect(commandRouter.hasPattern('G')).toBe(true);
    });

    it('should throw when registering with invalid plugin', () => {
      expect(() => {
        commandRouter.registerPattern('x', null as unknown as VimPlugin);
      }).toThrow();
    });
  });

  describe('unregisterPattern', () => {
    it('should unregister a pattern', () => {
      commandRouter.registerPattern('gg', mockPlugin);
      commandRouter.unregisterPattern('gg');
      expect(commandRouter.hasPattern('gg')).toBe(false);
    });

    it('should not throw when unregistering non-existent pattern', () => {
      expect(() => {
        commandRouter.unregisterPattern('non-existent');
      }).not.toThrow();
    });
  });

  describe('hasPattern', () => {
    it('should return true for registered patterns', () => {
      commandRouter.registerPattern('gg', mockPlugin);
      expect(commandRouter.hasPattern('gg')).toBe(true);
    });

    it('should return false for unregistered patterns', () => {
      expect(commandRouter.hasPattern('gg')).toBe(false);
    });
  });

  describe('matchPattern', () => {
    it('should return plugin for matching pattern', () => {
      commandRouter.registerPattern('gg', mockPlugin);
      const result = commandRouter.matchPattern('gg');
      expect(result).toBe(mockPlugin);
    });

    it('should return null for non-matching pattern', () => {
      commandRouter.registerPattern('gg', mockPlugin);
      const result = commandRouter.matchPattern('x');
      expect(result).toBeNull();
    });

    it('should match patterns starting with keystrokes', () => {
      commandRouter.registerPattern('g', mockPlugin);
      const result = commandRouter.matchPattern('gg');
      expect(result).toBe(mockPlugin);
    });

    it('should return null when no registry is set', () => {
      const router = new CommandRouter();
      const result = router.matchPattern('gg');
      expect(result).toBeNull();
      router.clear();
    });
  });

  describe('findMatchingPlugin', () => {
    it('should find plugin for matching keystrokes', () => {
      commandRouter.registerPattern('gg', mockPlugin);
      const result = commandRouter.findMatchingPlugin('gg');
      expect(result).toBe(mockPlugin);
    });

    it('should return null for non-matching keystrokes', () => {
      commandRouter.registerPattern('gg', mockPlugin);
      const result = commandRouter.findMatchingPlugin('xyz');
      expect(result).toBeNull();
    });

    it('should prefer exact matches', () => {
      commandRouter.registerPattern('g', mockPlugin);
      const result = commandRouter.findMatchingPlugin('gg');
      expect(result).toBe(mockPlugin);
    });
  });

  describe('execute', () => {
    it('should execute command for matching pattern', async () => {
      const context = createMockExecutionContext();
      mockPlugin.execute = jest.fn();

      commandRouter.registerPattern('h', mockPlugin);

      await commandRouter.execute('h', context);

      expect(mockPlugin.execute).toHaveBeenCalled();
    });

    it('should not throw for non-matching pattern', async () => {
      const context = createMockExecutionContext();
      mockPlugin.execute = jest.fn();

      await expect(commandRouter.execute('xyz', context)).resolves.not.toThrow();
    });

    it('should return void for async execution', async () => {
      const context = createMockExecutionContext();
      const result = await commandRouter.execute('h', context);
      expect(result).toBeUndefined();
    });
  });

  describe('executeSync', () => {
    it('should execute command synchronously', () => {
      const context = createMockExecutionContext();
      mockPlugin.execute = jest.fn();

      commandRouter.registerPattern('h', mockPlugin);
      commandRouter.executeSync('h', context);

      expect(mockPlugin.execute).toHaveBeenCalled();
    });

    it('should not throw for non-matching pattern', () => {
      const context = createMockExecutionContext();
      mockPlugin.execute = jest.fn();

      expect(() => {
        commandRouter.executeSync('xyz', context);
      }).not.toThrow();
    });
  });

  describe('getAllPatterns', () => {
    it('should return all registered patterns', () => {
      commandRouter.registerPattern('gg', mockPlugin);
      commandRouter.registerPattern('G', mockPlugin);

      const patterns = commandRouter.getAllPatterns();

      expect(patterns).toContain('gg');
      expect(patterns).toContain('G');
    });

    it('should return empty array when no patterns registered', () => {
      const patterns = commandRouter.getAllPatterns();
      expect(patterns).toEqual([]);
    });
  });

  describe('getPluginForPattern', () => {
    it('should return plugin for registered pattern', () => {
      commandRouter.registerPattern('gg', mockPlugin);
      const result = commandRouter.getPluginForPattern('gg');
      expect(result).toBe(mockPlugin);
    });

    it('should return null for unregistered pattern', () => {
      const result = commandRouter.getPluginForPattern('xyz');
      expect(result).toBeNull();
    });
  });

  describe('clear', () => {
    it('should clear all registered patterns', () => {
      commandRouter.registerPattern('gg', mockPlugin);
      commandRouter.registerPattern('G', mockPlugin);

      commandRouter.clear();

      expect(commandRouter.hasPattern('gg')).toBe(false);
      expect(commandRouter.hasPattern('G')).toBe(false);
    });

    it('should clear plugin registry reference', () => {
      commandRouter.clear();
      expect(commandRouter.getPluginRegistry()).toBeNull();
    });
  });
});

/**
 * Mock VimPlugin for testing
 */
class MockVimPlugin implements VimPlugin {
  readonly name: string;
  readonly version: string = '1.0.0';
  readonly description: string = 'Test plugin';
  readonly patterns: string[];
  readonly modes: VimMode[] = ['NORMAL'];

  execute: jest.Mock = jest.fn();
  initialize: jest.Mock = jest.fn();
  destroy: jest.Mock = jest.fn();
  canExecute: jest.Mock = jest.fn().mockReturnValue(true);
  validatePattern: jest.Mock = jest.fn().mockReturnValue(true);
  onRegister: jest.Mock = jest.fn();
  onUnregister: jest.Mock = jest.fn();
  enable: jest.Mock = jest.fn();
  disable: jest.Mock = jest.fn();
  isEnabled: jest.Mock = jest.fn().mockReturnValue(true);

  constructor(name: string, patterns: string[]) {
    this.name = name;
    this.patterns = patterns;
  }
}

/**
 * Helper function to create a mock ExecutionContext
 */
function createMockExecutionContext(): ExecutionContext {
  const state = new VimState();
  state.mode = 'NORMAL' as VimMode;
  state.buffer = new TextBuffer('test content');
  state.cursor = new CursorPosition(0, 0);

  return new ExecutionContext(state);
}
