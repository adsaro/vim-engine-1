/**
 * Tests for FBackwardMovementPlugin
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { VimState } from '../../../state/VimState';
import { ExecutionContext } from '../../../plugin/ExecutionContext';
import { FBackwardMovementPlugin } from './FBackwardMovementPlugin';
import { CursorPosition } from '../../../state/CursorPosition';
import { VIM_MODE } from '../../../state/VimMode';

describe('FBackwardMovementPlugin', () => {
  let plugin: FBackwardMovementPlugin;
  let state: VimState;
  let context: ExecutionContext;

  beforeEach(() => {
    plugin = new FBackwardMovementPlugin();
    state = new VimState();
    context = new ExecutionContext(state);
  });

  describe('basic backward search', () => {
    it('should find character backward on current line', () => {
      state.buffer.setContent('hello world');
      state.cursor = new CursorPosition(0, 9); // At 'r'

      context.setCurrentPattern('Fo');
      plugin.execute(context);

      expect(state.cursor.column).toBe(7); // Position of 'o' in 'world' (closest to cursor)
    });

    it('should not move if character not found', () => {
      state.buffer.setContent('hello world');
      state.cursor = new CursorPosition(0, 9);

      context.setCurrentPattern('Fz');
      plugin.execute(context);

      expect(state.cursor.column).toBe(9);
    });

    it('should search from cursor position, not end of line', () => {
      state.buffer.setContent('hello world');
      state.cursor = new CursorPosition(0, 7); // At 'o' in 'world'

      context.setCurrentPattern('Fl');
      plugin.execute(context);

      expect(state.cursor.column).toBe(3); // Position of 'l' in 'hello', not 'world'
    });

    it('should not include current position in search', () => {
      state.buffer.setContent('hello');
      state.cursor = new CursorPosition(0, 3); // At second 'l'

      context.setCurrentPattern('Fl');
      plugin.execute(context);

      expect(state.cursor.column).toBe(2); // Finds the 'l' at position 2, not current position 3
    });
  });

  describe('count handling', () => {
    it('should find nth occurrence backward with count', () => {
      state.buffer.setContent('hello hello hello');
      state.cursor = new CursorPosition(0, 17); // Near end

      context.setCurrentPattern('Fe');
      context.setCount(2);
      plugin.execute(context);

      // Should find the second 'e' going backward
      expect(state.cursor.column).toBe(7);
    });

    it('should not move if nth occurrence not found', () => {
      state.buffer.setContent('hello world');
      state.cursor = new CursorPosition(0, 9);

      context.setCurrentPattern('Fo');
      context.setCount(5);
      plugin.execute(context);

      expect(state.cursor.column).toBe(9);
    });
  });

  describe('edge cases', () => {
    it('should handle empty line', () => {
      state.buffer.setContent('');
      state.cursor = new CursorPosition(0, 0);

      context.setCurrentPattern('Fa');
      plugin.execute(context);

      expect(state.cursor.column).toBe(0);
    });

    it('should handle search for space', () => {
      state.buffer.setContent('hello world');
      state.cursor = new CursorPosition(0, 8);

      context.setCurrentPattern('F ');
      plugin.execute(context);

      expect(state.cursor.column).toBe(5); // Position of space
    });

    it('should find special characters', () => {
      state.buffer.setContent('hello,world');
      state.cursor = new CursorPosition(0, 10);

      context.setCurrentPattern('F,');
      plugin.execute(context);

      expect(state.cursor.column).toBe(5);
    });

    it('should not move if at start of line', () => {
      state.buffer.setContent('hello');
      state.cursor = new CursorPosition(0, 0);

      context.setCurrentPattern('Fh');
      plugin.execute(context);

      expect(state.cursor.column).toBe(0);
    });
  });

  describe('search state storage', () => {
    it('should store last character search', () => {
      state.buffer.setContent('hello world');
      state.cursor = new CursorPosition(0, 9);

      context.setCurrentPattern('Fo');
      plugin.execute(context);

      const lastSearch = state.getLastCharSearch();
      expect(lastSearch).toEqual({ char: 'o', direction: 'backward' });
    });

    it('should store search even when not found', () => {
      state.buffer.setContent('hello world');
      state.cursor = new CursorPosition(0, 9);

      context.setCurrentPattern('Fz');
      plugin.execute(context);

      const lastSearch = state.getLastCharSearch();
      expect(lastSearch).toEqual({ char: 'z', direction: 'backward' });
    });
  });

  describe('pattern generation', () => {
    it('should generate patterns for all printable characters', () => {
      expect(plugin.patterns).toContain('Fa');
      expect(plugin.patterns).toContain('FZ');
      expect(plugin.patterns).toContain('F0');
      expect(plugin.patterns).toContain('F ');
      expect(plugin.patterns).toContain('F!');
    });

    it('should have at least 95 patterns (printable ASCII)', () => {
      expect(plugin.patterns.length).toBeGreaterThanOrEqual(95);
    });
  });

  describe('plugin metadata', () => {
    it('should have correct name', () => {
      expect(plugin.name).toBe('movement-F');
    });

    it('should have correct description', () => {
      expect(plugin.description).toBe('Find character backward (F{char})');
    });

    it('should be active in normal and visual modes', () => {
      expect(plugin.modes).toContain(VIM_MODE.NORMAL);
      expect(plugin.modes).toContain(VIM_MODE.VISUAL);
    });
  });
});
