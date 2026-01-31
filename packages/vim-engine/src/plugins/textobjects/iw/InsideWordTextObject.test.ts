/**
 * InsideWordTextObject Tests
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { InsideWordTextObject } from './InsideWordTextObject';
import { ExecutionContext } from '../../../plugin/ExecutionContext';
import { VimState } from '../../../state/VimState';
import { CursorPosition } from '../../../state/CursorPosition';
import { TextBuffer } from '../../../state/TextBuffer';
import { VIM_MODE } from '../../../state/VimMode';

describe('InsideWordTextObject', () => {
  let plugin: InsideWordTextObject;
  let context: ExecutionContext;
  let state: VimState;

  beforeEach(() => {
    plugin = new InsideWordTextObject();
    state = new VimState('Hello world\nTest line\nAnother line');
    context = new ExecutionContext(state);
  });

  describe('plugin metadata', () => {
    it('should have correct name', () => {
      expect(plugin.name).toBe('textobject-iw');
    });

    it('should have correct version', () => {
      expect(plugin.version).toBe('1.0.0');
    });

    it('should have correct description', () => {
      expect(plugin.description).toBe('Inside word text object (iw)');
    });

    it('should have iw pattern', () => {
      expect(plugin.patterns).toContain('iw');
    });

    it('should support OPERATOR_PENDING mode', () => {
      expect(plugin.modes).toContain('OPERATOR_PENDING');
    });

    it('should support VISUAL mode', () => {
      expect(plugin.modes).toContain('VISUAL');
    });
  });

  describe('getWordBoundaries', () => {
    it('should find word boundaries at cursor position', () => {
      state.cursor = new CursorPosition(0, 6); // On 'w' in "world"

      const boundaries = plugin.getWordBoundaries(context);

      expect(boundaries).not.toBeNull();
      expect(boundaries?.start.line).toBe(0);
      expect(boundaries?.start.column).toBe(6);
      expect(boundaries?.end.line).toBe(0);
      expect(boundaries?.end.column).toBe(11);
    });

    it('should find word at start of line', () => {
      state.cursor = new CursorPosition(0, 0); // On 'H' in "Hello"

      const boundaries = plugin.getWordBoundaries(context);

      expect(boundaries).not.toBeNull();
      expect(boundaries?.start.column).toBe(0);
      expect(boundaries?.end.column).toBe(5);
    });

    it('should find word at end of line', () => {
      state.cursor = new CursorPosition(0, 10); // On 'd' in "world"

      const boundaries = plugin.getWordBoundaries(context);

      expect(boundaries).not.toBeNull();
      expect(boundaries?.start.column).toBe(6);
      expect(boundaries?.end.column).toBe(11);
    });

    it('should return null when cursor is on whitespace', () => {
      state.cursor = new CursorPosition(0, 5); // On space between "Hello" and "world"

      const boundaries = plugin.getWordBoundaries(context);

      expect(boundaries).toBeNull();
    });

    it('should return null on empty line', () => {
      state.buffer = new TextBuffer('');
      state.cursor = new CursorPosition(0, 0);

      const boundaries = plugin.getWordBoundaries(context);

      expect(boundaries).toBeNull();
    });

    it('should return null on empty buffer', () => {
      state.buffer = new TextBuffer();
      state.cursor = new CursorPosition(0, 0);

      const boundaries = plugin.getWordBoundaries(context);

      expect(boundaries).toBeNull();
    });

    it('should handle cursor beyond line length', () => {
      state.cursor = new CursorPosition(0, 100); // Way beyond line

      const boundaries = plugin.getWordBoundaries(context);

      expect(boundaries).not.toBeNull();
      // Should clamp to last character
      expect(boundaries?.start.column).toBe(6);
      expect(boundaries?.end.column).toBe(11);
    });

    it('should handle words with punctuation', () => {
      state.buffer.setContent('Hello, world!');
      state.cursor = new CursorPosition(0, 2); // On 'l' in "Hello"

      const boundaries = plugin.getWordBoundaries(context);

      expect(boundaries).not.toBeNull();
      expect(boundaries?.start.column).toBe(0);
      expect(boundaries?.end.column).toBe(5);
    });

    it('should handle punctuation as separate word', () => {
      state.buffer.setContent('Hello, world!');
      state.cursor = new CursorPosition(0, 5); // On ','

      const boundaries = plugin.getWordBoundaries(context);

      expect(boundaries).not.toBeNull();
      expect(boundaries?.start.column).toBe(5);
      expect(boundaries?.end.column).toBe(6);
    });
  });

  describe('pattern validation', () => {
    it('should validate iw pattern', () => {
      expect(plugin.validatePattern('iw')).toBe(true);
    });

    it('should not validate other patterns', () => {
      expect(plugin.validatePattern('i')).toBe(false);
      expect(plugin.validatePattern('w')).toBe(false);
      expect(plugin.validatePattern('aw')).toBe(false);
    });
  });
});
