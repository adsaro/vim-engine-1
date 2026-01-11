/**
 * JMovementPlugin Unit Tests
 * Tests for the down movement plugin (j key)
 */
import { JMovementPlugin } from '../../plugins/movement';
import { ExecutionContext } from '../../plugin/ExecutionContext';
import { VimState } from '../../state/VimState';
import { CursorPosition } from '../../state/CursorPosition';
import { VIM_MODE } from '../../state/VimMode';

describe('JMovementPlugin', () => {
  describe('Metadata', () => {
    it('should have correct name', () => {
      const plugin = new JMovementPlugin();
      expect(plugin.name).toBe('movement-j');
    });

    it('should have correct version', () => {
      const plugin = new JMovementPlugin();
      expect(plugin.version).toBe('1.0.0');
    });

    it('should have correct description', () => {
      const plugin = new JMovementPlugin();
      expect(plugin.description).toBe('Move cursor down (j key)');
    });

    it('should have correct pattern', () => {
      const plugin = new JMovementPlugin();
      expect(plugin.patterns).toEqual(['j']);
    });

    it('should support NORMAL and VISUAL modes', () => {
      const plugin = new JMovementPlugin();
      expect(plugin.modes).toContain(VIM_MODE.NORMAL);
      expect(plugin.modes).toContain(VIM_MODE.VISUAL);
      expect(plugin.modes).not.toContain(VIM_MODE.INSERT);
      expect(plugin.modes).not.toContain(VIM_MODE.COMMAND);
    });
  });

  describe('Configuration', () => {
    it('should have default step of 1', () => {
      const plugin = new JMovementPlugin();
      expect(plugin.getConfig().step).toBe(1);
    });

    it('should accept custom step configuration', () => {
      const plugin = new JMovementPlugin({ step: 5 });
      expect(plugin.getConfig().step).toBe(5);
    });

    it('should update configuration at runtime', () => {
      const plugin = new JMovementPlugin();
      plugin.updateConfig({ step: 3 });
      expect(plugin.getConfig().step).toBe(3);
    });

    it('should validate pattern correctly', () => {
      const plugin = new JMovementPlugin();
      expect(plugin.validatePattern('j')).toBe(true);
      expect(plugin.validatePattern('other')).toBe(false);
    });
  });

  describe('Movement Behavior', () => {
    it('should move cursor down by 1 line', () => {
      const plugin = new JMovementPlugin();
      const state = new VimState('line1\nline2\nline3');
      state.cursor = new CursorPosition(0, 2);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(1);
      expect(context.getCursor().column).toBe(2);
    });

    it('should move cursor down by step lines', () => {
      const plugin = new JMovementPlugin({ step: 2 });
      const state = new VimState('line1\nline2\nline3');
      state.cursor = new CursorPosition(0, 2);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(2);
      expect(context.getCursor().column).toBe(2);
    });

    it('should clamp to last line when at bottom', () => {
      const plugin = new JMovementPlugin();
      const state = new VimState('line1\nline2\nline3');
      state.cursor = new CursorPosition(2, 2);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(2);
    });

    it('should not move beyond last line', () => {
      const plugin = new JMovementPlugin({ step: 10 });
      const state = new VimState('line1\nline2\nline3');
      state.cursor = new CursorPosition(1, 2);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(2);
    });

    it('should preserve column within bounds', () => {
      const plugin = new JMovementPlugin();
      const state = new VimState('line1\nab');
      state.cursor = new CursorPosition(0, 5); // Beyond line2 length
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(1);
      expect(context.getCursor().column).toBe(2); // Clamped to line2 length
    });

    it('should work with custom step size', () => {
      const plugin = new JMovementPlugin({ step: 3 });
      const state = new VimState('line1\nline2\nline3\nline4\nline5');
      state.cursor = new CursorPosition(0, 1);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(3);
    });
  });

  describe('Mode Restrictions', () => {
    it('should execute in NORMAL mode', () => {
      const plugin = new JMovementPlugin({ step: 2 });
      const state = new VimState('line1\nline2\nline3');
      state.cursor = new CursorPosition(0, 1);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(2);
    });

    it('should execute in VISUAL mode', () => {
      const plugin = new JMovementPlugin({ step: 2 });
      const state = new VimState('line1\nline2\nline3');
      state.cursor = new CursorPosition(0, 1);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.VISUAL);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(2);
    });

    it('should not execute in INSERT mode', () => {
      const plugin = new JMovementPlugin({ step: 2 });
      const state = new VimState('line1\nline2\nline3');
      state.cursor = new CursorPosition(0, 1);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.INSERT);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(0);
    });

    it('should not execute in COMMAND mode', () => {
      const plugin = new JMovementPlugin({ step: 2 });
      const state = new VimState('line1\nline2\nline3');
      state.cursor = new CursorPosition(0, 1);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.COMMAND);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty buffer', () => {
      const plugin = new JMovementPlugin();
      const state = new VimState();
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(0);
      expect(context.getCursor().column).toBe(0);
    });

    it('should handle single line buffer', () => {
      const plugin = new JMovementPlugin();
      const state = new VimState('single line');
      state.cursor = new CursorPosition(0, 3);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(0);
      expect(context.getCursor().column).toBe(3);
    });

    it('should handle multiple step movements', () => {
      const plugin = new JMovementPlugin({ step: 1 });
      const state = new VimState('line1\nline2\nline3\nline4\nline5');
      state.cursor = new CursorPosition(0, 1);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);
      expect(context.getCursor().line).toBe(1);

      plugin.execute(context);
      expect(context.getCursor().line).toBe(2);

      plugin.execute(context);
      expect(context.getCursor().line).toBe(3);
    });

    it('should handle lines of different lengths', () => {
      const plugin = new JMovementPlugin();
      const state = new VimState('long line here\nshort\nmedium length');
      state.cursor = new CursorPosition(0, 10);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(1);
      expect(context.getCursor().column).toBe(5); // Clamped to 'short' length
    });

    it('should handle moving to shorter line then back', () => {
      const plugin = new JMovementPlugin();
      const state = new VimState('line1\nab\nline3');
      state.cursor = new CursorPosition(0, 3);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      // Move to shorter line
      plugin.execute(context);
      expect(context.getCursor().line).toBe(1);
      expect(context.getCursor().column).toBe(2);

      // Move back to longer line - column should be preserved if within bounds
      plugin.execute(context);
      expect(context.getCursor().line).toBe(2);
      expect(context.getCursor().column).toBe(3);
    });
  });
});
