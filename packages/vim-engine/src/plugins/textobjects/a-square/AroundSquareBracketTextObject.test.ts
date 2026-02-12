/**
 * AroundSquareBracketTextObject Tests
 */
import { AroundSquareBracketTextObject } from './AroundSquareBracketTextObject';
import { ExecutionContext } from '../../../plugin/ExecutionContext';
import { VimMode, VIM_MODE } from '../../../state/VimMode';
import { TextBuffer } from '../../../state/TextBuffer';
import { CursorPosition } from '../../../state/CursorPosition';

describe('AroundSquareBracketTextObject', () => {
  let plugin: AroundSquareBracketTextObject;
  let buffer: TextBuffer;
  let context: ExecutionContext;

  beforeEach(() => {
    plugin = new AroundSquareBracketTextObject();
    buffer = new TextBuffer();
    context = new ExecutionContext();
    context.setMode(VIM_MODE.NORMAL);
  });

  describe('getWordBoundaries', () => {
    it('should find square brackets with cursor inside - includes brackets', () => {
      buffer.insertLine(0, 'arr[ hello ] world');
      // Position: a=0, r=1, r=2, [=3, space=4, h=5...
      context.setBuffer(buffer);
      context.setCursor(new CursorPosition(0, 5)); // Cursor on 'h' in hello
      context.setCurrentPattern('a[');

      const boundaries = plugin.getWordBoundaries(context);
      expect(boundaries).not.toBeNull();
      expect(boundaries?.start.line).toBe(0);
      expect(boundaries?.start.column).toBe(3); // At opening bracket
      expect(boundaries?.end.line).toBe(0);
      expect(boundaries?.end.column).toBe(12); // After closing bracket (column 11 + 1)
    });

    it('should work with cursor on opening bracket', () => {
      buffer.insertLine(0, 'arr[ hello ]');
      context.setBuffer(buffer);
      context.setCursor(new CursorPosition(0, 3)); // Cursor on opening bracket
      context.setCurrentPattern('a[');

      const boundaries = plugin.getWordBoundaries(context);
      expect(boundaries).not.toBeNull();
      expect(boundaries?.start.column).toBe(3); // At opening bracket
      expect(boundaries?.end.column).toBe(12); // After closing bracket
    });

    it('should work with cursor on closing bracket', () => {
      buffer.insertLine(0, 'arr[ hello ]');
      context.setBuffer(buffer);
      context.setCursor(new CursorPosition(0, 11)); // Cursor on closing bracket
      context.setCurrentPattern('a[');

      const boundaries = plugin.getWordBoundaries(context);
      expect(boundaries).not.toBeNull();
      expect(boundaries?.start.column).toBe(3); // At opening bracket
      expect(boundaries?.end.column).toBe(12); // After closing bracket
    });

    it('should handle empty brackets - includes both brackets', () => {
      buffer.insertLine(0, 'arr[ ] world');
      context.setBuffer(buffer);
      context.setCursor(new CursorPosition(0, 4)); // Cursor between brackets
      context.setCurrentPattern('a[');

      const boundaries = plugin.getWordBoundaries(context);
      expect(boundaries).not.toBeNull();
      expect(boundaries?.start.column).toBe(3); // At opening bracket
      expect(boundaries?.end.column).toBe(6); // After closing bracket
    });

    it('should handle nested brackets - finds innermost pair', () => {
      buffer.insertLine(0, 'arr[ outer [ inner ] outer ] world');
      context.setBuffer(buffer);
      context.setCursor(new CursorPosition(0, 16)); // Cursor on 'i' in inner
      context.setCurrentPattern('a[');

      const boundaries = plugin.getWordBoundaries(context);
      expect(boundaries).not.toBeNull();
      expect(boundaries?.start.column).toBe(11); // At inner opening bracket
      expect(boundaries?.end.column).toBe(20); // After inner closing bracket
    });

    it('should find outer brackets when cursor in outer content', () => {
      buffer.insertLine(0, 'arr[ outer [ inner ] tail ] world');
      context.setBuffer(buffer);
      context.setCursor(new CursorPosition(0, 6)); // Cursor on 'o' in outer
      context.setCurrentPattern('a[');

      const boundaries = plugin.getWordBoundaries(context);
      expect(boundaries).not.toBeNull();
      expect(boundaries?.start.column).toBe(3); // At outer opening bracket
      expect(boundaries?.end.column).toBe(27); // After outer closing bracket
    });

    it('should return null when cursor is outside brackets', () => {
      buffer.insertLine(0, 'arr[ hello ] world');
      context.setBuffer(buffer);
      context.setCursor(new CursorPosition(0, 1)); // Cursor on 'r' in arr
      context.setCurrentPattern('a[');

      const boundaries = plugin.getWordBoundaries(context);
      expect(boundaries).toBeNull();
    });

    it('should return null when no brackets exist', () => {
      buffer.insertLine(0, 'Hello world!');
      context.setBuffer(buffer);
      context.setCursor(new CursorPosition(0, 6));
      context.setCurrentPattern('a[');

      const boundaries = plugin.getWordBoundaries(context);
      expect(boundaries).toBeNull();
    });

    it('should return null when only opening bracket exists', () => {
      buffer.insertLine(0, 'arr[ hello');
      context.setBuffer(buffer);
      context.setCursor(new CursorPosition(0, 8));
      context.setCurrentPattern('a[');

      const boundaries = plugin.getWordBoundaries(context);
      expect(boundaries).toBeNull();
    });

    it('should return null when only closing bracket exists', () => {
      buffer.insertLine(0, 'arr hello ]');
      context.setBuffer(buffer);
      context.setCursor(new CursorPosition(0, 8));
      context.setCurrentPattern('a[');

      const boundaries = plugin.getWordBoundaries(context);
      expect(boundaries).toBeNull();
    });

    it('should handle multiple bracket pairs on same line', () => {
      buffer.insertLine(0, 'arr[ first ] and [ second ]');
      context.setBuffer(buffer);
      context.setCursor(new CursorPosition(0, 21)); // Cursor on 's' in second
      context.setCurrentPattern('a[');

      const boundaries = plugin.getWordBoundaries(context);
      expect(boundaries).not.toBeNull();
      expect(boundaries?.start.column).toBe(17); // At opening bracket of second pair
      expect(boundaries?.end.column).toBe(27); // After closing bracket of second pair
    });

    it('should handle multi-line brackets', () => {
      buffer.insertLine(0, 'arr[');
      buffer.insertLine(1, '  hello');
      buffer.insertLine(2, ']');
      context.setBuffer(buffer);
      context.setCursor(new CursorPosition(1, 2)); // Cursor on 'h' in hello
      context.setCurrentPattern('a[');

      const boundaries = plugin.getWordBoundaries(context);
      expect(boundaries).not.toBeNull();
      expect(boundaries?.start.line).toBe(0);
      expect(boundaries?.start.column).toBe(3); // At opening bracket
      expect(boundaries?.end.line).toBe(2);
      expect(boundaries?.end.column).toBe(1); // After closing bracket
    });

    it('should return null for empty buffer', () => {
      context.setBuffer(buffer);
      context.setCursor(new CursorPosition(0, 0));
      context.setCurrentPattern('a[');

      const boundaries = plugin.getWordBoundaries(context);
      expect(boundaries).toBeNull();
    });
  });

  describe('plugin metadata', () => {
    it('should have correct name', () => {
      expect(plugin.name).toBe('textobject-a-square');
    });

    it('should have correct patterns', () => {
      expect(plugin.patterns).toContain('a[');
    });

    it('should work in operator-pending and visual modes', () => {
      expect(plugin.modes).toContain(VIM_MODE.OPERATOR_PENDING);
      expect(plugin.modes).toContain(VIM_MODE.VISUAL);
    });
  });
});
