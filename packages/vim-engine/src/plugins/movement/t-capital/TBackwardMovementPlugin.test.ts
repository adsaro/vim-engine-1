/**
 * Tests for TBackwardMovementPlugin
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { VimState } from '../../../state/VimState';
import { ExecutionContext } from '../../../plugin/ExecutionContext';
import { TBackwardMovementPlugin } from './TBackwardMovementPlugin';
import { CursorPosition } from '../../../state/CursorPosition';
import { VIM_MODE } from '../../../state/VimMode';

describe('TBackwardMovementPlugin', () => {
  let plugin: TBackwardMovementPlugin;
  let state: VimState;
  let context: ExecutionContext;

  beforeEach(() => {
    plugin = new TBackwardMovementPlugin();
    state = new VimState();
    context = new ExecutionContext(state);
  });

  describe('basic till backward search', () => {
    it('should move to just after character backward on current line', () => {
      state.buffer.setContent('hello world');
      state.cursor = new CursorPosition(0, 9); // At 'r'

      context.setCurrentPattern('To');
      plugin.execute(context);

      expect(state.cursor.column).toBe(8); // Position just after 'o' in 'world' (which is at 7)
    });

    it('should not move if character not found', () => {
      state.buffer.setContent('hello world');
      state.cursor = new CursorPosition(0, 9);

      context.setCurrentPattern('Tz');
      plugin.execute(context);

      expect(state.cursor.column).toBe(9);
    });

    it('should search from cursor position, not end of line', () => {
      state.buffer.setContent('hello world');
      state.cursor = new CursorPosition(0, 7); // At 'o' in 'world'

      context.setCurrentPattern('Tl');
      plugin.execute(context);

      // 'l' in 'hello' is at position 3, so we land at 4
      expect(state.cursor.column).toBe(4);
    });

    it('should move to position after the character, not on it', () => {
      state.buffer.setContent('function(arg1, arg2)');
      state.cursor = new CursorPosition(0, 15);

      context.setCurrentPattern('T(');
      plugin.execute(context);

      // The '(' is at position 8, so we should land at 9
      expect(state.cursor.column).toBe(9);
    });
  });

  describe('count handling', () => {
    it('should find till just after nth occurrence backward with count', () => {
      state.buffer.setContent('hello hello hello');
      state.cursor = new CursorPosition(0, 17); // Near end

      context.setCurrentPattern('Te');
      context.setCount(2);
      plugin.execute(context);

      // Second 'e' going backward is at position 7, so we land at 8
      expect(state.cursor.column).toBe(8);
    });

    it('should not move if nth occurrence not found', () => {
      state.buffer.setContent('hello world');
      state.cursor = new CursorPosition(0, 9);

      context.setCurrentPattern('To');
      context.setCount(5);
      plugin.execute(context);

      expect(state.cursor.column).toBe(9);
    });
  });

  describe('edge cases', () => {
    it('should handle empty line', () => {
      state.buffer.setContent('');
      state.cursor = new CursorPosition(0, 0);

      context.setCurrentPattern('Ta');
      plugin.execute(context);

      expect(state.cursor.column).toBe(0);
    });

    it('should handle till just after space', () => {
      state.buffer.setContent('hello world');
      state.cursor = new CursorPosition(0, 8);

      context.setCurrentPattern('T ');
      plugin.execute(context);

      expect(state.cursor.column).toBe(6); // Position just after space at 5
    });

    it('should handle special characters', () => {
      state.buffer.setContent('hello,world');
      state.cursor = new CursorPosition(0, 10);

      context.setCurrentPattern('T,');
      plugin.execute(context);

      expect(state.cursor.column).toBe(6); // Position just after ',' at 5
    });

    it('should not move if at start of line', () => {
      state.buffer.setContent('hello');
      state.cursor = new CursorPosition(0, 0);

      context.setCurrentPattern('Th');
      plugin.execute(context);

      expect(state.cursor.column).toBe(0);
    });
  });

  describe('search state storage', () => {
    it('should store last character search', () => {
      state.buffer.setContent('hello world');
      state.cursor = new CursorPosition(0, 9);

      context.setCurrentPattern('To');
      plugin.execute(context);

      const lastSearch = state.getLastCharSearch();
      expect(lastSearch).toEqual({ char: 'o', direction: 'backward' });
    });

    it('should store search even when not found', () => {
      state.buffer.setContent('hello world');
      state.cursor = new CursorPosition(0, 9);

      context.setCurrentPattern('Tz');
      plugin.execute(context);

      const lastSearch = state.getLastCharSearch();
      expect(lastSearch).toEqual({ char: 'z', direction: 'backward' });
    });
  });

  describe('pattern generation', () => {
    it('should generate patterns for all printable characters', () => {
      expect(plugin.patterns).toContain('Ta');
      expect(plugin.patterns).toContain('TZ');
      expect(plugin.patterns).toContain('T0');
      expect(plugin.patterns).toContain('T ');
      expect(plugin.patterns).toContain('T!');
    });

    it('should have at least 95 patterns (printable ASCII)', () => {
      expect(plugin.patterns.length).toBeGreaterThanOrEqual(95);
    });
  });

  describe('plugin metadata', () => {
    it('should have correct name', () => {
      expect(plugin.name).toBe('movement-T');
    });

    it('should have correct description', () => {
      expect(plugin.description).toBe('Till character backward (T{char})');
    });

    it('should be active in normal and visual modes', () => {
      expect(plugin.modes).toContain(VIM_MODE.NORMAL);
      expect(plugin.modes).toContain(VIM_MODE.VISUAL);
    });
  });

  describe('difference from F command', () => {
    it('should land after character, not on it (unlike F)', () => {
      state.buffer.setContent('hello world');
      state.cursor = new CursorPosition(0, 6); // At 'w'

      context.setCurrentPattern('Tl');
      plugin.execute(context);

      // 'l' in 'hello' is at position 3, so T{l} should land at 4 (after it)
      expect(state.cursor.column).toBe(4);
    });
  });
});
