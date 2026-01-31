/**
 * DeleteOperatorPlugin Tests
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { DeleteOperatorPlugin } from './DeleteOperatorPlugin';
import { ExecutionContext } from '../../../plugin/ExecutionContext';
import { VimState } from '../../../state/VimState';
import { CursorPosition } from '../../../state/CursorPosition';
import { TextBuffer } from '../../../state/TextBuffer';
import { VIM_MODE } from '../../../state/VimMode';

describe('DeleteOperatorPlugin', () => {
  let plugin: DeleteOperatorPlugin;
  let context: ExecutionContext;
  let state: VimState;

  beforeEach(() => {
    plugin = new DeleteOperatorPlugin();
    state = new VimState('Hello world\nTest line\nAnother line');
    context = new ExecutionContext(state);
  });

  describe('plugin metadata', () => {
    it('should have correct name', () => {
      expect(plugin.name).toBe('operator-delete');
    });

    it('should have correct version', () => {
      expect(plugin.version).toBe('1.0.0');
    });

    it('should have correct description', () => {
      expect(plugin.description).toBe('Delete operator (d key)');
    });

    it('should have d and dd patterns', () => {
      expect(plugin.patterns).toContain('d');
      expect(plugin.patterns).toContain('dd');
    });

    it('should support NORMAL mode', () => {
      expect(plugin.modes).toContain('NORMAL');
    });

    it('should support OPERATOR_PENDING mode', () => {
      expect(plugin.modes).toContain('OPERATOR_PENDING');
    });
  });

  describe('entering operator-pending mode', () => {
    it('should enter operator-pending mode when d is pressed in NORMAL mode', () => {
      state.mode = VIM_MODE.NORMAL;
      context.setCurrentPattern('d');

      plugin.execute(context);

      expect(state.mode).toBe(VIM_MODE.OPERATOR_PENDING);
      expect(state.getPendingOperator()).toBe('d');
    });

    it('should not enter operator-pending mode when dd is pressed', () => {
      state.mode = VIM_MODE.NORMAL;
      context.setCurrentPattern('dd');

      plugin.execute(context);

      // Should delete line immediately
      expect(state.mode).toBe(VIM_MODE.NORMAL);
      expect(state.getPendingOperator()).toBeNull();
    });
  });

  describe('dd - delete line', () => {
    it('should delete current line with dd', () => {
      state.cursor = new CursorPosition(0, 0);
      context.setCurrentPattern('dd');

      plugin.execute(context);

      expect(state.buffer.getLine(0)).toBe('Test line');
      expect(state.buffer.getLineCount()).toBe(2);
    });

    it('should store deleted line in register', () => {
      state.cursor = new CursorPosition(0, 0);
      context.setCurrentPattern('dd');

      plugin.execute(context);

      expect(context.getRegister('"')).toBe('Hello world\n');
    });

    it('should handle dd with count', () => {
      state.cursor = new CursorPosition(0, 0);
      context.setCount(2);
      context.setCurrentPattern('dd');

      plugin.execute(context);

      expect(state.buffer.getLineCount()).toBe(1);
      expect(state.buffer.getLine(0)).toBe('Another line');
      expect(context.getRegister('"')).toBe('Hello world\nTest line\n');
    });

    it('should move cursor up when deleting last line', () => {
      state.cursor = new CursorPosition(2, 0);
      context.setCurrentPattern('dd');

      plugin.execute(context);

      expect(state.cursor.line).toBe(1);
      expect(state.cursor.column).toBe(0);
    });
  });

  describe('d in operator-pending mode (second d)', () => {
    it('should delete line when d is pressed in operator-pending mode', () => {
      state.mode = VIM_MODE.OPERATOR_PENDING;
      state.setPendingOperator('d');
      state.cursor = new CursorPosition(0, 5);
      context.setCurrentPattern('d');

      plugin.execute(context);

      expect(state.buffer.getLine(0)).toBe('Test line');
      expect(state.mode).toBe(VIM_MODE.NORMAL);
      expect(state.getPendingOperator()).toBeNull();
    });
  });

  describe('delete with motion', () => {
    it('should delete from start to end position with motion', () => {
      state.cursor = new CursorPosition(0, 0);
      const startPos = new CursorPosition(0, 0);
      const endPos = new CursorPosition(0, 5); // Delete "Hello"

      plugin.executeDeleteWithMotion(context, startPos, endPos);

      expect(state.buffer.getLine(0)).toBe(' world');
      expect(context.getRegister('"')).toBe('Hello');
    });

    it('should delete across lines', () => {
      // Line 0: "Hello world", Line 1: "Test line"
      // Deleting from (0, 6) to (1, 4) removes "world\nTest"
      // Result: "Hello " + " line" = "Hello  line" (double space is correct)
      state.cursor = new CursorPosition(0, 6);
      const startPos = new CursorPosition(0, 6);
      const endPos = new CursorPosition(1, 4);

      plugin.executeDeleteWithMotion(context, startPos, endPos);

      expect(state.buffer.getLine(0)).toBe('Hello  line');
      expect(state.buffer.getLineCount()).toBe(2);
    });

    it('should handle reverse positions (end before start)', () => {
      // Line: "Hello world"
      // Deleting from (0, 5) to (0, 0) removes "Hello" (positions 0-5)
      // Result: " world" (leading space preserved)
      state.cursor = new CursorPosition(0, 5);
      const startPos = new CursorPosition(0, 5); // After "Hello"
      const endPos = new CursorPosition(0, 0); // Before "Hello"

      plugin.executeDeleteWithMotion(context, startPos, endPos);

      expect(state.buffer.getLine(0)).toBe(' world');
      expect(state.cursor.column).toBe(0);
    });
  });

  describe('empty buffer handling', () => {
    it('should handle empty buffer gracefully', () => {
      state.buffer = new TextBuffer();
      state.cursor = new CursorPosition(0, 0);
      context.setCurrentPattern('dd');

      expect(() => plugin.execute(context)).not.toThrow();
    });

    it('should handle empty buffer with motion', () => {
      state.buffer = new TextBuffer();
      const startPos = new CursorPosition(0, 0);
      const endPos = new CursorPosition(0, 0);

      expect(() => plugin.executeDeleteWithMotion(context, startPos, endPos)).not.toThrow();
    });
  });

  describe('pattern validation', () => {
    it('should validate d pattern', () => {
      expect(plugin.validatePattern('d')).toBe(true);
    });

    it('should validate dd pattern', () => {
      expect(plugin.validatePattern('dd')).toBe(true);
    });

    it('should not validate other patterns', () => {
      expect(plugin.validatePattern('x')).toBe(false);
      expect(plugin.validatePattern('D')).toBe(false);
    });
  });
});
