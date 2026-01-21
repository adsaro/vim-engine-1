/**
 * Tests for TForwardMovementPlugin
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { VimState } from '../../../state/VimState';
import { ExecutionContext } from '../../../plugin/ExecutionContext';
import { TForwardMovementPlugin } from './TForwardMovementPlugin';
import { CursorPosition } from '../../../state/CursorPosition';
import { VIM_MODE } from '../../../state/VimMode';

describe('TForwardMovementPlugin', () => {
  let plugin: TForwardMovementPlugin;
  let state: VimState;
  let context: ExecutionContext;

  beforeEach(() => {
    plugin = new TForwardMovementPlugin();
    state = new VimState();
    context = new ExecutionContext(state);
  });

  describe('basic till forward search', () => {
    it('should move to just before character forward on current line', () => {
      state.buffer.setContent('hello world');
      state.cursor = new CursorPosition(0, 0);

      context.setCurrentPattern('to');
      plugin.execute(context);

      expect(state.cursor.column).toBe(3); // Position just before 'o' in 'hello' (which is at 4)
    });

    it('should not move if character not found', () => {
      state.buffer.setContent('hello world');
      state.cursor = new CursorPosition(0, 0);

      context.setCurrentPattern('tz');
      plugin.execute(context);

      expect(state.cursor.column).toBe(0);
    });

    it('should search from cursor position, not start of line', () => {
      state.buffer.setContent('hello world');
      state.cursor = new CursorPosition(0, 2); // At 'l'

      context.setCurrentPattern('to');
      plugin.execute(context);

      expect(state.cursor.column).toBe(3); // Position just before 'o' in 'hello'
    });

    it('should move to position before the character, not on it', () => {
      state.buffer.setContent('function(arg1, arg2)');
      state.cursor = new CursorPosition(0, 0);

      context.setCurrentPattern('t(');
      plugin.execute(context);

      // The '(' is at position 8, so we should land at 7
      expect(state.cursor.column).toBe(7);
    });
  });

  describe('count handling', () => {
    it('should find till before nth occurrence with count', () => {
      state.buffer.setContent('hello hello world');
      state.cursor = new CursorPosition(0, 0);

      context.setCurrentPattern('te');
      context.setCount(2);
      plugin.execute(context);

      // Second 'e' is at position 7, so we should land at 6
      expect(state.cursor.column).toBe(6);
    });

    it('should not move if nth occurrence not found', () => {
      state.buffer.setContent('hello world');
      state.cursor = new CursorPosition(0, 0);

      context.setCurrentPattern('to');
      context.setCount(5);
      plugin.execute(context);

      expect(state.cursor.column).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('should handle empty line', () => {
      state.buffer.setContent('');
      state.cursor = new CursorPosition(0, 0);

      context.setCurrentPattern('ta');
      plugin.execute(context);

      expect(state.cursor.column).toBe(0);
    });

    it('should handle till before space', () => {
      state.buffer.setContent('hello world');
      state.cursor = new CursorPosition(0, 0);

      context.setCurrentPattern('t ');
      plugin.execute(context);

      expect(state.cursor.column).toBe(4); // Position just before space at 5
    });

    it('should handle special characters', () => {
      state.buffer.setContent('hello,world');
      state.cursor = new CursorPosition(0, 0);

      context.setCurrentPattern('t,');
      plugin.execute(context);

      expect(state.cursor.column).toBe(4); // Position just before ',' at 5
    });

    it('should not move if character is immediately after cursor', () => {
      state.buffer.setContent('hello');
      state.cursor = new CursorPosition(0, 0);

      context.setCurrentPattern('th');
      plugin.execute(context);

      // 'h' is at position 0, searching from position 1, won't find another
      expect(state.cursor.column).toBe(0);
    });
  });

  describe('search state storage', () => {
    it('should store last character search', () => {
      state.buffer.setContent('hello world');
      state.cursor = new CursorPosition(0, 0);

      context.setCurrentPattern('to');
      plugin.execute(context);

      const lastSearch = state.getLastCharSearch();
      expect(lastSearch).toEqual({ char: 'o', direction: 'forward', type: 'till' });
    });

    it('should store search even when not found', () => {
      state.buffer.setContent('hello world');
      state.cursor = new CursorPosition(0, 0);

      context.setCurrentPattern('tz');
      plugin.execute(context);

      const lastSearch = state.getLastCharSearch();
      expect(lastSearch).toEqual({ char: 'z', direction: 'forward' });
    });
  });

  describe('pattern generation', () => {
    it('should generate patterns for all printable characters', () => {
      expect(plugin.patterns).toContain('ta');
      expect(plugin.patterns).toContain('tZ');
      expect(plugin.patterns).toContain('t0');
      expect(plugin.patterns).toContain('t ');
      expect(plugin.patterns).toContain('t!');
    });

    it('should have at least 95 patterns (printable ASCII)', () => {
      expect(plugin.patterns.length).toBeGreaterThanOrEqual(95);
    });
  });

  describe('plugin metadata', () => {
    it('should have correct name', () => {
      expect(plugin.name).toBe('movement-t');
    });

    it('should have correct description', () => {
      expect(plugin.description).toBe('Till character forward (t{char})');
    });

    it('should be active in normal and visual modes', () => {
      expect(plugin.modes).toContain(VIM_MODE.NORMAL);
      expect(plugin.modes).toContain(VIM_MODE.VISUAL);
    });
  });

  describe('difference from f command', () => {
    it('should land before character, not on it (unlike f)', () => {
      state.buffer.setContent('hello world');
      state.cursor = new CursorPosition(0, 0);

      // t{char} lands before the character
      context.setCurrentPattern('tl');
      plugin.execute(context);

      // First 'l' is at position 2, so t{l} should land at 1
      expect(state.cursor.column).toBe(1);
    });
  });
});
