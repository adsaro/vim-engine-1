/**
 * InsideQuoteTextObject Tests
 */
import { InsideQuoteTextObject } from './InsideQuoteTextObject';
import { ExecutionContext } from '../../../plugin/ExecutionContext';
import { VimMode, VIM_MODE } from '../../../state/VimMode';
import { TextBuffer } from '../../../state/TextBuffer';
import { CursorPosition } from '../../../state/CursorPosition';

describe('InsideQuoteTextObject', () => {
  let plugin: InsideQuoteTextObject;
  let buffer: TextBuffer;
  let context: ExecutionContext;

  beforeEach(() => {
    plugin = new InsideQuoteTextObject();
    buffer = new TextBuffer();
    context = new ExecutionContext();
    context.setMode(VIM_MODE.NORMAL);
  });

  describe('getWordBoundaries', () => {
    it('should find double quotes with cursor inside', () => {
      buffer.insertLine(0, 'Hello "world"!');
      context.setBuffer(buffer);
      context.setCursor(new CursorPosition(0, 8)); // Cursor on 'w' in "world"
      context.setCurrentPattern('i"');

      const boundaries = plugin.getWordBoundaries(context);
      expect(boundaries).not.toBeNull();
      expect(boundaries?.start.line).toBe(0);
      expect(boundaries?.start.column).toBe(7); // After opening quote
      expect(boundaries?.end.line).toBe(0);
      expect(boundaries?.end.column).toBe(12); // At closing quote
    });

    it('should find single quotes with cursor inside', () => {
      buffer.insertLine(0, "Hello 'world'!");
      context.setBuffer(buffer);
      context.setCursor(new CursorPosition(0, 8)); // Cursor on 'w' in 'world'
      context.setCurrentPattern("i'");

      const boundaries = plugin.getWordBoundaries(context);
      expect(boundaries).not.toBeNull();
      expect(boundaries?.start.line).toBe(0);
      expect(boundaries?.start.column).toBe(7); // After opening quote
      expect(boundaries?.end.line).toBe(0);
      expect(boundaries?.end.column).toBe(12); // At closing quote
    });

    it('should find backticks with cursor inside', () => {
      buffer.insertLine(0, 'Hello `world`!');
      context.setBuffer(buffer);
      context.setCursor(new CursorPosition(0, 8)); // Cursor on 'w' in `world`
      context.setCurrentPattern('i`');

      const boundaries = plugin.getWordBoundaries(context);
      expect(boundaries).not.toBeNull();
      expect(boundaries?.start.line).toBe(0);
      expect(boundaries?.start.column).toBe(7); // After opening quote
      expect(boundaries?.end.line).toBe(0);
      expect(boundaries?.end.column).toBe(12); // At closing quote
    });

    it('should work with cursor on opening quote', () => {
      buffer.insertLine(0, 'Say "hello"');
      context.setBuffer(buffer);
      context.setCursor(new CursorPosition(0, 4)); // Cursor on opening quote
      context.setCurrentPattern('i"');

      const boundaries = plugin.getWordBoundaries(context);
      expect(boundaries).not.toBeNull();
      expect(boundaries?.start.column).toBe(5); // After opening quote
      expect(boundaries?.end.column).toBe(10); // At closing quote
    });

    it('should work with cursor on closing quote', () => {
      buffer.insertLine(0, 'Say "hello"');
      context.setBuffer(buffer);
      context.setCursor(new CursorPosition(0, 10)); // Cursor on closing quote
      context.setCurrentPattern('i"');

      const boundaries = plugin.getWordBoundaries(context);
      expect(boundaries).not.toBeNull();
      expect(boundaries?.start.column).toBe(5); // After opening quote
      expect(boundaries?.end.column).toBe(10); // At closing quote
    });

    it('should return null when cursor is outside quotes', () => {
      buffer.insertLine(0, 'Hello "world"!');
      context.setBuffer(buffer);
      context.setCursor(new CursorPosition(0, 2)); // Cursor on 'l' in Hello
      context.setCurrentPattern('i"');

      const boundaries = plugin.getWordBoundaries(context);
      expect(boundaries).toBeNull();
    });

    it('should return null when no quotes exist', () => {
      buffer.insertLine(0, 'Hello world!');
      context.setBuffer(buffer);
      context.setCursor(new CursorPosition(0, 6));
      context.setCurrentPattern('i"');

      const boundaries = plugin.getWordBoundaries(context);
      expect(boundaries).toBeNull();
    });

    it('should return null when only one quote exists', () => {
      buffer.insertLine(0, 'Hello "world');
      context.setBuffer(buffer);
      context.setCursor(new CursorPosition(0, 8));
      context.setCurrentPattern('i"');

      const boundaries = plugin.getWordBoundaries(context);
      expect(boundaries).toBeNull();
    });

    it('should handle empty quotes', () => {
      buffer.insertLine(0, 'Hello ""');
      context.setBuffer(buffer);
      context.setCursor(new CursorPosition(0, 7)); // Cursor between quotes
      context.setCurrentPattern('i"');

      const boundaries = plugin.getWordBoundaries(context);
      expect(boundaries).not.toBeNull();
      expect(boundaries?.start.column).toBe(7); // After opening quote
      expect(boundaries?.end.column).toBe(7); // At closing quote (same position)
    });

    it('should handle multiple quote pairs on same line', () => {
      buffer.insertLine(0, 'Say "hello" and "world"');
      context.setBuffer(buffer);
      context.setCursor(new CursorPosition(0, 18)); // Cursor on 'o' in "world"
      context.setCurrentPattern('i"');

      const boundaries = plugin.getWordBoundaries(context);
      expect(boundaries).not.toBeNull();
      expect(boundaries?.start.column).toBe(17); // After opening quote of "world" (position 16 is ")
      expect(boundaries?.end.column).toBe(22); // At closing quote of "world"
    });
  });
});
