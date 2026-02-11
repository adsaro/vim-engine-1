/**
 * Inside Curly Brace Integration Tests
 *
 * Tests for verifying integration of the i{ text object with operators
 * through the VimExecutor.
 */
import {
  createTestExecutor,
  createTestState,
  setupExecutorWithState,
} from '../integration.test.utils';
import { VIM_MODE } from '../../src/state/VimMode';
import { CursorPosition } from '../../src/state/CursorPosition';
import { InsideCurlyBraceTextObject } from '../../src/plugins/textobjects/i-curly/InsideCurlyBraceTextObject';
import { DeleteOperatorPlugin } from '../../src/plugins/operators/delete/DeleteOperatorPlugin';
import { PluginRegistry } from '../../src/plugin/PluginRegistry';

describe('Integration: Inside Curly Brace Text Object (i{)', () => {
  describe('Plugin Registration', () => {
    it('should register InsideCurlyBraceTextObject in PluginRegistry', () => {
      const registry = new PluginRegistry();
      const plugin = new InsideCurlyBraceTextObject();

      registry.register(plugin);

      expect(registry.getPlugin('textobject-i-curly')).toBeDefined();
    });

    it('should have correct metadata for registered plugin', () => {
      const plugin = new InsideCurlyBraceTextObject();

      expect(plugin.name).toBe('textobject-i-curly');
      expect(plugin.version).toBe('1.0.0');
      expect(plugin.patterns).toContain('i{');
      expect(plugin.modes).toContain(VIM_MODE.OPERATOR_PENDING);
      expect(plugin.modes).toContain(VIM_MODE.VISUAL);
    });

    it('should not register in INSERT or COMMAND modes', () => {
      const plugin = new InsideCurlyBraceTextObject();

      expect(plugin.modes).not.toContain(VIM_MODE.INSERT);
      expect(plugin.modes).not.toContain(VIM_MODE.COMMAND);
    });
  });

  describe('Text Object Boundaries', () => {
    it('should calculate correct boundaries for simple content', () => {
      const executor = createTestExecutor();
      const state = createTestState('{hello world}');
      setupExecutorWithState(executor, state);

      // Move cursor to middle
      state.cursor = new CursorPosition(0, 7);

      // Get the plugin
      const plugin = new InsideCurlyBraceTextObject();
      const context = executor.getExecutionContext();

      const boundaries = plugin.getWordBoundaries(context);

      expect(boundaries).not.toBeNull();
      expect(boundaries?.start.line).toBe(0);
      expect(boundaries?.start.column).toBe(1); // After '{'
      expect(boundaries?.end.line).toBe(0);
      expect(boundaries?.end.column).toBe(12); // Before '}'
    });

    it('should handle multi-line curly braces', () => {
      const executor = createTestExecutor();
      const state = createTestState([
        '{',
        '  hello world',
        '}',
      ]);
      setupExecutorWithState(executor, state);

      state.cursor = new CursorPosition(1, 5);

      const plugin = new InsideCurlyBraceTextObject();
      const context = executor.getExecutionContext();

      const boundaries = plugin.getWordBoundaries(context);

      expect(boundaries).not.toBeNull();
      expect(boundaries?.start.line).toBe(0);
      expect(boundaries?.start.column).toBe(1);
      expect(boundaries?.end.line).toBe(2);
      expect(boundaries?.end.column).toBe(0);
    });

    it('should find innermost pair for nested braces', () => {
      const executor = createTestExecutor();
      const state = createTestState('{outer {inner}}');
      setupExecutorWithState(executor, state);

      // Cursor inside "inner"
      state.cursor = new CursorPosition(0, 10);

      const plugin = new InsideCurlyBraceTextObject();
      const context = executor.getExecutionContext();

      const boundaries = plugin.getWordBoundaries(context);

      expect(boundaries).not.toBeNull();
      // Should find the inner braces
      expect(boundaries?.start.column).toBe(8); // After inner '{'
      expect(boundaries?.end.column).toBe(13); // Before inner '}'
    });
  });

  describe('Operator Integration', () => {
    it('should work with delete operator', () => {
      const executor = createTestExecutor();
      const state = createTestState('{hello world}');
      setupExecutorWithState(executor, state);

      // Register the plugins
      executor.registerPlugin(new DeleteOperatorPlugin());
      executor.registerPlugin(new InsideCurlyBraceTextObject());

      // Cursor inside the braces
      state.cursor = new CursorPosition(0, 7);

      // Verify initial state
      expect(state.buffer.getLine(0)).toBe('{hello world}');

      // Simulate 'di{' - first press 'd'
      executor.handleKeystroke('d');
      expect(executor.getCurrentMode()).toBe(VIM_MODE.OPERATOR_PENDING);

      // Then press 'i{' (as a combined keystroke)
      executor.handleKeystroke('i{')

      // Should be back in normal mode
      expect(executor.getCurrentMode()).toBe(VIM_MODE.NORMAL);

      // Content inside braces should be deleted
      expect(state.buffer.getLine(0)).toBe('{}');
    });

    it('should handle real-world code scenario', () => {
      const executor = createTestExecutor();
      const state = createTestState('const obj = { name: "test" };');
      setupExecutorWithState(executor, state);

      executor.registerPlugin(new DeleteOperatorPlugin());
      executor.registerPlugin(new InsideCurlyBraceTextObject());

      // Cursor on the value
      state.cursor = new CursorPosition(0, 20);

      // Simulate 'di{'
      executor.handleKeystroke('d');
      executor.handleKeystroke('i{')

      // Content inside braces should be deleted, leaving just '{}'
      expect(state.buffer.getLine(0)).toBe('const obj = {};');
    });

    it('should handle function body deletion', () => {
      const executor = createTestExecutor();
      const state = createTestState([
        'function test() {',
        '  return 42;',
        '}',
      ]);
      setupExecutorWithState(executor, state);

      executor.registerPlugin(new DeleteOperatorPlugin());
      executor.registerPlugin(new InsideCurlyBraceTextObject());

      // Cursor inside the function body
      state.cursor = new CursorPosition(1, 5);

      // Simulate 'di{'
      executor.handleKeystroke('d');
      executor.handleKeystroke('i{')

      // Check result - should be empty braces on first line with function definition
      const result = state.buffer.getLine(0);
      expect(result).toBe('function test() {}');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty buffer without errors', () => {
      const executor = createTestExecutor();
      const state = createTestState('');
      setupExecutorWithState(executor, state);

      executor.registerPlugin(new InsideCurlyBraceTextObject());

      const plugin = new InsideCurlyBraceTextObject();
      const context = executor.getExecutionContext();

      const boundaries = plugin.getWordBoundaries(context);

      expect(boundaries).toBeNull();
    });

    it('should return null when cursor is outside braces', () => {
      const executor = createTestExecutor();
      const state = createTestState('hello {world}');
      setupExecutorWithState(executor, state);

      // Cursor before the opening brace
      state.cursor = new CursorPosition(0, 2);

      const plugin = new InsideCurlyBraceTextObject();
      const context = executor.getExecutionContext();

      const boundaries = plugin.getWordBoundaries(context);

      expect(boundaries).toBeNull();
    });

    it('should handle unbalanced braces gracefully', () => {
      const executor = createTestExecutor();
      const state = createTestState('{hello world');
      setupExecutorWithState(executor, state);

      state.cursor = new CursorPosition(0, 5);

      const plugin = new InsideCurlyBraceTextObject();
      const context = executor.getExecutionContext();

      const boundaries = plugin.getWordBoundaries(context);

      expect(boundaries).toBeNull();
    });

    it('should handle deeply nested structures', () => {
      const executor = createTestExecutor();
      const state = createTestState('{{{{inner}}}}');
      setupExecutorWithState(executor, state);

      // Cursor on "n" in "inner" (position 5)
      state.cursor = { line: 0, column: 5, _desiredColumn: 5 };

      const plugin = new InsideCurlyBraceTextObject();
      const context = executor.getExecutionContext();

      const boundaries = plugin.getWordBoundaries(context);

      expect(boundaries).not.toBeNull();
      // Should find the innermost pair (positions 3-9)
      // Inner content boundaries: 4 (after '{') to 9 (before '}')
      expect(boundaries?.start.column).toBe(4);
      expect(boundaries?.end.column).toBe(9);
    });
  });

  describe('Plugin Metadata', () => {
    it('should have unique name', () => {
      const plugin = new InsideCurlyBraceTextObject();

      // Name should follow the textobject plugin naming convention
      expect(plugin.name).toMatch(/^textobject-.+/);
    });

    it('should have semantic version', () => {
      const plugin = new InsideCurlyBraceTextObject();

      // Version should be in semver format
      expect(plugin.version).toMatch(/^\d+\.\d+\.\d+$/);
    });

    it('should have description mentioning curly brace', () => {
      const plugin = new InsideCurlyBraceTextObject();

      // Description should mention the i{ key
      expect(plugin.description).toContain('i{');
    });
  });
});


