/**
 * AroundParenTextObject Tests
 */
import { AroundParenTextObject } from './AroundParenTextObject';
import { ExecutionContext } from '../../../plugin/ExecutionContext';
import { VimMode, VIM_MODE } from '../../../state/VimMode';
import { TextBuffer } from '../../../state/TextBuffer';
import { CursorPosition } from '../../../state/CursorPosition';

describe('AroundParenTextObject', () => {
  let plugin: AroundParenTextObject;
  let buffer: TextBuffer;
  let context: ExecutionContext;

  beforeEach(() => {
    plugin = new AroundParenTextObject();
    buffer = new TextBuffer();
    context = new ExecutionContext();
    context.setMode(VIM_MODE.NORMAL);
  });

  describe('getWordBoundaries', () => {
    it('should find parentheses with cursor inside - includes parens', () => {
      buffer.insertLine(0, 'fun( hello ) world');
      // Position: f=0, u=1, n=2, (=3, space=4, h=5...
      context.setBuffer(buffer);
      context.setCursor(new CursorPosition(0, 5)); // Cursor on 'h' in hello
      context.setCurrentPattern('a(');

      const boundaries = plugin.getWordBoundaries(context);
      expect(boundaries).not.toBeNull();
      expect(boundaries?.start.line).toBe(0);
      expect(boundaries?.start.column).toBe(3); // At opening paren
      expect(boundaries?.end.line).toBe(0);
      expect(boundaries?.end.column).toBe(12); // After closing paren (column 11 + 1)
    });

    it('should work with cursor on opening paren', () => {
      buffer.insertLine(0, 'fun( hello )');
      context.setBuffer(buffer);
      context.setCursor(new CursorPosition(0, 3)); // Cursor on opening paren
      context.setCurrentPattern('a(');

      const boundaries = plugin.getWordBoundaries(context);
      expect(boundaries).not.toBeNull();
      expect(boundaries?.start.column).toBe(3); // At opening paren
      expect(boundaries?.end.column).toBe(12); // After closing paren
    });

    it('should work with cursor on closing paren', () => {
      buffer.insertLine(0, 'fun( hello )');
      context.setBuffer(buffer);
      context.setCursor(new CursorPosition(0, 11)); // Cursor on closing paren
      context.setCurrentPattern('a(');

      const boundaries = plugin.getWordBoundaries(context);
      expect(boundaries).not.toBeNull();
      expect(boundaries?.start.column).toBe(3); // At opening paren
      expect(boundaries?.end.column).toBe(12); // After closing paren
    });

    it('should handle empty parens - includes both parens', () => {
      buffer.insertLine(0, 'fun( ) world');
      context.setBuffer(buffer);
      context.setCursor(new CursorPosition(0, 4)); // Cursor between parens
      context.setCurrentPattern('a(');

      const boundaries = plugin.getWordBoundaries(context);
      expect(boundaries).not.toBeNull();
      expect(boundaries?.start.column).toBe(3); // At opening paren
      expect(boundaries?.end.column).toBe(6); // After closing paren
    });

    it('should handle nested parens - finds innermost pair', () => {
      buffer.insertLine(0, 'fun( outer ( inner ) outer ) world');
      context.setBuffer(buffer);
      context.setCursor(new CursorPosition(0, 16)); // Cursor on 'i' in inner
      context.setCurrentPattern('a(');

      const boundaries = plugin.getWordBoundaries(context);
      expect(boundaries).not.toBeNull();
      expect(boundaries?.start.column).toBe(11); // At inner opening paren
      expect(boundaries?.end.column).toBe(20); // After inner closing paren
    });

    it('should find outer parens when cursor in outer content', () => {
      buffer.insertLine(0, 'fun( outer ( inner ) tail ) world');
      context.setBuffer(buffer);
      context.setCursor(new CursorPosition(0, 6)); // Cursor on 'o' in outer
      context.setCurrentPattern('a(');

      const boundaries = plugin.getWordBoundaries(context);
      expect(boundaries).not.toBeNull();
      expect(boundaries?.start.column).toBe(3); // At outer opening paren
      expect(boundaries?.end.column).toBe(27); // After outer closing paren
    });

    it('should return null when cursor is outside parens', () => {
      buffer.insertLine(0, 'fun( hello ) world');
      context.setBuffer(buffer);
      context.setCursor(new CursorPosition(0, 1)); // Cursor on 'u' in fun
      context.setCurrentPattern('a(');

      const boundaries = plugin.getWordBoundaries(context);
      expect(boundaries).toBeNull();
    });

    it('should return null when no parens exist', () => {
      buffer.insertLine(0, 'Hello world!');
      context.setBuffer(buffer);
      context.setCursor(new CursorPosition(0, 6));
      context.setCurrentPattern('a(');

      const boundaries = plugin.getWordBoundaries(context);
      expect(boundaries).toBeNull();
    });

    it('should return null when only opening paren exists', () => {
      buffer.insertLine(0, 'fun( hello');
      context.setBuffer(buffer);
      context.setCursor(new CursorPosition(0, 8));
      context.setCurrentPattern('a(');

      const boundaries = plugin.getWordBoundaries(context);
      expect(boundaries).toBeNull();
    });

    it('should return null when only closing paren exists', () => {
      buffer.insertLine(0, 'fun hello )');
      context.setBuffer(buffer);
      context.setCursor(new CursorPosition(0, 8));
      context.setCurrentPattern('a(');

      const boundaries = plugin.getWordBoundaries(context);
      expect(boundaries).toBeNull();
    });

    it('should handle multiple paren pairs on same line', () => {
      buffer.insertLine(0, 'fun( first ) and ( second )');
      context.setBuffer(buffer);
      context.setCursor(new CursorPosition(0, 21)); // Cursor on 's' in second
      context.setCurrentPattern('a(');

      const boundaries = plugin.getWordBoundaries(context);
      expect(boundaries).not.toBeNull();
      expect(boundaries?.start.column).toBe(17); // At opening paren of second pair
      expect(boundaries?.end.column).toBe(27); // After closing paren of second pair
    });

    it('should handle multi-line parens', () => {
      buffer.insertLine(0, 'fun(');
      buffer.insertLine(1, '  hello');
      buffer.insertLine(2, ')');
      context.setBuffer(buffer);
      context.setCursor(new CursorPosition(1, 2)); // Cursor on 'h' in hello
      context.setCurrentPattern('a(');

      const boundaries = plugin.getWordBoundaries(context);
      expect(boundaries).not.toBeNull();
      expect(boundaries?.start.line).toBe(0);
      expect(boundaries?.start.column).toBe(3); // At opening paren
      expect(boundaries?.end.line).toBe(2);
      expect(boundaries?.end.column).toBe(1); // After closing paren
    });

    it('should return null for empty buffer', () => {
      context.setBuffer(buffer);
      context.setCursor(new CursorPosition(0, 0));
      context.setCurrentPattern('a(');

      const boundaries = plugin.getWordBoundaries(context);
      expect(boundaries).toBeNull();
    });
  });

  describe('plugin metadata', () => {
    it('should have correct name', () => {
      expect(plugin.name).toBe('textobject-a-paren');
    });

    it('should have correct patterns', () => {
      expect(plugin.patterns).toContain('a(');
    });

    it('should work in operator-pending and visual modes', () => {
      expect(plugin.modes).toContain(VIM_MODE.OPERATOR_PENDING);
      expect(plugin.modes).toContain(VIM_MODE.VISUAL);
    });
  });
});
