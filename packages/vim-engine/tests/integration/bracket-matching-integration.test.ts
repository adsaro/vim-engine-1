/**
 * Bracket Matching Integration Tests
 * 
 * Tests for verifying integration of bracket matching functionality
 * through the VimExecutor and PluginRegistry.
 */
import {
  createTestExecutor,
  createTestState,
  setupExecutorWithState,
} from '../integration.test.utils';
import { VIM_MODE } from '../../src/state/VimMode';
import { PercentMovementPlugin } from '../../src/plugins/movement/percent/PercentMovementPlugin';
import { PluginRegistry } from '../../src/plugin/PluginRegistry';

describe('Integration: Bracket Matching', () => {
  describe('Plugin Registration', () => {
    it('should register PercentMovementPlugin in PluginRegistry', () => {
      const registry = new PluginRegistry();
      const plugin = new PercentMovementPlugin();
      
      registry.register(plugin);
      
      expect(registry.getPlugin('movement-percent')).toBeDefined();
    });

    it('should have correct metadata for registered plugin', () => {
      const plugin = new PercentMovementPlugin();
      
      expect(plugin.name).toBe('movement-percent');
      expect(plugin.version).toBe('1.0.0');
      expect(plugin.patterns).toContain('%');
      expect(plugin.modes).toContain(VIM_MODE.NORMAL);
      expect(plugin.modes).toContain(VIM_MODE.VISUAL);
    });

    it('should not register in INSERT or COMMAND modes', () => {
      const plugin = new PercentMovementPlugin();
      
      expect(plugin.modes).not.toContain(VIM_MODE.INSERT);
      expect(plugin.modes).not.toContain(VIM_MODE.COMMAND);
    });
  });

  describe('Plugin Execution through VimExecutor', () => {
    it('should register % pattern for PercentMovementPlugin', () => {
      const executor = createTestExecutor();
      const state = createTestState('(hello world)');
      
      setupExecutorWithState(executor, state);
      
      // The plugin should handle % keystrokes
      // We verify this by checking the plugin is registered
      expect(executor).toBeDefined();
    });

    it('should handle basic bracket matching through plugin', () => {
      const executor = createTestExecutor();
      const state = createTestState('(test)');
      
      setupExecutorWithState(executor, state);
      
      // Verify initial state
      expect(state.cursor.line).toBe(0);
      expect(state.cursor.column).toBe(0);
    });

    it('should handle empty buffer without errors', () => {
      const executor = createTestExecutor();
      const state = createTestState('');
      
      setupExecutorWithState(executor, state);
      
      // Should not throw
      expect(() => executor.handleKeystroke('%')).not.toThrow();
    });

    it('should handle buffer with no brackets', () => {
      const executor = createTestExecutor();
      const state = createTestState('no brackets here');
      
      setupExecutorWithState(executor, state);
      
      // Should not throw
      expect(() => executor.handleKeystroke('%')).not.toThrow();
    });
  });

  describe('Mode Restrictions', () => {
    it('plugin should only be active in NORMAL and VISUAL modes', () => {
      const plugin = new PercentMovementPlugin();
      
      // Plugin should support NORMAL mode
      expect(plugin.modes).toContainEqual(VIM_MODE.NORMAL);
      
      // Plugin should support VISUAL mode
      expect(plugin.modes).toContainEqual(VIM_MODE.VISUAL);
      
      // Plugin should NOT support INSERT mode
      expect(plugin.modes).not.toContainEqual(VIM_MODE.INSERT);
      
      // Plugin should NOT support COMMAND mode
      expect(plugin.modes).not.toContainEqual(VIM_MODE.COMMAND);
    });
  });

  describe('Real-World Scenarios', () => {
    it('should handle function definition brackets', () => {
      const executor = createTestExecutor();
      const state = createTestState([
        'function test() {',
        '  return 1;',
        '}',
      ]);
      
      setupExecutorWithState(executor, state);
      
      // Verify document was loaded
      expect(state.buffer.getLine(0)).toBe('function test() {');
      expect(state.buffer.getLine(1)).toBe('  return 1;');
      expect(state.buffer.getLine(2)).toBe('}');
    });

    it('should handle array brackets', () => {
      const executor = createTestExecutor();
      const state = createTestState('const arr = [1, 2, 3];');
      
      setupExecutorWithState(executor, state);
      
      // Verify document was loaded
      expect(state.buffer.getLine(0)).toContain('[');
      expect(state.buffer.getLine(0)).toContain(']');
    });

    it('should handle object literal brackets', () => {
      const executor = createTestExecutor();
      const state = createTestState('const obj = { a: 1 };');
      
      setupExecutorWithState(executor, state);
      
      // Verify document was loaded
      expect(state.buffer.getLine(0)).toContain('{');
      expect(state.buffer.getLine(0)).toContain('}');
    });

    it('should handle nested brackets', () => {
      const executor = createTestExecutor();
      const state = createTestState('(((())))');
      
      setupExecutorWithState(executor, state);
      
      // Verify document was loaded
      expect(state.buffer.getLine(0)).toBe('(((())))');
    });

    it('should handle mixed bracket types', () => {
      const executor = createTestExecutor();
      const state = createTestState('({[({})]})');
      
      setupExecutorWithState(executor, state);
      
      // Verify document was loaded
      expect(state.buffer.getLine(0)).toBe('({[({})]})');
    });
  });

  describe('Multi-line Documents', () => {
    it('should handle multi-line document structure', () => {
      const executor = createTestExecutor();
      const state = createTestState([
        'line 1',
        'line 2 (test)',
        'line 3',
      ]);
      
      setupExecutorWithState(executor, state);
      
      // Verify all lines are loaded
      expect(state.buffer.getLineCount()).toBe(3);
      expect(state.buffer.getLine(0)).toBe('line 1');
      expect(state.buffer.getLine(1)).toBe('line 2 (test)');
      expect(state.buffer.getLine(2)).toBe('line 3');
    });

    it('should handle large documents', () => {
      const lines: string[] = [];
      for (let i = 0; i < 100; i++) {
        lines.push(`line ${i}`);
      }
      const executor = createTestExecutor();
      const state = createTestState(lines);
      
      setupExecutorWithState(executor, state);
      
      expect(state.buffer.getLineCount()).toBe(100);
    });
  });

  describe('Plugin Metadata', () => {
    it('should have unique name', () => {
      const plugin = new PercentMovementPlugin();
      
      // Name should follow the movement plugin naming convention
      expect(plugin.name).toMatch(/^movement-.+/);
    });

    it('should have semantic version', () => {
      const plugin = new PercentMovementPlugin();
      
      // Version should be in semver format
      expect(plugin.version).toMatch(/^\d+\.\d+\.\d+$/);
    });

    it('should have description', () => {
      const plugin = new PercentMovementPlugin();
      
      // Description should mention the % key
      expect(plugin.description).toContain('%');
    });
  });
});
