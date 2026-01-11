/**
 * VimExecutor Tests
 */
import { VimExecutor } from './index';
import { VimPlugin, ExecutionContext, PluginRegistry } from '../plugin/index';
import { VimMode, VIM_MODE } from '../state/index';

describe('VimExecutor', () => {
  let executor: VimExecutor;

  beforeEach(() => {
    executor = new VimExecutor();
  });

  afterEach(() => {
    executor.destroy();
  });

  describe('constructor', () => {
    it('should create an instance with default debounce time', () => {
      const exec = new VimExecutor();
      expect(exec).toBeInstanceOf(VimExecutor);
      expect(exec.isRunning()).toBe(false);
      exec.destroy();
    });

    it('should create an instance with custom debounce time', () => {
      const exec = new VimExecutor(200);
      expect(exec).toBeInstanceOf(VimExecutor);
      exec.destroy();
    });

    describe('dependency injection', () => {
      it('should accept custom PluginRegistry', () => {
        const customRegistry = new PluginRegistry();
        const exec = new VimExecutor(undefined, { pluginRegistry: customRegistry });
        expect(exec).toBeInstanceOf(VimExecutor);
        exec.destroy();
      });

      it('should accept custom ExecutionContext', () => {
        const customContext = new ExecutionContext();
        const exec = new VimExecutor(undefined, { executionContext: customContext });
        expect(exec).toBeInstanceOf(VimExecutor);
        expect(exec.getExecutionContext()).toBe(customContext);
        exec.destroy();
      });

      it('should create default dependencies when not provided', () => {
        const exec = new VimExecutor();
        expect(exec).toBeInstanceOf(VimExecutor);
        expect(exec.getExecutionContext()).toBeInstanceOf(ExecutionContext);
        exec.destroy();
      });

      it('should allow partial dependency injection', () => {
        const customContext = new ExecutionContext();
        // Only inject execution context, others should be default
        const exec = new VimExecutor(undefined, { executionContext: customContext });
        expect(exec.getExecutionContext()).toBe(customContext);
        exec.destroy();
      });

      it('should work with mock dependencies for testing', () => {
        const mockContext = {
          getMode: () => VIM_MODE.NORMAL,
          setMode: jest.fn(),
          getState: () => ({
            mode: VIM_MODE.NORMAL,
            cursor: { row: 0, col: 0 },
            buffer: { lines: [''] },
          }),
        } as unknown as ExecutionContext;

        const exec = new VimExecutor(undefined, { executionContext: mockContext });
        expect(exec.getCurrentMode()).toBe(VIM_MODE.NORMAL);
        exec.destroy();
      });
    });
  });

  describe('lifecycle', () => {
    describe('initialize', () => {
      it('should initialize the executor', () => {
        expect(() => executor.initialize()).not.toThrow();
      });

      it('should not start running after initialize', () => {
        executor.initialize();
        expect(executor.isRunning()).toBe(false);
      });
    });

    describe('start', () => {
      it('should start the executor', () => {
        executor.initialize();
        executor.start();
        expect(executor.isRunning()).toBe(true);
      });

      it('should start without initialize', () => {
        executor.start();
        expect(executor.isRunning()).toBe(true);
      });
    });

    describe('stop', () => {
      it('should stop the executor', () => {
        executor.start();
        executor.stop();
        expect(executor.isRunning()).toBe(false);
      });

      it('should stop from running state', () => {
        executor.initialize();
        executor.start();
        executor.stop();
        expect(executor.isRunning()).toBe(false);
      });
    });

    describe('destroy', () => {
      it('should destroy the executor', () => {
        executor.start();
        expect(() => executor.destroy()).not.toThrow();
        expect(executor.isRunning()).toBe(false);
      });

      it('should allow destroy without start', () => {
        expect(() => executor.destroy()).not.toThrow();
      });

      it('should allow multiple destroy calls', () => {
        executor.destroy();
        expect(() => executor.destroy()).not.toThrow();
      });
    });

    describe('full lifecycle', () => {
      it('should work through initialize -> start -> stop -> destroy', () => {
        executor.initialize();
        executor.start();
        expect(executor.isRunning()).toBe(true);
        executor.stop();
        expect(executor.isRunning()).toBe(false);
        executor.destroy();
      });
    });
  });

  describe('plugin management', () => {
    describe('registerPlugin', () => {
      it('should register a plugin', () => {
        const plugin = createMockPlugin('test-plugin');
        executor.registerPlugin(plugin);

        const plugins = executor.getRegisteredPlugins();
        expect(plugins).toContain(plugin);
      });

      it('should register multiple plugins', () => {
        const plugin1 = createMockPlugin('plugin-1');
        const plugin2 = createMockPlugin('plugin-2');

        executor.registerPlugin(plugin1);
        executor.registerPlugin(plugin2);

        const plugins = executor.getRegisteredPlugins();
        expect(plugins.length).toBe(2);
      });

      it('should not register duplicate plugins', () => {
        const plugin = createMockPlugin('test-plugin');

        executor.registerPlugin(plugin);
        executor.registerPlugin(plugin);

        const plugins = executor.getRegisteredPlugins();
        expect(plugins.length).toBe(1);
      });
    });

    describe('unregisterPlugin', () => {
      it('should unregister a plugin', () => {
        const plugin = createMockPlugin('test-plugin');
        executor.registerPlugin(plugin);

        executor.unregisterPlugin('test-plugin');

        const plugins = executor.getRegisteredPlugins();
        expect(plugins).not.toContain(plugin);
      });

      it('should not throw for non-existent plugin', () => {
        expect(() => {
          executor.unregisterPlugin('non-existent');
        }).not.toThrow();
      });
    });

    describe('getRegisteredPlugins', () => {
      it('should return empty array when no plugins registered', () => {
        const plugins = executor.getRegisteredPlugins();
        expect(plugins).toEqual([]);
      });

      it('should return registered plugins', () => {
        const plugin1 = createMockPlugin('plugin-1', ['a', 'b']);
        const plugin2 = createMockPlugin('plugin-2', ['c', 'd']);

        executor.registerPlugin(plugin1);
        executor.registerPlugin(plugin2);

        const plugins = executor.getRegisteredPlugins();
        expect(plugins.length).toBe(2);
      });
    });
  });

  describe('state access', () => {
    describe('getExecutionContext', () => {
      it('should return an execution context', () => {
        const context = executor.getExecutionContext();
        expect(context).toBeInstanceOf(ExecutionContext);
      });

      it('should return a valid context with initial state', () => {
        const context = executor.getExecutionContext();
        expect(context.getState()).toBeDefined();
      });
    });

    describe('getCurrentMode', () => {
      it('should return current mode', () => {
        const mode = executor.getCurrentMode();
        expect(mode).toBeDefined();
      });

      it('should return NORMAL mode by default', () => {
        const mode = executor.getCurrentMode();
        expect(mode).toBe(VIM_MODE.NORMAL);
      });
    });

    describe('setCurrentMode', () => {
      it('should set current mode', () => {
        executor.setCurrentMode(VIM_MODE.INSERT);
        expect(executor.getCurrentMode()).toBe(VIM_MODE.INSERT);
      });

      it('should set to VISUAL mode', () => {
        executor.setCurrentMode(VIM_MODE.VISUAL);
        expect(executor.getCurrentMode()).toBe(VIM_MODE.VISUAL);
      });

      it('should set to COMMAND mode', () => {
        executor.setCurrentMode(VIM_MODE.COMMAND);
        expect(executor.getCurrentMode()).toBe(VIM_MODE.COMMAND);
      });
    });

    describe('getState', () => {
      it('should return vim state', () => {
        const state = executor.getState();
        expect(state).toBeDefined();
        expect(state.mode).toBeDefined();
        expect(state.cursor).toBeDefined();
        expect(state.buffer).toBeDefined();
      });

      it('should return same state as getExecutionContext', () => {
        const state = executor.getState();
        const context = executor.getExecutionContext();
        expect(context.getState()).toBe(state);
      });
    });
  });

  describe('event handling', () => {
    describe('handleKeyboardEvent', () => {
      it('should accept keyboard events', () => {
        const event = createMockKeyboardEvent('a');
        expect(() => executor.handleKeyboardEvent(event)).not.toThrow();
      });

      it('should accept events with modifiers', () => {
        const event = createMockKeyboardEvent('c', true, false, false, false);
        expect(() => executor.handleKeyboardEvent(event)).not.toThrow();
      });
    });

    describe('handleKeystroke', () => {
      it('should accept keystroke strings', () => {
        expect(() => executor.handleKeystroke('a')).not.toThrow();
      });

      it('should accept special keys', () => {
        expect(() => executor.handleKeystroke('<Esc>')).not.toThrow();
        expect(() => executor.handleKeystroke('<Enter>')).not.toThrow();
      });

      it('should accept multi-key sequences', () => {
        expect(() => executor.handleKeystroke('gg')).not.toThrow();
        expect(() => executor.handleKeystroke('dd')).not.toThrow();
      });
    });
  });

  describe('status', () => {
    describe('isRunning', () => {
      it('should return false by default', () => {
        expect(executor.isRunning()).toBe(false);
      });

      it('should return true after start', () => {
        executor.start();
        expect(executor.isRunning()).toBe(true);
      });

      it('should return false after stop', () => {
        executor.start();
        executor.stop();
        expect(executor.isRunning()).toBe(false);
      });

      it('should return false after destroy', () => {
        executor.start();
        executor.destroy();
        expect(executor.isRunning()).toBe(false);
      });
    });

    describe('getStats', () => {
      it('should return plugin count', () => {
        const stats = executor.getStats();
        expect(stats.pluginCount).toBe(0);

        const plugin = createMockPlugin('test-plugin');
        executor.registerPlugin(plugin);

        const newStats = executor.getStats();
        expect(newStats.pluginCount).toBe(1);
      });

      it('should return error count', () => {
        const stats = executor.getStats();
        expect(stats.errorCount).toBe(0);
      });

      it('should return keystroke count', () => {
        const stats = executor.getStats();
        expect(stats.keystrokeCount).toBe(0);
      });
    });
  });

  describe('integration', () => {
    it('should handle complete workflow', () => {
      // Register plugins
      const plugin1 = createMockPlugin('move', ['h', 'j', 'k', 'l']);
      const plugin2 = createMockPlugin('delete', ['d']);

      executor.registerPlugin(plugin1);
      executor.registerPlugin(plugin2);

      // Check plugin count
      expect(executor.getStats().pluginCount).toBe(2);

      // Initialize and start
      executor.initialize();
      executor.start();
      expect(executor.isRunning()).toBe(true);

      // Handle keystrokes
      executor.handleKeystroke('h');
      executor.handleKeystroke('j');
      executor.handleKeystroke('k');
      executor.handleKeystroke('l');

      // Stop and destroy
      executor.stop();
      executor.destroy();
      expect(executor.isRunning()).toBe(false);
    });
  });

  describe('VimExecutor - Keystroke Counting', () => {
    it('should count each keystroke exactly once', () => {
      const plugin = createMockPlugin('move', ['h', 'j', 'k']);
      executor.registerPlugin(plugin);
      executor.initialize();
      executor.start();

      executor.handleKeystroke('h');
      expect(executor.getKeystrokeCount()).toBe(1);

      executor.handleKeystroke('j');
      expect(executor.getKeystrokeCount()).toBe(2);

      executor.handleKeystroke('k');
      expect(executor.getKeystrokeCount()).toBe(3);
    });

    it('should not increment count on invalid keystrokes', () => {
      executor.initialize();
      executor.start();

      const initialCount = executor.getKeystrokeCount();
      executor.handleKeystroke('invalid-command-not-registered');

      // Count should not increment if no plugin handles it
      expect(executor.getKeystrokeCount()).toBe(initialCount);
    });

    it('should provide read-only access to count', () => {
      const count = executor.getKeystrokeCount();
      expect(typeof count).toBe('number');
      expect(count).toBe(0);
    });
  });

  describe('VimExecutor - Resource Cleanup', () => {
    it('should call destroy on all components', () => {
      executor.initialize();
      executor.start();

      // Should not throw
      expect(() => executor.destroy()).not.toThrow();
    });

    it('should be safe to call destroy multiple times', () => {
      executor.initialize();
      executor.start();

      expect(() => {
        executor.destroy();
        executor.destroy();
        executor.destroy();
      }).not.toThrow();
    });
  });
});

/**
 * Helper function to create a mock VimPlugin
 */
function createMockPlugin(name: string, patterns: string[] = ['test']): VimPlugin {
  return {
    name,
    version: '1.0.0',
    description: `Test plugin: ${name}`,
    patterns,
    modes: ['NORMAL' as VimMode],
    initialize: jest.fn(),
    destroy: jest.fn(),
    execute: jest.fn(),
    canExecute: jest.fn().mockReturnValue(true),
    validatePattern: jest.fn().mockReturnValue(true),
    onRegister: jest.fn(),
    onUnregister: jest.fn(),
    enable: jest.fn(),
    disable: jest.fn(),
    isEnabled: jest.fn().mockReturnValue(true),
  };
}

/**
 * Helper function to create a mock KeyboardEvent
 */
function createMockKeyboardEvent(
  key: string,
  ctrlKey = false,
  altKey = false,
  shiftKey = false,
  metaKey = false
): KeyboardEvent {
  return {
    key,
    ctrlKey,
    altKey,
    shiftKey,
    metaKey,
    repeat: false,
  } as KeyboardEvent;
}
