/**
 * AroundQuoteTextObject Tests
 */
import { AroundQuoteTextObject } from './AroundQuoteTextObject';
import { ExecutionContext } from '../../../plugin/ExecutionContext';
import { VimMode, VIM_MODE } from '../../../state/VimMode';
import { TextBuffer } from '../../../state/TextBuffer';
import { CursorPosition } from '../../../state/CursorPosition';

describe('AroundQuoteTextObject', () => {
  let plugin: AroundQuoteTextObject;
  let buffer: TextBuffer;
  let context: ExecutionContext;

  beforeEach(() => {
    plugin = new AroundQuoteTextObject();
    buffer = new TextBuffer();
    context = new ExecutionContext();
    context.setMode(VIM_MODE.NORMAL);
  });

  describe('getWordBoundaries', () => {
    describe('double quotes (a")', () => {
      it('should find double quotes with cursor inside - includes quotes', () => {
        buffer.insertLine(0, 'Hello "world"!');
        context.setBuffer(buffer);
        context.setCursor(new CursorPosition(0, 8)); // Cursor on 'w' in "world"
        context.setCurrentPattern('a"');

        const boundaries = plugin.getWordBoundaries(context);
        expect(boundaries).not.toBeNull();
        expect(boundaries?.start.line).toBe(0);
        expect(boundaries?.start.column).toBe(6); // At opening quote
        expect(boundaries?.end.line).toBe(0);
        expect(boundaries?.end.column).toBe(13); // After closing quote
      });

      it('should work with cursor on opening quote', () => {
        buffer.insertLine(0, 'Say "hello"');
        context.setBuffer(buffer);
        context.setCursor(new CursorPosition(0, 4)); // Cursor on opening quote
        context.setCurrentPattern('a"');

        const boundaries = plugin.getWordBoundaries(context);
        expect(boundaries).not.toBeNull();
        expect(boundaries?.start.column).toBe(4); // At opening quote
        expect(boundaries?.end.column).toBe(11); // After closing quote
      });

      it('should work with cursor on closing quote', () => {
        buffer.insertLine(0, 'Say "hello"');
        context.setBuffer(buffer);
        context.setCursor(new CursorPosition(0, 10)); // Cursor on closing quote
        context.setCurrentPattern('a"');

        const boundaries = plugin.getWordBoundaries(context);
        expect(boundaries).not.toBeNull();
        expect(boundaries?.start.column).toBe(4); // At opening quote
        expect(boundaries?.end.column).toBe(11); // After closing quote
      });

      it('should handle empty quotes - includes both quotes', () => {
        buffer.insertLine(0, 'Hello ""');
        context.setBuffer(buffer);
        context.setCursor(new CursorPosition(0, 7)); // Cursor between quotes
        context.setCurrentPattern('a"');

        const boundaries = plugin.getWordBoundaries(context);
        expect(boundaries).not.toBeNull();
        expect(boundaries?.start.column).toBe(6); // At opening quote
        expect(boundaries?.end.column).toBe(8); // After closing quote
      });
    });

    describe('single quotes (a\')', () => {
      it('should find single quotes with cursor inside - includes quotes', () => {
        buffer.insertLine(0, "Hello 'world'!");
        context.setBuffer(buffer);
        context.setCursor(new CursorPosition(0, 8)); // Cursor on 'w' in 'world'
        context.setCurrentPattern("a'");

        const boundaries = plugin.getWordBoundaries(context);
        expect(boundaries).not.toBeNull();
        expect(boundaries?.start.line).toBe(0);
        expect(boundaries?.start.column).toBe(6); // At opening quote
        expect(boundaries?.end.line).toBe(0);
        expect(boundaries?.end.column).toBe(13); // After closing quote
      });

      it('should handle empty single quotes', () => {
        buffer.insertLine(0, "Hello ''");
        context.setBuffer(buffer);
        context.setCursor(new CursorPosition(0, 7)); // Cursor between quotes
        context.setCurrentPattern("a'");

        const boundaries = plugin.getWordBoundaries(context);
        expect(boundaries).not.toBeNull();
        expect(boundaries?.start.column).toBe(6); // At opening quote
        expect(boundaries?.end.column).toBe(8); // After closing quote
      });
    });

    describe('backticks (a`)', () => {
      it('should find backticks with cursor inside - includes quotes', () => {
        buffer.insertLine(0, 'Hello `world`!');
        context.setBuffer(buffer);
        context.setCursor(new CursorPosition(0, 8)); // Cursor on 'w' in `world`
        context.setCurrentPattern('a`');

        const boundaries = plugin.getWordBoundaries(context);
        expect(boundaries).not.toBeNull();
        expect(boundaries?.start.line).toBe(0);
        expect(boundaries?.start.column).toBe(6); // At opening quote
        expect(boundaries?.end.line).toBe(0);
        expect(boundaries?.end.column).toBe(13); // After closing quote
      });

      it('should handle empty backticks', () => {
        buffer.insertLine(0, 'Hello ``');
        context.setBuffer(buffer);
        context.setCursor(new CursorPosition(0, 7)); // Cursor between quotes
        context.setCurrentPattern('a`');

        const boundaries = plugin.getWordBoundaries(context);
        expect(boundaries).not.toBeNull();
        expect(boundaries?.start.column).toBe(6); // At opening quote
        expect(boundaries?.end.column).toBe(8); // After closing quote
      });
    });

    describe('edge cases', () => {
      it('should return null when cursor is outside quotes', () => {
        buffer.insertLine(0, 'Hello "world"!');
        context.setBuffer(buffer);
        context.setCursor(new CursorPosition(0, 2)); // Cursor on 'l' in Hello
        context.setCurrentPattern('a"');

        const boundaries = plugin.getWordBoundaries(context);
        expect(boundaries).toBeNull();
      });

      it('should return null when no quotes exist', () => {
        buffer.insertLine(0, 'Hello world!');
        context.setBuffer(buffer);
        context.setCursor(new CursorPosition(0, 6));
        context.setCurrentPattern('a"');

        const boundaries = plugin.getWordBoundaries(context);
        expect(boundaries).toBeNull();
      });

      it('should return null when only one quote exists', () => {
        buffer.insertLine(0, 'Hello "world');
        context.setBuffer(buffer);
        context.setCursor(new CursorPosition(0, 8));
        context.setCurrentPattern('a"');

        const boundaries = plugin.getWordBoundaries(context);
        expect(boundaries).toBeNull();
      });

      it('should handle multiple quote pairs on same line', () => {
        buffer.insertLine(0, 'Say "hello" and "world"');
        context.setBuffer(buffer);
        context.setCursor(new CursorPosition(0, 18)); // Cursor on 'o' in second "world"
        context.setCurrentPattern('a"');

        const boundaries = plugin.getWordBoundaries(context);
        expect(boundaries).not.toBeNull();
        expect(boundaries?.start.column).toBe(16); // At opening quote of "world"
        expect(boundaries?.end.column).toBe(23); // After closing quote of "world"
      });

      it('should handle nested quotes of different types correctly', () => {
        buffer.insertLine(0, '"outer \'inner\' outer"');
        context.setBuffer(buffer);
        context.setCursor(new CursorPosition(0, 10)); // Cursor on 'i' in 'inner'
        context.setCurrentPattern('a"');

        const boundaries = plugin.getWordBoundaries(context);
        expect(boundaries).not.toBeNull();
        expect(boundaries?.start.column).toBe(0); // At opening double quote
        expect(boundaries?.end.column).toBe(21); // After closing double quote
      });

      it('should find inner single quotes in nested quote scenario', () => {
        buffer.insertLine(0, '"outer \'inner\' outer"');
        context.setBuffer(buffer);
        context.setCursor(new CursorPosition(0, 9)); // Cursor on opening single quote
        context.setCurrentPattern("a'");

        const boundaries = plugin.getWordBoundaries(context);
        expect(boundaries).not.toBeNull();
        expect(boundaries?.start.column).toBe(7); // At opening single quote
        expect(boundaries?.end.column).toBe(14); // After closing single quote
      });

      it('should return null for empty buffer', () => {
        context.setBuffer(buffer);
        context.setCursor(new CursorPosition(0, 0));
        context.setCurrentPattern('a"');

        const boundaries = plugin.getWordBoundaries(context);
        expect(boundaries).toBeNull();
      });
    });
  });

  describe('plugin metadata', () => {
    it('should have correct name', () => {
      expect(plugin.name).toBe('textobject-aquote');
    });

    it('should have correct patterns', () => {
      expect(plugin.patterns).toContain('a"');
      expect(plugin.patterns).toContain("a'");
      expect(plugin.patterns).toContain('a`');
    });

    it('should work in operator-pending and visual modes', () => {
      expect(plugin.modes).toContain(VIM_MODE.OPERATOR_PENDING);
      expect(plugin.modes).toContain(VIM_MODE.VISUAL);
    });
  });
});
