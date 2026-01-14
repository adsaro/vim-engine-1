/**
 * PercentMovementPlugin Unit Tests
 * Tests for the % key movement plugin (jump to matching bracket)
 */
import { PercentMovementPlugin } from './PercentMovementPlugin';
import { ExecutionContext } from '../../../plugin/ExecutionContext';
import { VimState } from '../../../state/VimState';
import { CursorPosition } from '../../../state/CursorPosition';
import { VIM_MODE } from '../../../state/VimMode';

describe('PercentMovementPlugin', () => {
  describe('Metadata', () => {
    it('should have correct name', () => {
      const plugin = new PercentMovementPlugin();
      expect(plugin.name).toBe('movement-percent');
    });

    it('should have correct version', () => {
      const plugin = new PercentMovementPlugin();
      expect(plugin.version).toBe('1.0.0');
    });

    it('should have correct description', () => {
      const plugin = new PercentMovementPlugin();
      expect(plugin.description).toBe('Jump to matching bracket (% key)');
    });

    it('should have correct pattern', () => {
      const plugin = new PercentMovementPlugin();
      expect(plugin.patterns).toEqual(['%']);
    });

    it('should support NORMAL and VISUAL modes', () => {
      const plugin = new PercentMovementPlugin();
      expect(plugin.modes).toContain(VIM_MODE.NORMAL);
      expect(plugin.modes).toContain(VIM_MODE.VISUAL);
      expect(plugin.modes).not.toContain(VIM_MODE.INSERT);
      expect(plugin.modes).not.toContain(VIM_MODE.COMMAND);
    });

    it('should validate pattern correctly', () => {
      const plugin = new PercentMovementPlugin();
      expect(plugin.validatePattern('%')).toBe(true);
      expect(plugin.validatePattern('other')).toBe(false);
    });
  });

  describe('Basic Movement', () => {
    it('should jump from opening ( to closing )', () => {
      const plugin = new PercentMovementPlugin();
      const state = new VimState('(hello)');
      state.cursor = new CursorPosition(0, 0);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(6);
      expect(context.getCursor().line).toBe(0);
    });

    it('should jump from closing ) to opening (', () => {
      const plugin = new PercentMovementPlugin();
      const state = new VimState('(hello)');
      state.cursor = new CursorPosition(0, 6);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(0);
      expect(context.getCursor().line).toBe(0);
    });

    it('should jump from opening [ to closing ]', () => {
      const plugin = new PercentMovementPlugin();
      const state = new VimState('[hello]');
      state.cursor = new CursorPosition(0, 0);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(6);
    });

    it('should jump from closing ] to opening [', () => {
      const plugin = new PercentMovementPlugin();
      const state = new VimState('[hello]');
      state.cursor = new CursorPosition(0, 6);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(0);
    });

    it('should jump from opening { to closing }', () => {
      const plugin = new PercentMovementPlugin();
      const state = new VimState('{hello}');
      state.cursor = new CursorPosition(0, 0);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(6);
    });

    it('should jump from closing } to opening {', () => {
      const plugin = new PercentMovementPlugin();
      const state = new VimState('{hello}');
      state.cursor = new CursorPosition(0, 6);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(0);
    });

    it('should jump from opening < to closing >', () => {
      const plugin = new PercentMovementPlugin();
      const state = new VimState('<hello>');
      state.cursor = new CursorPosition(0, 0);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(6);
    });

    it('should jump from closing > to opening <', () => {
      const plugin = new PercentMovementPlugin();
      const state = new VimState('<hello>');
      state.cursor = new CursorPosition(0, 6);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(0);
    });

    it('should jump from any position on bracket character', () => {
      const plugin = new PercentMovementPlugin();
      const state = new VimState('(hello)');
      // Cursor on '(' but not at position 0
      state.cursor = new CursorPosition(0, 0);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(6);
    });
  });

  describe('Nested Bracket Tests', () => {
    it('should handle single level nesting: (())', () => {
      const plugin = new PercentMovementPlugin();
      const state = new VimState('(())');
      state.cursor = new CursorPosition(0, 0);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(3);
    });

    it('should jump between outer brackets in nested structure', () => {
      const plugin = new PercentMovementPlugin();
      const state = new VimState('(())');
      state.cursor = new CursorPosition(0, 3);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(0);
    });

    it('should handle multiple levels: (((())))', () => {
      const plugin = new PercentMovementPlugin();
      const state = new VimState('(((())))');
      state.cursor = new CursorPosition(0, 0);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(7);
    });

    it('should handle mixed bracket types: ({[]})', () => {
      const plugin = new PercentMovementPlugin();
      const state = new VimState('({[]})');
      state.cursor = new CursorPosition(0, 0);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(5);
    });

    it('should handle deep nesting (10+ levels)', () => {
      const plugin = new PercentMovementPlugin();
      const nested = '('.repeat(10) + ')'.repeat(10);
      const state = new VimState(nested);
      state.cursor = new CursorPosition(0, 0);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(19);
    });

    it('should find matching close bracket at deep nesting', () => {
      const plugin = new PercentMovementPlugin();
      const nested = '('.repeat(10) + ')'.repeat(10);
      const state = new VimState(nested);
      state.cursor = new CursorPosition(0, 19);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(0);
    });
  });

  describe('Multi-Line Tests', () => {
    it('should handle brackets spanning multiple lines', () => {
      const plugin = new PercentMovementPlugin();
      const state = new VimState('(\n  hello\n)');
      state.cursor = new CursorPosition(0, 0);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(2);
      expect(context.getCursor().column).toBe(0);
    });

    it('should match opening bracket to closing across lines', () => {
      const plugin = new PercentMovementPlugin();
      // 'function() {' - cursor on '{' at position 10
      const state = new VimState('function() {\n  return true;\n}');
      state.cursor = new CursorPosition(0, 10);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(2);
      expect(context.getCursor().column).toBe(0);
    });

    it('should match closing bracket to opening across lines', () => {
      const plugin = new PercentMovementPlugin();
      // 'function() {' has '{' at position 10 (0-indexed)
      // '}' at line 2, column 0 should match to '{' at line 0, column 10
      const state = new VimState('function() {\n  return true;\n}');
      state.cursor = new CursorPosition(2, 0);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(0);
      expect(context.getCursor().column).toBe(11);
    });

    it('should handle nested brackets across lines', () => {
      const plugin = new PercentMovementPlugin();
      const state = new VimState('(\n  (\n    inner\n  )\n)');
      state.cursor = new CursorPosition(0, 0);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(4);
      expect(context.getCursor().column).toBe(0);
    });

    it('should handle matching inner brackets across lines', () => {
      const plugin = new PercentMovementPlugin();
      const state = new VimState('(\n  (\n    inner\n  )\n)');
      state.cursor = new CursorPosition(1, 2);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(3);
      expect(context.getCursor().column).toBe(2);
    });
  });

  describe('Edge Case Tests', () => {
    it('should stay at cursor when not on bracket and no bracket found', () => {
      const plugin = new PercentMovementPlugin();
      const state = new VimState('hello world');
      state.cursor = new CursorPosition(0, 5);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(5);
      expect(context.getCursor().line).toBe(0);
    });

    it('should search forward and find next bracket when not on bracket', () => {
      const plugin = new PercentMovementPlugin();
      const state = new VimState('hello (world)');
      state.cursor = new CursorPosition(0, 6);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(12);
    });

    it('should stay at cursor for unmatched opening bracket', () => {
      const plugin = new PercentMovementPlugin();
      const state = new VimState('(unclosed');
      state.cursor = new CursorPosition(0, 0);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(0);
    });

    it('should stay at cursor for unmatched closing bracket', () => {
      const plugin = new PercentMovementPlugin();
      const state = new VimState('unmatched)');
      state.cursor = new CursorPosition(0, 9);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(9);
    });

    it('should handle empty buffer', () => {
      const plugin = new PercentMovementPlugin();
      const state = new VimState();
      state.cursor = new CursorPosition(0, 0);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(0);
      expect(context.getCursor().column).toBe(0);
    });

    it('should handle single line with no brackets', () => {
      const plugin = new PercentMovementPlugin();
      const state = new VimState('no brackets here');
      state.cursor = new CursorPosition(0, 5);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(5);
    });

    it('should handle cursor at end of line on bracket', () => {
      const plugin = new PercentMovementPlugin();
      const state = new VimState('()');
      state.cursor = new CursorPosition(0, 1);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(0);
    });

    it('should handle empty brackets', () => {
      const plugin = new PercentMovementPlugin();
      const state = new VimState('()');
      state.cursor = new CursorPosition(0, 0);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(1);
    });
  });

  describe('Mode Restriction Tests', () => {
    it('should execute in NORMAL mode', () => {
      const plugin = new PercentMovementPlugin();
      const state = new VimState('(test)');
      state.cursor = new CursorPosition(0, 0);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(5);
    });

    it('should execute in VISUAL mode', () => {
      const plugin = new PercentMovementPlugin();
      const state = new VimState('(test)');
      state.cursor = new CursorPosition(0, 0);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.VISUAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(5);
    });

    it('should not execute in INSERT mode', () => {
      const plugin = new PercentMovementPlugin();
      const state = new VimState('(test)');
      state.cursor = new CursorPosition(0, 0);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.INSERT);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(0);
    });

    it('should not execute in COMMAND mode', () => {
      const plugin = new PercentMovementPlugin();
      const state = new VimState('(test)');
      state.cursor = new CursorPosition(0, 0);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.COMMAND);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(0);
    });
  });

  describe('Configuration', () => {
    it('should have default movement config', () => {
      const plugin = new PercentMovementPlugin();
      const config = plugin.getConfig();

      expect(config.step).toBe(1);
      expect(config.allowWrap).toBe(false);
      expect(config.scrollOnEdge).toBe(false);
      expect(config.visualModeEnabled).toBe(true);
    });

    it('should accept custom config', () => {
      const plugin = new PercentMovementPlugin();
      plugin.updateConfig({ step: 2, allowWrap: true });

      const config = plugin.getConfig();
      expect(config.step).toBe(2);
      expect(config.allowWrap).toBe(true);
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle multiple bracket pairs on same line', () => {
      const plugin = new PercentMovementPlugin();
      const state = new VimState('(first) and (second)');
      state.cursor = new CursorPosition(0, 0);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(6);
    });

    it('should handle mixed nesting with different bracket types', () => {
      const plugin = new PercentMovementPlugin();
      // '[({})]' - opening '[' at 0, closing ']' at 5
      const state = new VimState('[({})]');
      state.cursor = new CursorPosition(0, 0);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(5);
    });

    it('should handle complex nested structure', () => {
      const plugin = new PercentMovementPlugin();
      // '[(a + b) * (c - d)]' - opening '[' at 0, closing ']' at 18
      const state = new VimState('[(a + b) * (c - d)]');
      state.cursor = new CursorPosition(0, 0);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(18);
    });

    it('should find next bracket when cursor is on text between brackets', () => {
      const plugin = new PercentMovementPlugin();
      // 'text (bracket) more text' - opening '(' at 5, closing ')' at 13
      const state = new VimState('text (bracket) more text');
      state.cursor = new CursorPosition(0, 2);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(13);
    });

    it('should stay at position when cursor is on text and no brackets exist', () => {
      const plugin = new PercentMovementPlugin();
      const state = new VimState('just some text without any brackets');
      state.cursor = new CursorPosition(0, 5);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(5);
    });
  });
});
