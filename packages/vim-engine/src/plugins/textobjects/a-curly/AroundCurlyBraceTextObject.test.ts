/**
 * AroundCurlyBraceTextObject Tests
 */
import { AroundCurlyBraceTextObject } from './AroundCurlyBraceTextObject';
import { ExecutionContext } from '../../../plugin/ExecutionContext';
import { VimMode, VIM_MODE } from '../../../state/VimMode';
import { TextBuffer } from '../../../state/TextBuffer';
import { CursorPosition } from '../../../state/CursorPosition';

describe('AroundCurlyBraceTextObject', () => {
  let plugin: AroundCurlyBraceTextObject;
  let buffer: TextBuffer;
  let context: ExecutionContext;

  beforeEach(() => {
    plugin = new AroundCurlyBraceTextObject();
    buffer = new TextBuffer();
    context = new ExecutionContext();
    context.setMode(VIM_MODE.NORMAL);
  });

  describe('getWordBoundaries', () => {
    it('should find curly braces with cursor inside - includes braces', () => {
      buffer.insertLine(0, 'fun { hello } world');
      context.setBuffer(buffer);
      context.setCursor(new CursorPosition(0, 7)); // Cursor on 'h' in hello
      context.setCurrentPattern('a{');

      const boundaries = plugin.getWordBoundaries(context);
      expect(boundaries).not.toBeNull();
      expect(boundaries?.start.line).toBe(0);
      expect(boundaries?.start.column).toBe(4); // At opening brace
      expect(boundaries?.end.line).toBe(0);
      expect(boundaries?.end.column).toBe(13); // After closing brace (column 12 + 1)
    });

    it('should work with cursor on opening brace', () => {
      buffer.insertLine(0, 'fun { hello }');
      context.setBuffer(buffer);
      context.setCursor(new CursorPosition(0, 4)); // Cursor on opening brace
      context.setCurrentPattern('a{');

      const boundaries = plugin.getWordBoundaries(context);
      expect(boundaries).not.toBeNull();
      expect(boundaries?.start.column).toBe(4); // At opening brace
      expect(boundaries?.end.column).toBe(13); // After closing brace
    });

    it('should work with cursor on closing brace', () => {
      buffer.insertLine(0, 'fun { hello }');
      context.setBuffer(buffer);
      context.setCursor(new CursorPosition(0, 12)); // Cursor on closing brace
      context.setCurrentPattern('a{');

      const boundaries = plugin.getWordBoundaries(context);
      expect(boundaries).not.toBeNull();
      expect(boundaries?.start.column).toBe(4); // At opening brace
      expect(boundaries?.end.column).toBe(13); // After closing brace
    });

    it('should handle empty braces - includes both braces', () => {
      buffer.insertLine(0, 'fun { } world');
      context.setBuffer(buffer);
      context.setCursor(new CursorPosition(0, 5)); // Cursor between braces
      context.setCurrentPattern('a{');

      const boundaries = plugin.getWordBoundaries(context);
      expect(boundaries).not.toBeNull();
      expect(boundaries?.start.column).toBe(4); // At opening brace
      expect(boundaries?.end.column).toBe(7); // After closing brace
    });

    it('should handle nested braces - finds innermost pair', () => {
      buffer.insertLine(0, 'fun { outer { inner } outer } world');
      context.setBuffer(buffer);
      context.setCursor(new CursorPosition(0, 17)); // Cursor on 'i' in inner
      context.setCurrentPattern('a{');

      const boundaries = plugin.getWordBoundaries(context);
      expect(boundaries).not.toBeNull();
      expect(boundaries?.start.column).toBe(12); // At inner opening brace
      expect(boundaries?.end.column).toBe(21); // After inner closing brace
    });

    it('should find outer braces when cursor in outer content', () => {
      buffer.insertLine(0, 'fun { outer { inner } tail } world');
      context.setBuffer(buffer);
      context.setCursor(new CursorPosition(0, 7)); // Cursor on 'o' in outer
      context.setCurrentPattern('a{');

      const boundaries = plugin.getWordBoundaries(context);
      expect(boundaries).not.toBeNull();
      expect(boundaries?.start.column).toBe(4); // At outer opening brace
      expect(boundaries?.end.column).toBe(28); // After outer closing brace
    });

    it('should return null when cursor is outside braces', () => {
      buffer.insertLine(0, 'fun { hello } world');
      context.setBuffer(buffer);
      context.setCursor(new CursorPosition(0, 2)); // Cursor on 'n' in fun
      context.setCurrentPattern('a{');

      const boundaries = plugin.getWordBoundaries(context);
      expect(boundaries).toBeNull();
    });

    it('should return null when no braces exist', () => {
      buffer.insertLine(0, 'Hello world!');
      context.setBuffer(buffer);
      context.setCursor(new CursorPosition(0, 6));
      context.setCurrentPattern('a{');

      const boundaries = plugin.getWordBoundaries(context);
      expect(boundaries).toBeNull();
    });

    it('should return null when only opening brace exists', () => {
      buffer.insertLine(0, 'fun { hello');
      context.setBuffer(buffer);
      context.setCursor(new CursorPosition(0, 8));
      context.setCurrentPattern('a{');

      const boundaries = plugin.getWordBoundaries(context);
      expect(boundaries).toBeNull();
    });

    it('should return null when only closing brace exists', () => {
      buffer.insertLine(0, 'fun hello }');
      context.setBuffer(buffer);
      context.setCursor(new CursorPosition(0, 8));
      context.setCurrentPattern('a{');

      const boundaries = plugin.getWordBoundaries(context);
      expect(boundaries).toBeNull();
    });

    it('should handle multiple brace pairs on same line', () => {
      buffer.insertLine(0, 'fun { first } and { second }');
      context.setBuffer(buffer);
      context.setCursor(new CursorPosition(0, 22)); // Cursor on 's' in second
      context.setCurrentPattern('a{');

      const boundaries = plugin.getWordBoundaries(context);
      expect(boundaries).not.toBeNull();
      expect(boundaries?.start.column).toBe(18); // At opening brace of second pair
      expect(boundaries?.end.column).toBe(28); // After closing brace of second pair
    });

    it('should handle multi-line braces', () => {
      buffer.insertLine(0, 'fun {');
      buffer.insertLine(1, '  hello');
      buffer.insertLine(2, '}');
      context.setBuffer(buffer);
      context.setCursor(new CursorPosition(1, 2)); // Cursor on 'h' in hello
      context.setCurrentPattern('a{');

      const boundaries = plugin.getWordBoundaries(context);
      expect(boundaries).not.toBeNull();
      expect(boundaries?.start.line).toBe(0);
      expect(boundaries?.start.column).toBe(4); // At opening brace
      expect(boundaries?.end.line).toBe(2);
      expect(boundaries?.end.column).toBe(1); // After closing brace
    });

    it('should return null for empty buffer', () => {
      context.setBuffer(buffer);
      context.setCursor(new CursorPosition(0, 0));
      context.setCurrentPattern('a{');

      const boundaries = plugin.getWordBoundaries(context);
      expect(boundaries).toBeNull();
    });
  });

  describe('plugin metadata', () => {
    it('should have correct name', () => {
      expect(plugin.name).toBe('textobject-a-curly');
    });

    it('should have correct patterns', () => {
      expect(plugin.patterns).toContain('a{');
    });

    it('should work in operator-pending and visual modes', () => {
      expect(plugin.modes).toContain(VIM_MODE.OPERATOR_PENDING);
      expect(plugin.modes).toContain(VIM_MODE.VISUAL);
    });
  });
});
