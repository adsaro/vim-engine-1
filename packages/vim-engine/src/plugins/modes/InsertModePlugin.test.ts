/**
 * InsertModePlugin Tests
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { InsertModePlugin } from './InsertModePlugin';
import { ExecutionContext } from '../../plugin/ExecutionContext';
import { VimState } from '../../state/VimState';
import { VIM_MODE } from '../../state/VimMode';

describe('InsertModePlugin', () => {
  let plugin: InsertModePlugin;
  let context: ExecutionContext;
  let state: VimState;

  beforeEach(() => {
    plugin = new InsertModePlugin();
    state = new VimState('Hello\nWorld');
    context = new ExecutionContext(state);
  });

  describe('plugin metadata', () => {
    it('should have correct name', () => {
      expect(plugin.name).toBe('mode-insert');
    });

    it('should have correct version', () => {
      expect(plugin.version).toBe('1.0.0');
    });

    it('should have correct description', () => {
      expect(plugin.description).toBe('Enter insert mode (i key)');
    });

    it('should have i pattern', () => {
      expect(plugin.patterns).toContain('i');
    });

    it('should support NORMAL mode only', () => {
      expect(plugin.modes).toContain('NORMAL');
      expect(plugin.modes.length).toBe(1);
    });
  });

  describe('entering insert mode', () => {
    it('should switch from normal mode to insert mode', () => {
      // Start in normal mode
      expect(context.getMode()).toBe(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getMode()).toBe(VIM_MODE.INSERT);
    });

    it('should not change cursor position when entering insert mode', () => {
      // Set cursor to a specific position
      state.cursor = { line: 0, column: 3, clone: () => state.cursor };

      plugin.execute(context);

      expect(state.cursor.line).toBe(0);
      expect(state.cursor.column).toBe(3);
    });

    it('should not work when already in insert mode', () => {
      // Start in insert mode
      context.setMode(VIM_MODE.INSERT);

      // Plugin should not execute in insert mode
      expect(plugin.canExecute(context)).toBe(false);
    });

    it('should not work in visual mode', () => {
      context.setMode(VIM_MODE.VISUAL);
      expect(plugin.canExecute(context)).toBe(false);
    });

    it('should not work in command mode', () => {
      context.setMode(VIM_MODE.COMMAND);
      expect(plugin.canExecute(context)).toBe(false);
    });
  });

  describe('pattern validation', () => {
    it('should validate i pattern', () => {
      expect(plugin.validatePattern('i')).toBe(true);
    });

    it('should not validate other patterns', () => {
      expect(plugin.validatePattern('a')).toBe(false);
      expect(plugin.validatePattern('I')).toBe(false);
      expect(plugin.validatePattern('o')).toBe(false);
      expect(plugin.validatePattern('x')).toBe(false);
    });
  });
});
