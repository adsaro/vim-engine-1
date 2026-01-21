/**
 * Tests for CommaMovementPlugin
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { VimState } from '../../../state/VimState';
import { ExecutionContext } from '../../../plugin/ExecutionContext';
import { CommaMovementPlugin } from './CommaMovementPlugin';
import { FForwardMovementPlugin } from '../f/FForwardMovementPlugin';
import { FBackwardMovementPlugin } from '../f-capital/FBackwardMovementPlugin';
import { TForwardMovementPlugin } from '../t/TForwardMovementPlugin';
import { TBackwardMovementPlugin } from '../t-capital/TBackwardMovementPlugin';
import { CursorPosition } from '../../../state/CursorPosition';
import { VIM_MODE } from '../../../state/VimMode';

describe('CommaMovementPlugin', () => {
  let plugin: CommaMovementPlugin;
  let state: VimState;
  let context: ExecutionContext;

  beforeEach(() => {
    plugin = new CommaMovementPlugin();
    state = new VimState();
    context = new ExecutionContext(state);
  });

  describe('repeating forward find (f) in opposite direction', () => {
    it('should repeat forward find in opposite direction (backward)', () => {
      state.buffer.setContent('hello world hello');
      state.cursor = new CursorPosition(0, 7); // At 'o' in "world"

      // First find: fo (but we're going backward)
      context.setCurrentPattern('Fo');
      const fPlugin = new FBackwardMovementPlugin();
      fPlugin.execute(context);

      expect(state.cursor.column).toBe(4); // 'o' in "hello"

      // Repeat with , (should go forward now)
      plugin.execute(context);

      expect(state.cursor.column).toBe(7); // Back to 'o' in "world"
    });

    it('should reverse direction from forward to backward', () => {
      state.buffer.setContent('a x a x a');
      state.cursor = new CursorPosition(0, 4); // At second 'a'

      // First find: fa (forward)
      context.setCurrentPattern('fa');
      const fPlugin = new FForwardMovementPlugin();
      fPlugin.execute(context);

      expect(state.cursor.column).toBe(6); // Third 'a'

      // Repeat with , (should go backward now)
      plugin.execute(context);

      expect(state.cursor.column).toBe(4); // Back to second 'a'
    });
  });

  describe('repeating backward find (F) in opposite direction', () => {
    it('should repeat backward find in opposite direction (forward)', () => {
      state.buffer.setContent('hello hello world');
      state.cursor = new CursorPosition(0, 4); // At 'o' in first "hello"

      // First find: Fo (backward)
      context.setCurrentPattern('Fo');
      const fPlugin = new FBackwardMovementPlugin();
      fPlugin.execute(context);

      // No 'o' before position 4, so cursor stays
      expect(state.cursor.column).toBe(4);

      // Repeat with , (should go forward now)
      plugin.execute(context);

      expect(state.cursor.column).toBe(7); // 'o' in second "hello"
    });
  });

  describe('repeating forward till (t) in opposite direction', () => {
    it('should reverse direction from forward till to backward till', () => {
      state.buffer.setContent('a, x, a, x');
      state.cursor = new CursorPosition(0, 4); // Just before second ','

      // First till: t, (forward)
      context.setCurrentPattern('t,');
      const tPlugin = new TForwardMovementPlugin();
      tPlugin.execute(context);

      expect(state.cursor.column).toBe(5); // Just before third ','

      // Repeat with , (should go backward now)
      plugin.execute(context);

      expect(state.cursor.column).toBe(4); // Back to just before second ','
    });
  });

  describe('repeating backward till (T) in opposite direction', () => {
    it('should reverse direction from backward till to forward till', () => {
      state.buffer.setContent('a, x, a, x');
      state.cursor = new CursorPosition(0, 5); // Just after third ','

      // First till: T, (backward)
      context.setCurrentPattern('T,');
      const tPlugin = new TBackwardMovementPlugin();
      tPlugin.execute(context);

      expect(state.cursor.column).toBe(4); // Just after second ','

      // Repeat with , (should go forward now)
      plugin.execute(context);

      expect(state.cursor.column).toBe(5); // Back to just after third ','
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

      // Repeat with , - should still be at 0
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

  describe('alternating between ; and ,', () => {
    it('should NOT toggle direction when pressing , multiple times', () => {
      state.buffer.setContent('a x a x a x a');
      state.cursor = new CursorPosition(0, 4); // At second 'a'

      // First find: fa (forward)
      context.setCurrentPattern('fa');
      const fPlugin = new FForwardMovementPlugin();
      fPlugin.execute(context);

      expect(state.cursor.column).toBe(6); // Third 'a'

      // Use , to go backward (stays in opposite direction)
      const commaPlugin = new CommaMovementPlugin();
      commaPlugin.execute(context);

      expect(state.cursor.column).toBe(4); // Back to second 'a'

      // Press , again - should continue backward, not toggle forward
      commaPlugin.execute(context);

      expect(state.cursor.column).toBe(0); // Back to first 'a'

      // Use ; to go forward again
      const semicolonPlugin = new SemicolonMovementPlugin();
      semicolonPlugin.execute(context);

      expect(state.cursor.column).toBe(4); // Forward to second 'a' again
    });
  });

  describe('plugin metadata', () => {
    it('should have correct name', () => {
      expect(plugin.name).toBe('movement-comma');
    });

    it('should have correct description', () => {
      expect(plugin.description).toBe('Repeat last character search in opposite direction (,)');
    });

    it('should have correct pattern', () => {
      expect(plugin.patterns).toEqual([',']);
    });

    it('should be active in normal and visual modes', () => {
      expect(plugin.modes).toContain(VIM_MODE.NORMAL);
      expect(plugin.modes).toContain(VIM_MODE.VISUAL);
    });
  });
});
