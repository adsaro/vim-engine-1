/**
 * Search Utilities Tests
 */
import { TextBuffer } from '../../../state/TextBuffer';
import { CursorPosition } from '../../../state/CursorPosition';
import {
  findAllMatches,
  findNextMatch,
  extractWordUnderCursor,
  patternToRegex,
} from './searchUtils';

describe('searchUtils', () => {
  describe('findAllMatches', () => {
    describe('forward direction', () => {
      it('should find all matches in forward direction', () => {
        const buffer = new TextBuffer('hello world hello');
        const pattern = /hello/g;
        const matches = findAllMatches(buffer, pattern, 0, 'forward');
        
        expect(matches).toHaveLength(2);
        expect(matches[0]).toEqual(new CursorPosition(0, 0));
        expect(matches[1]).toEqual(new CursorPosition(0, 12));
      });

      it('should find matches on multiple lines', () => {
        const buffer = new TextBuffer('hello\nworld\nhello');
        const pattern = /hello/g;
        const matches = findAllMatches(buffer, pattern, 0, 'forward');
        
        expect(matches).toHaveLength(2);
        expect(matches[0]).toEqual(new CursorPosition(0, 0));
        expect(matches[1]).toEqual(new CursorPosition(2, 0));
      });

      it('should start from specified line', () => {
        const buffer = new TextBuffer('hello\nworld\nhello\ntest');
        const pattern = /hello/g;
        const matches = findAllMatches(buffer, pattern, 2, 'forward');
        
        expect(matches).toHaveLength(1);
        expect(matches[0]).toEqual(new CursorPosition(2, 0));
      });

      it('should handle pattern with special characters', () => {
        const buffer = new TextBuffer('test.test.test');
        const pattern = /test/g;
        const matches = findAllMatches(buffer, pattern, 0, 'forward');
        
        expect(matches).toHaveLength(3);
        expect(matches[0]).toEqual(new CursorPosition(0, 0));
        expect(matches[1]).toEqual(new CursorPosition(0, 5));
        expect(matches[2]).toEqual(new CursorPosition(0, 10));
      });

      it('should return empty array when no matches found', () => {
        const buffer = new TextBuffer('hello world');
        const pattern = /xyz/g;
        const matches = findAllMatches(buffer, pattern, 0, 'forward');
        
        expect(matches).toEqual([]);
      });

      it('should handle empty buffer', () => {
        const buffer = new TextBuffer('');
        const pattern = /test/g;
        const matches = findAllMatches(buffer, pattern, 0, 'forward');
        
        expect(matches).toEqual([]);
      });
    });

    describe('backward direction', () => {
      it('should find all matches in backward direction', () => {
        const buffer = new TextBuffer('hello world hello');
        const pattern = /hello/g;
        const matches = findAllMatches(buffer, pattern, 0, 'backward');
        
        expect(matches).toHaveLength(2);
        expect(matches[0]).toEqual(new CursorPosition(0, 12));
        expect(matches[1]).toEqual(new CursorPosition(0, 0));
      });

      it('should find matches on multiple lines in reverse order', () => {
        const buffer = new TextBuffer('hello\nworld\nhello');
        const pattern = /hello/g;
        const matches = findAllMatches(buffer, pattern, 0, 'backward');
        
        expect(matches).toHaveLength(2);
        expect(matches[0]).toEqual(new CursorPosition(2, 0));
        expect(matches[1]).toEqual(new CursorPosition(0, 0));
      });

      it('should start from specified line in backward direction', () => {
        const buffer = new TextBuffer('hello\nworld\ntest\nhello');
        const pattern = /hello/g;
        const matches = findAllMatches(buffer, pattern, 2, 'backward');
        
        expect(matches).toHaveLength(1);
        expect(matches[0]).toEqual(new CursorPosition(0, 0));
      });
    });

    describe('zero-width matches', () => {
      it('should handle zero-width matches correctly', () => {
        const buffer = new TextBuffer('hello world');
        const pattern = /\b/g; // Word boundary - zero-width match
        const matches = findAllMatches(buffer, pattern, 0, 'forward');
        
        // Should find word boundaries without infinite loop
        expect(matches.length).toBeGreaterThan(0);
        expect(matches.length).toBeLessThan(100); // Prevent infinite loop
      });

      it('should prevent infinite loops for zero-width matches', () => {
        const buffer = new TextBuffer('test');
        const pattern = /(?=t)/g; // Lookahead - zero-width match
        const matches = findAllMatches(buffer, pattern, 0, 'forward');
        
        // Should find matches without infinite loop
        expect(matches.length).toBeGreaterThan(0);
        expect(matches.length).toBeLessThan(100);
      });
    });
  });

  describe('findNextMatch', () => {
    describe('forward direction', () => {
      it('should find next match in forward direction', () => {
        const matches = [
          new CursorPosition(0, 0),
          new CursorPosition(0, 5),
          new CursorPosition(1, 0),
        ];
        const cursor = new CursorPosition(0, 0);
        
        const result = findNextMatch(matches, cursor, 'forward', false);
        
        expect(result).toEqual(new CursorPosition(0, 5));
      });

      it('should find next match when cursor is not on a match', () => {
        const matches = [
          new CursorPosition(0, 5),
          new CursorPosition(0, 10),
        ];
        const cursor = new CursorPosition(0, 2);
        
        const result = findNextMatch(matches, cursor, 'forward', false);
        
        expect(result).toEqual(new CursorPosition(0, 5));
      });

      it('should return null when no more matches forward', () => {
        const matches = [
          new CursorPosition(0, 0),
          new CursorPosition(0, 5),
        ];
        const cursor = new CursorPosition(0, 10);
        
        const result = findNextMatch(matches, cursor, 'forward', false);
        
        expect(result).toBeNull();
      });

      it('should wrap to first match when wrap is enabled', () => {
        const matches = [
          new CursorPosition(0, 0),
          new CursorPosition(0, 5),
        ];
        const cursor = new CursorPosition(0, 10);
        
        const result = findNextMatch(matches, cursor, 'forward', true);
        
        expect(result).toEqual(new CursorPosition(0, 0));
      });
    });

    describe('backward direction', () => {
      it('should find previous match in backward direction', () => {
        const matches = [
          new CursorPosition(0, 0),
          new CursorPosition(0, 5),
          new CursorPosition(1, 0),
        ];
        const cursor = new CursorPosition(0, 5);
        
        const result = findNextMatch(matches, cursor, 'backward', false);
        
        expect(result).toEqual(new CursorPosition(0, 0));
      });

      it('should find previous match when cursor is not on a match', () => {
        const matches = [
          new CursorPosition(0, 0),
          new CursorPosition(0, 10),
        ];
        const cursor = new CursorPosition(0, 5);
        
        const result = findNextMatch(matches, cursor, 'backward', false);
        
        expect(result).toEqual(new CursorPosition(0, 0));
      });

      it('should return null when no more matches backward', () => {
        const matches = [
          new CursorPosition(0, 5),
          new CursorPosition(0, 10),
        ];
        const cursor = new CursorPosition(0, 0);
        
        const result = findNextMatch(matches, cursor, 'backward', false);
        
        expect(result).toBeNull();
      });

      it('should wrap to last match when wrap is enabled', () => {
        const matches = [
          new CursorPosition(0, 5),
          new CursorPosition(0, 10),
        ];
        const cursor = new CursorPosition(0, 0);
        
        const result = findNextMatch(matches, cursor, 'backward', true);
        
        expect(result).toEqual(new CursorPosition(0, 10));
      });
    });

    describe('wrap behavior', () => {
      it('should wrap forward from last to first', () => {
        const matches = [
          new CursorPosition(0, 0),
          new CursorPosition(0, 5),
          new CursorPosition(0, 10),
        ];
        const cursor = new CursorPosition(0, 10);
        
        const result = findNextMatch(matches, cursor, 'forward', true);
        
        expect(result).toEqual(new CursorPosition(0, 0));
      });

      it('should wrap backward from first to last', () => {
        const matches = [
          new CursorPosition(0, 0),
          new CursorPosition(0, 5),
          new CursorPosition(0, 10),
        ];
        const cursor = new CursorPosition(0, 0);
        
        const result = findNextMatch(matches, cursor, 'backward', true);
        
        expect(result).toEqual(new CursorPosition(0, 10));
      });

      it('should not wrap when wrap is disabled', () => {
        const matches = [
          new CursorPosition(0, 0),
          new CursorPosition(0, 5),
        ];
        const cursor = new CursorPosition(0, 10);
        
        const result = findNextMatch(matches, cursor, 'forward', false);
        
        expect(result).toBeNull();
      });
    });

    describe('edge cases', () => {
      it('should handle empty matches array', () => {
        const matches: CursorPosition[] = [];
        const cursor = new CursorPosition(0, 0);
        
        const result = findNextMatch(matches, cursor, 'forward', false);
        
        expect(result).toBeNull();
      });

      it('should handle single match', () => {
        const matches = [new CursorPosition(0, 5)];
        const cursor = new CursorPosition(0, 0);
        
        const result = findNextMatch(matches, cursor, 'forward', false);
        
        expect(result).toEqual(new CursorPosition(0, 5));
      });

      it('should return null when single match and wrap disabled', () => {
        const matches = [new CursorPosition(0, 5)];
        const cursor = new CursorPosition(0, 5);
        
        const result = findNextMatch(matches, cursor, 'forward', false);
        
        expect(result).toBeNull();
      });

      it('should return same match when single match and wrap enabled', () => {
        const matches = [new CursorPosition(0, 5)];
        const cursor = new CursorPosition(0, 5);
        
        const result = findNextMatch(matches, cursor, 'forward', true);
        
        expect(result).toEqual(new CursorPosition(0, 5));
      });
    });
  });

  describe('extractWordUnderCursor', () => {
    describe('valid word extraction', () => {
      it('should extract word when cursor is on a word character', () => {
        const buffer = new TextBuffer('hello world');
        const cursor = new CursorPosition(0, 2);
        
        const result = extractWordUnderCursor(buffer, cursor);
        
        expect(result).toBe('hello');
      });

      it('should extract word when cursor is at start of word', () => {
        const buffer = new TextBuffer('hello world');
        const cursor = new CursorPosition(0, 0);
        
        const result = extractWordUnderCursor(buffer, cursor);
        
        expect(result).toBe('hello');
      });

      it('should extract word when cursor is at end of word', () => {
        const buffer = new TextBuffer('hello world');
        const cursor = new CursorPosition(0, 4);
        
        const result = extractWordUnderCursor(buffer, cursor);
        
        expect(result).toBe('hello');
      });

      it('should extract word with underscores', () => {
        const buffer = new TextBuffer('hello_world test');
        const cursor = new CursorPosition(0, 5);
        
        const result = extractWordUnderCursor(buffer, cursor);
        
        expect(result).toBe('hello_world');
      });

      it('should extract word with numbers', () => {
        const buffer = new TextBuffer('hello123 test');
        const cursor = new CursorPosition(0, 4);
        
        const result = extractWordUnderCursor(buffer, cursor);
        
        expect(result).toBe('hello123');
      });

      it('should extract word from middle of buffer', () => {
        const buffer = new TextBuffer('one two three four');
        const cursor = new CursorPosition(0, 6);
        
        const result = extractWordUnderCursor(buffer, cursor);
        
        expect(result).toBe('two');
      });
    });

    describe('non-word characters', () => {
      it('should return null when cursor is on whitespace', () => {
        const buffer = new TextBuffer('hello world');
        const cursor = new CursorPosition(0, 5);
        
        const result = extractWordUnderCursor(buffer, cursor);
        
        expect(result).toBeNull();
      });

      it('should return null when cursor is on punctuation', () => {
        const buffer = new TextBuffer('hello, world');
        const cursor = new CursorPosition(0, 5);
        
        const result = extractWordUnderCursor(buffer, cursor);
        
        expect(result).toBeNull();
      });

      it('should return null when cursor is on special character', () => {
        const buffer = new TextBuffer('hello!world');
        const cursor = new CursorPosition(0, 5);
        
        const result = extractWordUnderCursor(buffer, cursor);
        
        expect(result).toBeNull();
      });

      it('should return null when cursor is on hyphen', () => {
        const buffer = new TextBuffer('hello-world');
        const cursor = new CursorPosition(0, 5);
        
        const result = extractWordUnderCursor(buffer, cursor);
        
        expect(result).toBeNull();
      });
    });

    describe('edge cases', () => {
      it('should return null for empty buffer', () => {
        const buffer = new TextBuffer('');
        const cursor = new CursorPosition(0, 0);
        
        const result = extractWordUnderCursor(buffer, cursor);
        
        expect(result).toBeNull();
      });

      it('should return null when cursor is past end of line', () => {
        const buffer = new TextBuffer('hello');
        const cursor = new CursorPosition(0, 10);
        
        const result = extractWordUnderCursor(buffer, cursor);
        
        expect(result).toBeNull();
      });

      it('should return null when cursor is on empty line', () => {
        const buffer = new TextBuffer('hello\n\nworld');
        const cursor = new CursorPosition(1, 0);
        
        const result = extractWordUnderCursor(buffer, cursor);
        
        expect(result).toBeNull();
      });

      it('should handle single character word', () => {
        const buffer = new TextBuffer('a b c');
        const cursor = new CursorPosition(0, 0);
        
        const result = extractWordUnderCursor(buffer, cursor);
        
        expect(result).toBe('a');
      });

      it('should handle word at end of line', () => {
        const buffer = new TextBuffer('hello world');
        const cursor = new CursorPosition(0, 8);
        
        const result = extractWordUnderCursor(buffer, cursor);
        
        expect(result).toBe('world');
      });
    });

    describe('multi-line buffers', () => {
      it('should extract word from specific line', () => {
        const buffer = new TextBuffer('hello\nworld\ntest');
        const cursor = new CursorPosition(1, 2);
        
        const result = extractWordUnderCursor(buffer, cursor);
        
        expect(result).toBe('world');
      });

      it('should return null for empty line in multi-line buffer', () => {
        const buffer = new TextBuffer('hello\n\nworld');
        const cursor = new CursorPosition(1, 0);
        
        const result = extractWordUnderCursor(buffer, cursor);
        
        expect(result).toBeNull();
      });
    });
  });

  describe('patternToRegex', () => {
    describe('valid patterns', () => {
      it('should convert valid pattern to RegExp', () => {
        const result = patternToRegex('hello');
        
        expect(result).toBeInstanceOf(RegExp);
        expect(result?.source).toBe('hello');
        expect(result?.global).toBe(true);
      });

      it('should handle pattern with special regex characters', () => {
        const result = patternToRegex('test\\.txt');
        
        expect(result).toBeInstanceOf(RegExp);
        expect(result?.source).toBe('test\\.txt');
      });

      it('should handle pattern with character classes', () => {
        const result = patternToRegex('[a-z]+');
        
        expect(result).toBeInstanceOf(RegExp);
        expect(result?.source).toBe('[a-z]+');
      });

      it('should handle pattern with quantifiers', () => {
        const result = patternToRegex('test*');
        
        expect(result).toBeInstanceOf(RegExp);
        expect(result?.source).toBe('test*');
      });

      it('should handle pattern with anchors', () => {
        const result = patternToRegex('^test$');
        
        expect(result).toBeInstanceOf(RegExp);
        expect(result?.source).toBe('^test$');
      });

      it('should handle pattern with groups', () => {
        const result = patternToRegex('(test)+');
        
        expect(result).toBeInstanceOf(RegExp);
        expect(result?.source).toBe('(test)+');
      });

      it('should handle pattern with alternation', () => {
        const result = patternToRegex('test|example');
        
        expect(result).toBeInstanceOf(RegExp);
        expect(result?.source).toBe('test|example');
      });
    });

    describe('empty patterns', () => {
      it('should return null for empty string', () => {
        const result = patternToRegex('');
        
        expect(result).toBeNull();
      });

      it('should return null for whitespace-only string', () => {
        const result = patternToRegex('   ');
        
        expect(result).toBeNull();
      });
    });

    describe('invalid patterns', () => {
      it('should return null for invalid regex pattern', () => {
        const result = patternToRegex('[unclosed');
        
        expect(result).toBeNull();
      });

      it('should return null for pattern with unclosed bracket', () => {
        const result = patternToRegex('[unclosed');
        
        expect(result).toBeNull();
      });

      it('should return null for pattern with invalid quantifier', () => {
        const result = patternToRegex('*invalid');
        
        expect(result).toBeNull();
      });

      it('should return null for pattern with invalid group', () => {
        const result = patternToRegex('(?invalid)');
        
        expect(result).toBeNull();
      });
    });

    describe('global flag', () => {
      it('should always add global flag', () => {
        const result = patternToRegex('test');
        
        expect(result?.global).toBe(true);
      });

      it('should preserve global flag if already present', () => {
        const result = patternToRegex('test/g');
        
        expect(result?.global).toBe(true);
      });
    });
  });
});
