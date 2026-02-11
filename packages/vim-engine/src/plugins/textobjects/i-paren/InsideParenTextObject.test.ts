/**
 * InsideParenTextObject Tests
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { InsideParenTextObject } from './InsideParenTextObject';
import { ExecutionContext } from '../../../plugin/ExecutionContext';
import { VimState } from '../../../state/VimState';
import { CursorPosition } from '../../../state/CursorPosition';
import { TextBuffer } from '../../../state/TextBuffer';
import { VIM_MODE } from '../../../state/VimMode';

describe('InsideParenTextObject', () => {
  let plugin: InsideParenTextObject;
  let context: ExecutionContext;
  let state: VimState;

  beforeEach(() => {
    plugin = new InsideParenTextObject();
    state = new VimState('');
    context = new ExecutionContext(state);
  });

  describe('plugin metadata', () => {
    it('should have correct name', () => {
      expect(plugin.name).toBe('textobject-i-paren');
    });

    it('should have correct version', () => {
      expect(plugin.version).toBe('1.0.0');
    });

    it('should have correct description', () => {
      expect(plugin.description).toBe('Inside parenthesis text object (i()');
    });

    it('should have i( pattern', () => {
      expect(plugin.patterns).toContain('i(');
    });

    it('should support OPERATOR_PENDING mode', () => {
      expect(plugin.modes).toContain('OPERATOR_PENDING');
    });

    it('should support VISUAL mode', () => {
      expect(plugin.modes).toContain('VISUAL');
    });
  });

  describe('getWordBoundaries', () => {
    it('should find content inside parentheses on same line', () => {
      state.buffer = new TextBuffer('(hello world)');
      state.cursor = new CursorPosition(0, 7); // Cursor on 'o' in "world"

      const boundaries = plugin.getWordBoundaries(context);

      expect(boundaries).not.toBeNull();
      expect(boundaries?.start.line).toBe(0);
      expect(boundaries?.start.column).toBe(1); // After '('
      expect(boundaries?.end.line).toBe(0);
      expect(boundaries?.end.column).toBe(12); // Before ')'
    });

    it('should find content when cursor is right after opening parenthesis', () => {
      state.buffer = new TextBuffer('(hello world)');
      state.cursor = new CursorPosition(0, 1); // Right after '('

      const boundaries = plugin.getWordBoundaries(context);

      expect(boundaries).not.toBeNull();
      expect(boundaries?.start.column).toBe(1);
      expect(boundaries?.end.column).toBe(12);
    });

    it('should find content when cursor is right before closing parenthesis', () => {
      state.buffer = new TextBuffer('(hello world)');
      state.cursor = new CursorPosition(0, 11); // Right before ')' (on 'd' in "world")

      const boundaries = plugin.getWordBoundaries(context);

      expect(boundaries).not.toBeNull();
      expect(boundaries?.start.column).toBe(1);
      expect(boundaries?.end.column).toBe(12);
    });

    it('should handle multi-line parentheses', () => {
      state.buffer = new TextBuffer([
        '(',
        '  hello world',
        ')',
      ]);
      state.cursor = new CursorPosition(1, 5); // Cursor on 'o' in "hello"

      const boundaries = plugin.getWordBoundaries(context);

      expect(boundaries).not.toBeNull();
      expect(boundaries?.start.line).toBe(0);
      expect(boundaries?.start.column).toBe(1); // After '('
      expect(boundaries?.end.line).toBe(2);
      expect(boundaries?.end.column).toBe(0); // Before ')'
    });

    it('should find innermost pair when cursor is in nested parentheses', () => {
      state.buffer = new TextBuffer('(outer (inner) content)');
      state.cursor = new CursorPosition(0, 15); // Cursor in "content"

      const boundaries = plugin.getWordBoundaries(context);

      expect(boundaries).not.toBeNull();
      // Cursor is in "content", so it should find the outer parentheses
      // which enclose "outer (inner) content"
      expect(boundaries?.start.column).toBe(1); // After first '('
      expect(boundaries?.end.column).toBe(22); // Before last ')'
    });

    it('should handle nested parentheses - cursor in inner parentheses', () => {
      state.buffer = new TextBuffer('(outer (inner))');
      state.cursor = new CursorPosition(0, 10); // Cursor in "inner" (position 10 is on 'r')

      const boundaries = plugin.getWordBoundaries(context);

      expect(boundaries).not.toBeNull();
      // Cursor is in "inner", so it should find the inner parentheses
      // The inner parentheses start at position 7 (( o u t e r _ ()
      // After the '(', the inner content starts at position 8
      // But we're returning boundaries relative to the inner parentheses
      // Inner open is at column 7, so inner content starts at 8
      expect(boundaries?.start.column).toBe(8); // After inner '('
      expect(boundaries?.end.column).toBe(13); // Before inner ')'
    });

    it('should return null when cursor is before the opening parenthesis', () => {
      state.buffer = new TextBuffer('hello (world)');
      state.cursor = new CursorPosition(0, 2); // Cursor on 'l' in "hello"

      const boundaries = plugin.getWordBoundaries(context);

      // Cursor is at position 2, which is before the '(' at position 6
      // Since we require cursor to be strictly inside the pair, this should return null
      expect(boundaries).toBeNull();
    });

    it('should return null when no opening parenthesis exists', () => {
      state.buffer = new TextBuffer('hello world');
      state.cursor = new CursorPosition(0, 5);

      const boundaries = plugin.getWordBoundaries(context);

      expect(boundaries).toBeNull();
    });

    it('should return null when no closing parenthesis exists', () => {
      state.buffer = new TextBuffer('(hello world');
      state.cursor = new CursorPosition(0, 5);

      const boundaries = plugin.getWordBoundaries(context);

      expect(boundaries).toBeNull();
    });

    it('should return null on empty buffer', () => {
      state.buffer = new TextBuffer('');
      state.cursor = new CursorPosition(0, 0);

      const boundaries = plugin.getWordBoundaries(context);

      expect(boundaries).toBeNull();
    });

    it('should return null for empty parentheses', () => {
      state.buffer = new TextBuffer('()');
      state.cursor = new CursorPosition(0, 1); // Between parentheses

      const boundaries = plugin.getWordBoundaries(context);

      // Empty parentheses - there's no content to select
      expect(boundaries).toBeNull();
    });

    it('should handle parentheses with only whitespace', () => {
      state.buffer = new TextBuffer('(   )');
      state.cursor = new CursorPosition(0, 2); // On middle space

      const boundaries = plugin.getWordBoundaries(context);

      expect(boundaries).not.toBeNull();
      expect(boundaries?.start.column).toBe(1); // After '('
      expect(boundaries?.end.column).toBe(4); // Before ')'
    });

    it('should handle parentheses across multiple lines with content', () => {
      state.buffer = new TextBuffer([
        'function test() (',
        '  const x = 1;',
        '  const y = 2;',
        ')',
      ]);
      state.cursor = new CursorPosition(2, 10); // Cursor on '2'

      const boundaries = plugin.getWordBoundaries(context);

      expect(boundaries).not.toBeNull();
      expect(boundaries?.start.line).toBe(0);
      // 'function test() (' has length 17, so '(' is at column 16
      // Inner content starts at column 17
      expect(boundaries?.start.column).toBe(17); // After '(' on first line
      expect(boundaries?.end.line).toBe(3);
      expect(boundaries?.end.column).toBe(0); // Before ')'
    });

    it('should find parenthesis on previous line', () => {
      state.buffer = new TextBuffer([
        '(',
        '  line 2',
        '  line 3',
        ')',
      ]);
      state.cursor = new CursorPosition(2, 5);

      const boundaries = plugin.getWordBoundaries(context);

      expect(boundaries).not.toBeNull();
      expect(boundaries?.start.line).toBe(0);
      expect(boundaries?.start.column).toBe(1); // After '('
      expect(boundaries?.end.line).toBe(3);
      expect(boundaries?.end.column).toBe(0); // Before ')'
    });

    it('should handle real-world code example', () => {
      state.buffer = new TextBuffer('const obj = ( name: "test", value: 42 );');
      state.cursor = new CursorPosition(0, 20); // Cursor on "test"

      const boundaries = plugin.getWordBoundaries(context);

      expect(boundaries).not.toBeNull();
      expect(boundaries?.start.column).toBe(13); // After '('
      expect(boundaries?.end.column).toBe(38); // Before ')'
    });

    it('should handle cursor at start of buffer on parenthesis', () => {
      state.buffer = new TextBuffer('(content)');
      state.cursor = new CursorPosition(0, 0); // On '('

      const boundaries = plugin.getWordBoundaries(context);

      // Cursor is on the opening parenthesis, not strictly inside
      // So it should return null
      expect(boundaries).toBeNull();
    });

    it('should return null when cursor is after the closing parenthesis', () => {
      state.buffer = new TextBuffer('(content)');
      state.cursor = new CursorPosition(0, 9); // After ')'

      const boundaries = plugin.getWordBoundaries(context);

      // Cursor is after the closing parenthesis, not strictly inside
      expect(boundaries).toBeNull();
    });

    it('should handle cursor at start of inner content', () => {
      state.buffer = new TextBuffer('(content)');
      state.cursor = new CursorPosition(0, 1); // Right after '('

      const boundaries = plugin.getWordBoundaries(context);

      expect(boundaries).not.toBeNull();
      expect(boundaries?.start.column).toBe(1);
      expect(boundaries?.end.column).toBe(8);
    });

    it('should handle function call arguments', () => {
      state.buffer = new TextBuffer('myFunction(arg1, arg2, arg3)');
      state.cursor = new CursorPosition(0, 15); // Cursor on '2' in 'arg2'

      const boundaries = plugin.getWordBoundaries(context);

      expect(boundaries).not.toBeNull();
      expect(boundaries?.start.column).toBe(11); // After '('
      expect(boundaries?.end.column).toBe(27); // Before ')'
    });

    it('should handle deeply nested parentheses', () => {
      state.buffer = new TextBuffer('((nested (deep)))');
      state.cursor = new CursorPosition(0, 11); // Cursor on 'e' in 'deep'

      const boundaries = plugin.getWordBoundaries(context);

      expect(boundaries).not.toBeNull();
      // Cursor is in "deep", which is inside the innermost parentheses
      // Innermost parentheses are at positions 9 and 14
      expect(boundaries?.start.column).toBe(10); // After inner '(' at position 9
      expect(boundaries?.end.column).toBe(14); // Before inner ')' at position 14
    });
  });

  describe('pattern validation', () => {
    it('should validate i( pattern', () => {
      expect(plugin.validatePattern('i(')).toBe(true);
    });

    it('should not validate other patterns', () => {
      expect(plugin.validatePattern('i')).toBe(false);
      expect(plugin.validatePattern('(')).toBe(false);
      expect(plugin.validatePattern('iw')).toBe(false);
      expect(plugin.validatePattern('a(')).toBe(false);
    });
  });
});
