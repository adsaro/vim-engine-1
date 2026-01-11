/**
 * LMovementPlugin Unit Tests
 * Tests for the right movement plugin (l key)
 */
import { LMovementPlugin } from '../../plugins/movement';
import { ExecutionContext } from '../../plugin/ExecutionContext';
import { VimState } from '../../state/VimState';
import { CursorPosition } from '../../state/CursorPosition';
import { VIM_MODE } from '../../state/VimMode';

describe('LMovementPlugin', () => {
  describe('Metadata', () => {
    it('should have correct name', () => {
      const plugin = new LMovementPlugin();
      expect(plugin.name).toBe('movement-l');
    });

    it('should have correct version', () => {
      const plugin = new LMovementPlugin();
      expect(plugin.version).toBe('1.0.0');
    });

    it('should have correct description', () => {
      const plugin = new LMovementPlugin();
      expect(plugin.description).toBe('Move cursor right (l key)');
    });

    it('should have correct pattern', () => {
      const plugin = new LMovementPlugin();
      expect(plugin.patterns).toEqual(['l']);
    });

    it('should support NORMAL and VISUAL modes', () => {
      const plugin = new LMovementPlugin();
      expect(plugin.modes).toContain(VIM_MODE.NORMAL);
      expect(plugin.modes).toContain(VIM_MODE.VISUAL);
      expect(plugin.modes).not.toContain(VIM_MODE.INSERT);
      expect(plugin.modes).not.toContain(VIM_MODE.COMMAND);
    });
  });

  describe('Configuration', () => {
    it('should have default step of 1', () => {
      const plugin = new LMovementPlugin();
      expect(plugin.getConfig().step).toBe(1);
    });

    it('should accept custom step configuration', () => {
      const plugin = new LMovementPlugin({ step: 5 });
      expect(plugin.getConfig().step).toBe(5);
    });

    it('should update configuration at runtime', () => {
      const plugin = new LMovementPlugin();
      plugin.updateConfig({ step: 3 });
      expect(plugin.getConfig().step).toBe(3);
    });

    it('should validate pattern correctly', () => {
      const plugin = new LMovementPlugin();
      expect(plugin.validatePattern('l')).toBe(true);
      expect(plugin.validatePattern('other')).toBe(false);
    });
  });

  describe('Movement Behavior', () => {
    it('should move cursor right by 1 column', () => {
      const plugin = new LMovementPlugin();
      const state = new VimState('hello');
      state.cursor = new CursorPosition(state.cursor.line, 2);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(3);
    });

    it('should move cursor right by step columns', () => {
      const plugin = new LMovementPlugin({ step: 2 });
      const state = new VimState('hello');
      state.cursor = new CursorPosition(state.cursor.line, 2);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(4);
    });

    it('should clamp to line length at right edge', () => {
      const plugin = new LMovementPlugin();
      const state = new VimState('hello');
      state.cursor = new CursorPosition(state.cursor.line, 5);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(5);
    });

    it('should not move beyond line length', () => {
      const plugin = new LMovementPlugin({ step: 10 });
      const state = new VimState('hi');
      state.cursor = new CursorPosition(state.cursor.line, 1);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(2);
    });

    it('should work with custom step size', () => {
      const plugin = new LMovementPlugin({ step: 3 });
      const state = new VimState('hello world');
      state.cursor = new CursorPosition(state.cursor.line, 3);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(6);
    });

    it('should clamp to line length with large step', () => {
      const plugin = new LMovementPlugin({ step: 100 });
      const state = new VimState('hi');
      state.cursor = new CursorPosition(state.cursor.line, 0);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(2);
    });
  });

  describe('Mode Restrictions', () => {
    it('should execute in NORMAL mode', () => {
      const plugin = new LMovementPlugin({ step: 2 });
      const state = new VimState('hello');
      state.cursor = new CursorPosition(state.cursor.line, 1);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(3);
    });

    it('should execute in VISUAL mode', () => {
      const plugin = new LMovementPlugin({ step: 2 });
      const state = new VimState('hello');
      state.cursor = new CursorPosition(state.cursor.line, 1);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.VISUAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(3);
    });

    it('should not execute in INSERT mode', () => {
      const plugin = new LMovementPlugin({ step: 2 });
      const state = new VimState('hello');
      state.cursor = new CursorPosition(state.cursor.line, 1);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.INSERT);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(1);
    });

    it('should not execute in COMMAND mode', () => {
      const plugin = new LMovementPlugin({ step: 2 });
      const state = new VimState('hello');
      state.cursor = new CursorPosition(state.cursor.line, 1);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.COMMAND);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty buffer', () => {
      const plugin = new LMovementPlugin();
      const state = new VimState();
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(0);
      expect(context.getCursor().column).toBe(0);
    });

    it('should handle single character line', () => {
      const plugin = new LMovementPlugin();
      const state = new VimState('x');
      state.cursor = new CursorPosition(state.cursor.line, 0);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(1);
    });

    it('should handle multiple step movements', () => {
      const plugin = new LMovementPlugin({ step: 2 });
      const state = new VimState('hello');
      state.cursor = new CursorPosition(state.cursor.line, 0);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);
      expect(context.getCursor().column).toBe(2);

      plugin.execute(context);
      expect(context.getCursor().column).toBe(4);

      // At end of line, should stay at 5
      plugin.execute(context);
      expect(context.getCursor().column).toBe(5);
    });

    it('should preserve line position', () => {
      const plugin = new LMovementPlugin();
      const state = new VimState('line1\nline2\nline3');
      state.cursor = new CursorPosition(1, 2);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(1);
      expect(context.getCursor().column).toBe(3);
    });

    it('should handle line with trailing spaces', () => {
      const plugin = new LMovementPlugin();
      const state = new VimState('word   ');
      state.cursor = new CursorPosition(state.cursor.line, 3);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(4);
    });

    it('should handle empty line', () => {
      const plugin = new LMovementPlugin();
      const state = new VimState('hello\n\nworld');
      state.cursor = new CursorPosition(1, 0);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(1);
      expect(context.getCursor().column).toBe(0);
    });

    it('should handle unicode characters', () => {
      const plugin = new LMovementPlugin();
      const state = new VimState('héllo');
      state.cursor = new CursorPosition(state.cursor.line, 0);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      // Each character is one column in our simple model
      expect(context.getCursor().column).toBe(1);
    });
  });
});
