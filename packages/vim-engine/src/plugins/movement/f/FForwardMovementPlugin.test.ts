/**
 * Tests for FForwardMovementPlugin
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { VimState } from '../../../state/VimState';
import { ExecutionContext } from '../../../plugin/ExecutionContext';
import { FForwardMovementPlugin } from './FForwardMovementPlugin';
import { CursorPosition } from '../../../state/CursorPosition';
import { VIM_MODE } from '../../../state/VimMode';

describe('FForwardMovementPlugin', () => {
  let plugin: FForwardMovementPlugin;
  let state: VimState;
  let context: ExecutionContext;

  beforeEach(() => {
    plugin = new FForwardMovementPlugin();
    state = new VimState();
    context = new ExecutionContext(state);
  });

  describe('basic forward search', () => {
    it('should find character forward on current line', () => {
      state.buffer.setContent('hello world');
      state.cursor = new CursorPosition(0, 0);

      context.setCurrentPattern('fo');
      plugin.execute(context);

      expect(state.cursor.column).toBe(4); // Position of 'o' in 'hello'
    });

    it('should not move if character not found', () => {
      state.buffer.setContent('hello world');
      state.cursor = new CursorPosition(0, 0);

      context.setCurrentPattern('fz');
      plugin.execute(context);

      expect(state.cursor.column).toBe(0);
    });

    it('should search from cursor position, not start of line', () => {
      state.buffer.setContent('hello world');
      state.cursor = new CursorPosition(0, 2); // At 'l'

      context.setCurrentPattern('fo');
      plugin.execute(context);

      expect(state.cursor.column).toBe(4); // Position of 'o' in 'hello'
    });
  });

  describe('count handling', () => {
    it('should find nth occurrence with count', () => {
      state.buffer.setContent('hello hello world');
      state.cursor = new CursorPosition(0, 0);

      context.setCurrentPattern('fe');
      context.setCount(2);
      plugin.execute(context);

      // Should find the second 'e' (in the second 'hello')
      expect(state.cursor.column).toBe(7);
    });

    it('should not move if nth occurrence not found', () => {
      state.buffer.setContent('hello world');
      state.cursor = new CursorPosition(0, 0);

      context.setCurrentPattern('fo');
      context.setCount(5);
      plugin.execute(context);

      expect(state.cursor.column).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('should handle empty line', () => {
      state.buffer.setContent('');
      state.cursor = new CursorPosition(0, 0);

      context.setCurrentPattern('fa');
      plugin.execute(context);

      expect(state.cursor.column).toBe(0);
    });

    it('should handle search for space', () => {
      state.buffer.setContent('hello world');
      state.cursor = new CursorPosition(0, 0);

      context.setCurrentPattern('f ');
      plugin.execute(context);

      expect(state.cursor.column).toBe(5); // Position of space
    });

    it('should find special characters', () => {
      state.buffer.setContent('hello,world');
      state.cursor = new CursorPosition(0, 0);

      context.setCurrentPattern('f,');
      plugin.execute(context);

      expect(state.cursor.column).toBe(5);
    });
  });

  describe('search state storage', () => {
    it('should store last character search', () => {
      state.buffer.setContent('hello world');
      state.cursor = new CursorPosition(0, 0);

      context.setCurrentPattern('fo');
      plugin.execute(context);

      const lastSearch = state.getLastCharSearch();
      expect(lastSearch).toEqual({ char: 'o', direction: 'forward', type: 'find' });
    });

    it('should store search even when not found', () => {
      state.buffer.setContent('hello world');
      state.cursor = new CursorPosition(0, 0);

      context.setCurrentPattern('fz');
      plugin.execute(context);

      const lastSearch = state.getLastCharSearch();
      expect(lastSearch).toEqual({ char: 'z', direction: 'forward', type: 'find' });
    });
  });

  describe('pattern generation', () => {
    it('should generate patterns for all printable characters', () => {
      expect(plugin.patterns).toContain('fa');
      expect(plugin.patterns).toContain('fZ');
      expect(plugin.patterns).toContain('f0');
      expect(plugin.patterns).toContain('f ');
      expect(plugin.patterns).toContain('f!');
    });

    it('should have at least 95 patterns (printable ASCII)', () => {
      expect(plugin.patterns.length).toBeGreaterThanOrEqual(95);
    });
  });

  describe('plugin metadata', () => {
    it('should have correct name', () => {
      expect(plugin.name).toBe('movement-f');
    });

    it('should have correct description', () => {
      expect(plugin.description).toBe('Find character forward (f{char})');
    });

    it('should be active in normal and visual modes', () => {
      expect(plugin.modes).toContain(VIM_MODE.NORMAL);
      expect(plugin.modes).toContain(VIM_MODE.VISUAL);
    });
  });
});
