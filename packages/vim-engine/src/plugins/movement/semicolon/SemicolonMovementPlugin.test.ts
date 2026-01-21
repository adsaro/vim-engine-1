/**
 * Tests for SemicolonMovementPlugin
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { VimState } from '../../../state/VimState';
import { ExecutionContext } from '../../../plugin/ExecutionContext';
import { SemicolonMovementPlugin } from './SemicolonMovementPlugin';
import { FForwardMovementPlugin } from '../f/FForwardMovementPlugin';
import { FBackwardMovementPlugin } from '../f-capital/FBackwardMovementPlugin';
import { TForwardMovementPlugin } from '../t/TForwardMovementPlugin';
import { TBackwardMovementPlugin } from '../t-capital/TBackwardMovementPlugin';
import { CursorPosition } from '../../../state/CursorPosition';
import { VIM_MODE } from '../../../state/VimMode';

describe('SemicolonMovementPlugin', () => {
  let plugin: SemicolonMovementPlugin;
  let state: VimState;
  let context: ExecutionContext;

  beforeEach(() => {
    plugin = new SemicolonMovementPlugin();
    state = new VimState();
    context = new ExecutionContext(state);
  });

  describe('repeating forward find (f)', () => {
    it('should repeat forward find in same direction', () => {
      state.buffer.setContent('hello world hello');
      state.cursor = new CursorPosition(0, 0);

      // First find: fo
      context.setCurrentPattern('fo');
      const fPlugin = new FForwardMovementPlugin();
      fPlugin.execute(context);

      expect(state.cursor.column).toBe(4); // First 'o'

      // Repeat with ;
      plugin.execute(context);

      expect(state.cursor.column).toBe(7); // Second 'o'
    });

    it('should support count with repeat', () => {
      state.buffer.setContent('a x a x a x a');
      state.cursor = new CursorPosition(0, 0);

      // First find: fa
      context.setCurrentPattern('fa');
      const fPlugin = new FForwardMovementPlugin();
      fPlugin.execute(context);

      expect(state.cursor.column).toBe(4); // Second 'a' (first one from pos 0)

      // Repeat with count 2 (find 2nd 'a' from current position)
      context.setCount(2);
      plugin.execute(context);

      expect(state.cursor.column).toBe(12); // Fourth 'a' (2nd from position 4)
    });
  });

  describe('repeating backward find (F)', () => {
    it('should repeat backward find in same direction', () => {
      state.buffer.setContent('hello hello world');
      state.cursor = new CursorPosition(0, 12);

      // First find: Fo
      context.setCurrentPattern('Fo');
      const fPlugin = new FBackwardMovementPlugin();
      fPlugin.execute(context);

      expect(state.cursor.column).toBe(10); // 'o' in second hello

      // Repeat with ;
      plugin.execute(context);

      expect(state.cursor.column).toBe(4); // 'o' in first hello
    });
  });

  describe('repeating forward till (t)', () => {
    it('should repeat forward till in same direction', () => {
      state.buffer.setContent('xx,yy,zz');
      state.cursor = new CursorPosition(0, 0);

      // First till: t,
      context.setCurrentPattern('t,');
      const tPlugin = new TForwardMovementPlugin();
      tPlugin.execute(context);

      expect(state.cursor.column).toBe(1); // Just before first ','
      
      // Verify last search was saved
      const lastSearch = state.getLastCharSearch();
      expect(lastSearch).toBeTruthy();

      // Repeat with ; (should find next ',')
      plugin.execute(context);

      expect(state.cursor.column).toBe(4); // Just before second ','
    });
  });

  describe('repeating backward till (T)', () => {
    it('should repeat backward till in same direction', () => {
      state.buffer.setContent('aa,bb,cc,dd');
      state.cursor = new CursorPosition(0, 8); // In "dd"

      // First till: T,
      context.setCurrentPattern('T,');
      const tPlugin = new TBackwardMovementPlugin();
      tPlugin.execute(context);

      expect(state.cursor.column).toBe(6); // Just after third ',' (which is at 5)

      // Repeat with ; (should find previous ',')
      plugin.execute(context);

      expect(state.cursor.column).toBe(3); // Just after second ',' (which is at 2)
    });
  });

  describe('edge cases', () => {
    it('should do nothing if no previous character search', () => {
      state.buffer.setContent('hello world');
      state.cursor = new CursorPosition(0, 0);

      plugin.execute(context);

      expect(state.cursor.column).toBe(0);
    });

    it('should stay in place if character not found', () => {
      state.buffer.setContent('hello world');
      state.cursor = new CursorPosition(0, 0);

      // First find: fz (not found)
      context.setCurrentPattern('fz');
      const fPlugin = new FForwardMovementPlugin();
      fPlugin.execute(context);

      expect(state.cursor.column).toBe(0);

      // Repeat with ; - should still be at 0
      plugin.execute(context);

      expect(state.cursor.column).toBe(0);
    });

    it('should handle empty line', () => {
      state.buffer.setContent('');
      state.cursor = new CursorPosition(0, 0);

      // Set up a previous search (even though line is empty)
      state.setLastCharSearch({ char: 'a', direction: 'forward', type: 'find' });

      plugin.execute(context);

      expect(state.cursor.column).toBe(0);
    });
  });

  describe('plugin metadata', () => {
    it('should have correct name', () => {
      expect(plugin.name).toBe('movement-semicolon');
    });

    it('should have correct description', () => {
      expect(plugin.description).toBe('Repeat last character search (;)');
    });

    it('should have correct pattern', () => {
      expect(plugin.patterns).toEqual([';']);
    });

    it('should be active in normal and visual modes', () => {
      expect(plugin.modes).toContain(VIM_MODE.NORMAL);
      expect(plugin.modes).toContain(VIM_MODE.VISUAL);
    });
  });
});
