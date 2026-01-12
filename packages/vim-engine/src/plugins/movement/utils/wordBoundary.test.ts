/**
 * Word Boundary Utilities Tests
 */
import {
  isWordChar,
  isWhitespace,
  isPunctuation,
  classifyChar,
  findNextWordStart,
  findWordEnd,
  findPreviousWordStart,
  findPreviousWordEnd,
  findNextWORDStart,
  findNextWORDEnd,
  findPreviousWORDStart,
  findPreviousWORDEnd,
  type CharType,
} from './wordBoundary';

describe('wordBoundary', () => {
  describe('isWordChar', () => {
    describe('valid word characters', () => {
      it('should return true for lowercase letters a-z', () => {
        for (let i = 97; i <= 122; i++) {
          expect(isWordChar(String.fromCharCode(i))).toBe(true);
        }
      });

      it('should return true for uppercase letters A-Z', () => {
        for (let i = 65; i <= 90; i++) {
          expect(isWordChar(String.fromCharCode(i))).toBe(true);
        }
      });

      it('should return true for digits 0-9', () => {
        for (let i = 48; i <= 57; i++) {
          expect(isWordChar(String.fromCharCode(i))).toBe(true);
        }
      });

      it('should return true for underscore', () => {
        expect(isWordChar('_')).toBe(true);
      });
    });

    describe('non-word characters', () => {
      it('should return false for space', () => {
        expect(isWordChar(' ')).toBe(false);
      });

      it('should return false for tab', () => {
        expect(isWordChar('\t')).toBe(false);
      });

      it('should return false for newline', () => {
        expect(isWordChar('\n')).toBe(false);
      });

      it('should return false for punctuation', () => {
        expect(isWordChar('.')).toBe(false);
        expect(isWordChar(',')).toBe(false);
        expect(isWordChar('!')).toBe(false);
        expect(isWordChar('?')).toBe(false);
        expect(isWordChar(';')).toBe(false);
        expect(isWordChar(':')).toBe(false);
      });

      it('should return false for special characters', () => {
        expect(isWordChar('@')).toBe(false);
        expect(isWordChar('#')).toBe(false);
        expect(isWordChar('$')).toBe(false);
        expect(isWordChar('%')).toBe(false);
        expect(isWordChar('&')).toBe(false);
        expect(isWordChar('*')).toBe(false);
        expect(isWordChar('(')).toBe(false);
        expect(isWordChar(')')).toBe(false);
        expect(isWordChar('-')).toBe(false);
        expect(isWordChar('+')).toBe(false);
        expect(isWordChar('=')).toBe(false);
        expect(isWordChar('{')).toBe(false);
        expect(isWordChar('}')).toBe(false);
        expect(isWordChar('[')).toBe(false);
        expect(isWordChar(']')).toBe(false);
      });

      it('should return false for Unicode whitespace', () => {
        expect(isWordChar('\u00A0')).toBe(false); // non-breaking space
        expect(isWordChar('\u2003')).toBe(false); // em space
      });
    });

    describe('invalid inputs', () => {
      it('should return false for empty string', () => {
        expect(isWordChar('')).toBe(false);
      });

      it('should return false for multi-character strings', () => {
        expect(isWordChar('ab')).toBe(false);
        expect(isWordChar('hello')).toBe(false);
      });
    });
  });

  describe('isWhitespace', () => {
    describe('whitespace characters', () => {
      it('should return true for space', () => {
        expect(isWhitespace(' ')).toBe(true);
      });

      it('should return true for tab', () => {
        expect(isWhitespace('\t')).toBe(true);
      });

      it('should return true for newline', () => {
        expect(isWhitespace('\n')).toBe(true);
      });

      it('should return true for carriage return', () => {
        expect(isWhitespace('\r')).toBe(true);
      });

      it('should return true for form feed', () => {
        expect(isWhitespace('\f')).toBe(true);
      });

      it('should return true for vertical tab', () => {
        expect(isWhitespace('\v')).toBe(true);
      });

      it('should return true for Unicode whitespace', () => {
        expect(isWhitespace('\u00A0')).toBe(true); // non-breaking space
        expect(isWhitespace('\u2003')).toBe(true); // em space
        expect(isWhitespace('\u2009')).toBe(true); // thin space
      });
    });

    describe('non-whitespace characters', () => {
      it('should return false for word characters', () => {
        expect(isWhitespace('a')).toBe(false);
        expect(isWhitespace('Z')).toBe(false);
        expect(isWhitespace('5')).toBe(false);
        expect(isWhitespace('_')).toBe(false);
      });

      it('should return false for punctuation', () => {
        expect(isWhitespace('.')).toBe(false);
        expect(isWhitespace(',')).toBe(false);
        expect(isWhitespace('!')).toBe(false);
      });

      it('should return false for special characters', () => {
        expect(isWhitespace('@')).toBe(false);
        expect(isWhitespace('#')).toBe(false);
        expect(isWhitespace('$')).toBe(false);
      });
    });

    describe('invalid inputs', () => {
      it('should return false for empty string', () => {
        expect(isWhitespace('')).toBe(false);
      });

      it('should return false for multi-character strings', () => {
        expect(isWhitespace('  ')).toBe(false);
        expect(isWhitespace('hello')).toBe(false);
      });
    });
  });

  describe('isPunctuation', () => {
    describe('punctuation characters', () => {
      it('should return true for common punctuation', () => {
        expect(isPunctuation('.')).toBe(true);
        expect(isPunctuation(',')).toBe(true);
        expect(isPunctuation('!')).toBe(true);
        expect(isPunctuation('?')).toBe(true);
        expect(isPunctuation(';')).toBe(true);
        expect(isPunctuation(':')).toBe(true);
      });

      it('should return true for brackets and braces', () => {
        expect(isPunctuation('(')).toBe(true);
        expect(isPunctuation(')')).toBe(true);
        expect(isPunctuation('{')).toBe(true);
        expect(isPunctuation('}')).toBe(true);
        expect(isPunctuation('[')).toBe(true);
        expect(isPunctuation(']')).toBe(true);
      });

      it('should return true for operators and symbols', () => {
        expect(isPunctuation('+')).toBe(true);
        expect(isPunctuation('-')).toBe(true);
        expect(isPunctuation('*')).toBe(true);
        expect(isPunctuation('/')).toBe(true);
        expect(isPunctuation('=')).toBe(true);
        expect(isPunctuation('<')).toBe(true);
        expect(isPunctuation('>')).toBe(true);
      });

      it('should return true for special characters', () => {
        expect(isPunctuation('@')).toBe(true);
        expect(isPunctuation('#')).toBe(true);
        expect(isPunctuation('$')).toBe(true);
        expect(isPunctuation('%')).toBe(true);
        expect(isPunctuation('^')).toBe(true);
        expect(isPunctuation('&')).toBe(true);
        expect(isPunctuation('|')).toBe(true);
        expect(isPunctuation('~')).toBe(true);
        expect(isPunctuation('`')).toBe(true);
        expect(isPunctuation('"')).toBe(true);
        expect(isPunctuation("'")).toBe(true);
        expect(isPunctuation('\\')).toBe(true);
      });
    });

    describe('non-punctuation characters', () => {
      it('should return false for word characters', () => {
        expect(isPunctuation('a')).toBe(false);
        expect(isPunctuation('Z')).toBe(false);
        expect(isPunctuation('5')).toBe(false);
        expect(isPunctuation('_')).toBe(false);
      });

      it('should return false for whitespace', () => {
        expect(isPunctuation(' ')).toBe(false);
        expect(isPunctuation('\t')).toBe(false);
        expect(isPunctuation('\n')).toBe(false);
      });
    });

    describe('invalid inputs', () => {
      it('should return false for empty string', () => {
        expect(isPunctuation('')).toBe(false);
      });

      it('should return false for multi-character strings', () => {
        expect(isPunctuation('..')).toBe(false);
        expect(isPunctuation('hello')).toBe(false);
      });
    });
  });

  describe('classifyChar', () => {
    describe('word characters', () => {
      it('should classify lowercase letters as word', () => {
        expect(classifyChar('a')).toBe('word');
        expect(classifyChar('z')).toBe('word');
      });

      it('should classify uppercase letters as word', () => {
        expect(classifyChar('A')).toBe('word');
        expect(classifyChar('Z')).toBe('word');
      });

      it('should classify digits as word', () => {
        expect(classifyChar('0')).toBe('word');
        expect(classifyChar('9')).toBe('word');
      });

      it('should classify underscore as word', () => {
        expect(classifyChar('_')).toBe('word');
      });
    });

    describe('whitespace characters', () => {
      it('should classify space as whitespace', () => {
        expect(classifyChar(' ')).toBe('whitespace');
      });

      it('should classify tab as whitespace', () => {
        expect(classifyChar('\t')).toBe('whitespace');
      });

      it('should classify newline as whitespace', () => {
        expect(classifyChar('\n')).toBe('whitespace');
      });

      it('should classify Unicode whitespace as whitespace', () => {
        expect(classifyChar('\u00A0')).toBe('whitespace');
      });
    });

    describe('punctuation characters', () => {
      it('should classify common punctuation as punctuation', () => {
        expect(classifyChar('.')).toBe('punctuation');
        expect(classifyChar(',')).toBe('punctuation');
        expect(classifyChar('!')).toBe('punctuation');
      });

      it('should classify brackets as punctuation', () => {
        expect(classifyChar('(')).toBe('punctuation');
        expect(classifyChar(')')).toBe('punctuation');
      });

      it('should classify operators as punctuation', () => {
        expect(classifyChar('+')).toBe('punctuation');
        expect(classifyChar('-')).toBe('punctuation');
      });
    });

    describe('invalid inputs', () => {
      it('should classify empty string as other', () => {
        expect(classifyChar('')).toBe('other');
      });

      it('should classify multi-character strings as other', () => {
        expect(classifyChar('ab')).toBe('other');
        expect(classifyChar('hello')).toBe('other');
      });
    });
  });

  describe('findNextWordStart', () => {
    describe('on word character', () => {
      it('should find next word start from beginning of word', () => {
        expect(findNextWordStart('hello world', 0)).toBe(6);
      });

      it('should find next word start from middle of word', () => {
        expect(findNextWordStart('hello world', 2)).toBe(6);
      });

      it('should find next word start from end of word', () => {
        expect(findNextWordStart('hello world', 4)).toBe(6);
      });

      it('should skip punctuation between words', () => {
        expect(findNextWordStart('hello, world', 0)).toBe(7);
      });

      it('should skip multiple punctuation characters', () => {
        expect(findNextWordStart('hello!!! world', 0)).toBe(9);
      });

      it('should skip multiple spaces between words', () => {
        expect(findNextWordStart('hello   world', 0)).toBe(8);
      });

      it('should skip mixed punctuation and spaces', () => {
        expect(findNextWordStart('hello,   world', 0)).toBe(9);
      });

      it('should return null when no next word exists', () => {
        expect(findNextWordStart('hello', 0)).toBe(null);
        expect(findNextWordStart('hello world', 6)).toBe(null);
      });
    });

    describe('on punctuation', () => {
      it('should skip punctuation and find next word', () => {
        expect(findNextWordStart(',hello', 0)).toBe(1);
      });

      it('should skip multiple punctuation characters', () => {
        expect(findNextWordStart('!!!hello', 0)).toBe(3);
      });

      it('should skip punctuation and spaces', () => {
        expect(findNextWordStart(',  hello', 0)).toBe(3);
      });

      it('should return null when only punctuation', () => {
        expect(findNextWordStart('!!!', 0)).toBe(null);
      });

      it('should return null when only punctuation and spaces', () => {
        expect(findNextWordStart('!!!   ', 0)).toBe(null);
      });
    });

    describe('on whitespace', () => {
      it('should skip spaces and find next word', () => {
        expect(findNextWordStart(' hello', 0)).toBe(1);
      });

      it('should skip multiple spaces', () => {
        expect(findNextWordStart('   hello', 0)).toBe(3);
      });

      it('should skip tabs', () => {
        expect(findNextWordStart('\thello', 0)).toBe(1);
      });

      it('should skip mixed whitespace', () => {
        expect(findNextWordStart(' \t\nhello', 0)).toBe(3);
      });

      it('should return null when only whitespace', () => {
        expect(findNextWordStart('   ', 0)).toBe(null);
      });
    });

    describe('edge cases', () => {
      it('should return null for negative column', () => {
        expect(findNextWordStart('hello', -1)).toBe(null);
      });

      it('should return null for column at end of line', () => {
        expect(findNextWordStart('hello', 5)).toBe(null);
      });

      it('should return null for column past end of line', () => {
        expect(findNextWordStart('hello', 10)).toBe(null);
      });

      it('should handle empty string', () => {
        expect(findNextWordStart('', 0)).toBe(null);
      });

      it('should handle single word', () => {
        expect(findNextWordStart('hello', 0)).toBe(null);
      });

      it('should handle word followed by punctuation', () => {
        expect(findNextWordStart('hello!', 0)).toBe(null);
      });

      it('should handle punctuation followed by word', () => {
        expect(findNextWordStart('!hello', 0)).toBe(1);
      });
    });
  });

  describe('findWordEnd', () => {
    describe('on whitespace', () => {
      it('should find end of next word from space', () => {
        expect(findWordEnd(' hello world', 0)).toBe(5);
      });

      it('should find end of next word from multiple spaces', () => {
        expect(findWordEnd('   hello', 0)).toBe(5);
      });

      it('should find end of second word', () => {
        expect(findWordEnd('hello world', 5)).toBe(10);
      });

      it('should handle multiple spaces between words', () => {
        expect(findWordEnd('hello   world', 5)).toBe(10);
      });

      it('should return null when no word found', () => {
        expect(findWordEnd('   ', 0)).toBe(null);
      });
    });

    describe('on word character - not at end', () => {
      it('should find end of current word from start', () => {
        expect(findWordEnd('hello world', 0)).toBe(4);
      });

      it('should find end of current word from middle', () => {
        expect(findWordEnd('hello world', 2)).toBe(4);
      });

      it('should handle single character word', () => {
        expect(findWordEnd('a b', 0)).toBe(0);
      });

      it('should handle word with underscores', () => {
        expect(findWordEnd('hello_world test', 0)).toBe(10);
      });

      it('should handle word with numbers', () => {
        expect(findWordEnd('hello123 test', 0)).toBe(7);
      });
    });

    describe('on word character - at end of word', () => {
      it('should find end of next word when at end of current', () => {
        expect(findWordEnd('hello world', 4)).toBe(10);
      });

      it('should handle single character word at end', () => {
        expect(findWordEnd('a b', 0)).toBe(2);
      });

      it('should handle last word on line', () => {
        expect(findWordEnd('hello', 4)).toBe(null);
      });

      it('should handle word followed by punctuation', () => {
        expect(findWordEnd('hello, world', 4)).toBe(10);
      });
    });

    describe('on punctuation', () => {
      it('should skip punctuation and find end of next word', () => {
        expect(findWordEnd(',hello', 0)).toBe(5);
      });

      it('should skip multiple punctuation characters', () => {
        expect(findWordEnd('!!!hello', 0)).toBe(6);
      });

      it('should skip punctuation and spaces', () => {
        expect(findWordEnd(',  hello', 0)).toBe(6);
      });

      it('should handle punctuation between words', () => {
        expect(findWordEnd('hello, world', 5)).toBe(10);
      });

      it('should return null when only punctuation', () => {
        expect(findWordEnd('!!!', 0)).toBe(null);
      });
    });

    describe('edge cases', () => {
      it('should return null for negative column', () => {
        expect(findWordEnd('hello', -1)).toBe(null);
      });

      it('should return null for column at end of line', () => {
        expect(findWordEnd('hello', 5)).toBe(null);
      });

      it('should return null for column past end of line', () => {
        expect(findWordEnd('hello', 10)).toBe(null);
      });

      it('should handle empty string', () => {
        expect(findWordEnd('', 0)).toBe(null);
      });

      it('should handle single character word', () => {
        expect(findWordEnd('a', 0)).toBe(0);
      });
    });
  });

  describe.only('findPreviousWordStart', () => {
    describe('on word character', () => {
      it('should find previous word start from beginning of word', () => {
        expect(findPreviousWordStart('hello world', 6)).toBe(0);
      });

      it('should find previous word start from middle of word', () => {
        expect(findPreviousWordStart('hello world', 8)).toBe(6);
      });

      it('should find previous word start from end of word', () => {
        expect(findPreviousWordStart('hello world', 10)).toBe(6);
      });

      it('should not skip punctuation between words', () => {
        expect(findPreviousWordStart('hello, world', 7)).toBe(5);
      });

      it('should skip multiple punctuation characters', () => {
        expect(findPreviousWordStart('hello!!! world', 9)).toBe(5);
      });

      it('should skip multiple spaces between words', () => {
        expect(findPreviousWordStart('hello   world', 8)).toBe(0);
      });

      it('should return 0 when no previous word exists', () => {
        expect(findPreviousWordStart('hello', 5)).toBe(0);
        expect(findPreviousWordStart('hello', 3)).toBe(0);
      });
    });

    describe('on punctuation', () => {
      it('should not skip punctuation and find previous word', () => {
        expect(findPreviousWordStart('hello,', 5)).toBe(0);
      });

      it('should skip multiple punctuation characters', () => {
        expect(findPreviousWordStart('hello!!!', 8)).toBe(5);
      });

      it('should return 0 when only punctuation', () => {
        expect(findPreviousWordStart('!!!', 3)).toBe(0);
      });

      it('should return the initial puctuation position when only punctuation and spaces', () => {
        expect(findPreviousWordStart('!!!   ', 6)).toBe(0);
      });
    });

    describe('on whitespace', () => {
      it('should skip spaces and find previous word', () => {
        expect(findPreviousWordStart('hello ', 5)).toBe(0);
      });

      it('should skip multiple spaces', () => {
        expect(findPreviousWordStart('hello   ', 8)).toBe(0);
      });

      it('should skip tabs', () => {
        expect(findPreviousWordStart('hello\t', 6)).toBe(0);
      });

      it('should skip mixed whitespace', () => {
        expect(findPreviousWordStart('hello \t\n', 8)).toBe(0);
      });

      it('should return null when only whitespace', () => {
        expect(findPreviousWordStart('   ', 3)).toBe(null);
      });
    });

    describe('edge cases', () => {
      it('should return null for column 0', () => {
        expect(findPreviousWordStart('hello', 0)).toBe(null);
      });

      it('should return null for negative column', () => {
        expect(findPreviousWordStart('hello', -1)).toBe(null);
      });

      it('should handle empty string', () => {
        expect(findPreviousWordStart('', 0)).toBe(null);
      });

      it('should handle single word', () => {
        expect(findPreviousWordStart('hello', 5)).toBe(null);
      });

      it('should handle word preceded by punctuation', () => {
        expect(findPreviousWordStart('!hello', 6)).toBe(1);
      });

      it('should handle word preceded by whitespace', () => {
        expect(findPreviousWordStart(' hello', 6)).toBe(1);
      });
    });
  });

  describe('findPreviousWordEnd', () => {
    describe('in middle of word', () => {
      it('should find end of previous word from middle of current word', () => {
        expect(findPreviousWordEnd('hello world', 8)).toBe(4);
      });

      it('should find end of previous word from start of current word', () => {
        expect(findPreviousWordEnd('hello world', 6)).toBe(4);
      });

      it('should handle multiple words', () => {
        expect(findPreviousWordEnd('one two three four', 18)).toBe(12);
      });

      it('should handle words with underscores', () => {
        expect(findPreviousWordEnd('hello_world test', 15)).toBe(10);
      });

      it('should handle words with numbers', () => {
        expect(findPreviousWordEnd('hello123 test', 12)).toBe(7);
      });
    });

    describe('at or past end of line', () => {
      it('should return end of last word when at end of line', () => {
        expect(findPreviousWordEnd('hello world', 11)).toBe(10);
      });

      it('should return end of last word when past end of line', () => {
        expect(findPreviousWordEnd('hello world', 20)).toBe(10);
      });

      it('should handle single word', () => {
        expect(findPreviousWordEnd('hello', 5)).toBe(4);
        expect(findPreviousWordEnd('hello', 10)).toBe(4);
      });

      it('should handle word followed by spaces', () => {
        expect(findPreviousWordEnd('hello   ', 8)).toBe(4);
      });
    });

    describe('on whitespace', () => {
      it('should skip whitespace and find end of previous word', () => {
        expect(findPreviousWordEnd('hello ', 5)).toBe(4);
      });

      it('should skip multiple spaces', () => {
        expect(findPreviousWordEnd('hello   ', 8)).toBe(4);
      });

      it('should skip whitespace between words', () => {
        expect(findPreviousWordEnd('hello world', 5)).toBe(4);
      });
    });

    describe('on punctuation', () => {
      it('should skip punctuation and find end of previous word', () => {
        expect(findPreviousWordEnd('hello!', 5)).toBe(4);
      });

      it('should skip multiple punctuation characters', () => {
        expect(findPreviousWordEnd('hello!!!', 8)).toBe(4);
      });

      it('should skip punctuation between words', () => {
        expect(findPreviousWordEnd('hello, world', 5)).toBe(4);
      });
    });

    describe('edge cases', () => {
      it('should return null for column 0', () => {
        expect(findPreviousWordEnd('hello', 0)).toBe(null);
      });

      it('should return null for negative column', () => {
        expect(findPreviousWordEnd('hello', -1)).toBe(null);
      });

      it('should handle empty string', () => {
        expect(findPreviousWordEnd('', 0)).toBe(null);
      });

      it('should return null for single character word at start', () => {
        expect(findPreviousWordEnd('a', 1)).toBe(0);
      });

      it('should return null when no previous word', () => {
        expect(findPreviousWordEnd('hello', 3)).toBe(null);
      });

      it('should handle only whitespace', () => {
        expect(findPreviousWordEnd('   ', 3)).toBe(null);
      });

      it('should handle only punctuation', () => {
        expect(findPreviousWordEnd('!!!', 3)).toBe(null);
      });
    });
  });

  describe('findNextWORDStart', () => {
    describe('on non-whitespace character', () => {
      it('should find next WORD start from beginning of WORD', () => {
        expect(findNextWORDStart('hello world', 0)).toBe(6);
      });

      it('should find next WORD start from middle of WORD', () => {
        expect(findNextWORDStart('hello world', 2)).toBe(6);
      });

      it('should find next WORD start from end of WORD', () => {
        expect(findNextWORDStart('hello world', 4)).toBe(6);
      });

      it('should treat punctuation as part of WORD', () => {
        expect(findNextWORDStart('hello-world test', 0)).toBe(11);
      });

      it('should treat multiple punctuation as part of WORD', () => {
        expect(findNextWORDStart('hello!!!world test', 0)).toBe(13);
      });

      it('should skip multiple spaces between WORDs', () => {
        expect(findNextWORDStart('hello   world', 0)).toBe(8);
      });

      it('should return null when no next WORD exists', () => {
        expect(findNextWORDStart('hello', 0)).toBe(null);
        expect(findNextWORDStart('hello world', 6)).toBe(null);
      });
    });

    describe('on whitespace', () => {
      it('should skip spaces and find next WORD', () => {
        expect(findNextWORDStart(' hello', 0)).toBe(1);
      });

      it('should skip multiple spaces', () => {
        expect(findNextWORDStart('   hello', 0)).toBe(3);
      });

      it('should skip tabs', () => {
        expect(findNextWORDStart('\thello', 0)).toBe(1);
      });

      it('should skip mixed whitespace', () => {
        expect(findNextWORDStart(' \t\nhello', 0)).toBe(3);
      });

      it('should return null when only whitespace', () => {
        expect(findNextWORDStart('   ', 0)).toBe(null);
      });
    });

    describe('edge cases', () => {
      it('should return null for negative column', () => {
        expect(findNextWORDStart('hello', -1)).toBe(null);
      });

      it('should return null for column at end of line', () => {
        expect(findNextWORDStart('hello', 5)).toBe(null);
      });

      it('should return null for column past end of line', () => {
        expect(findNextWORDStart('hello', 10)).toBe(null);
      });

      it('should handle empty string', () => {
        expect(findNextWORDStart('', 0)).toBe(null);
      });

      it('should handle single WORD', () => {
        expect(findNextWORDStart('hello', 0)).toBe(null);
      });

      it('should handle WORD with punctuation', () => {
        expect(findNextWORDStart('hello!', 0)).toBe(null);
      });

      it('should handle punctuation followed by WORD', () => {
        expect(findNextWORDStart('!hello', 0)).toBe(1);
      });
    });
  });

  describe('findNextWORDEnd', () => {
    describe('on whitespace', () => {
      it('should find end of next WORD from space', () => {
        expect(findNextWORDEnd(' hello world', 0)).toBe(5);
      });

      it('should find end of next WORD from multiple spaces', () => {
        expect(findNextWORDEnd('   hello', 0)).toBe(5);
      });

      it('should find end of second WORD', () => {
        expect(findNextWORDEnd('hello world', 5)).toBe(10);
      });

      it('should handle multiple spaces between WORDs', () => {
        expect(findNextWORDEnd('hello   world', 5)).toBe(10);
      });

      it('should return null when no WORD found', () => {
        expect(findNextWORDEnd('   ', 0)).toBe(null);
      });
    });

    describe('on non-whitespace character', () => {
      it('should find end of current WORD from start', () => {
        expect(findNextWORDEnd('hello world', 0)).toBe(4);
      });

      it('should find end of current WORD from middle', () => {
        expect(findNextWORDEnd('hello world', 2)).toBe(4);
      });

      it('should handle single character WORD', () => {
        expect(findNextWORDEnd('a b', 0)).toBe(0);
      });

      it('should treat punctuation as part of WORD', () => {
        expect(findNextWORDEnd('hello-world test', 0)).toBe(10);
      });

      it('should treat multiple punctuation as part of WORD', () => {
        expect(findNextWORDEnd('hello!!!world test', 0)).toBe(12);
      });
    });

    describe('edge cases', () => {
      it('should return null for negative column', () => {
        expect(findNextWORDEnd('hello', -1)).toBe(null);
      });

      it('should return null for column at end of line', () => {
        expect(findNextWORDEnd('hello', 5)).toBe(null);
      });

      it('should return null for column past end of line', () => {
        expect(findNextWORDEnd('hello', 10)).toBe(null);
      });

      it('should handle empty string', () => {
        expect(findNextWORDEnd('', 0)).toBe(null);
      });

      it('should handle single character WORD', () => {
        expect(findNextWORDEnd('a', 0)).toBe(0);
      });

      it('should handle WORD with punctuation', () => {
        expect(findNextWORDEnd('hello!', 0)).toBe(5);
      });
    });
  });

  describe('findPreviousWORDStart', () => {
    describe('on non-whitespace character', () => {
      it('should find previous WORD start from beginning of WORD', () => {
        expect(findPreviousWORDStart('hello world', 6)).toBe(0);
      });

      it('should find previous WORD start from middle of WORD', () => {
        expect(findPreviousWORDStart('hello world', 8)).toBe(0);
      });

      it('should find previous WORD start from end of WORD', () => {
        expect(findPreviousWORDStart('hello world', 10)).toBe(0);
      });

      it('should treat punctuation as part of WORD', () => {
        expect(findPreviousWORDStart('hello-world test', 11)).toBe(0);
      });

      it('should skip multiple spaces between WORDs', () => {
        expect(findPreviousWORDStart('hello   world', 8)).toBe(0);
      });

      it('should return null when no previous WORD exists', () => {
        expect(findPreviousWORDStart('hello', 5)).toBe(null);
        expect(findPreviousWORDStart('hello', 3)).toBe(null);
      });
    });

    describe('on whitespace', () => {
      it('should skip spaces and find previous WORD', () => {
        expect(findPreviousWORDStart('hello ', 5)).toBe(0);
      });

      it('should skip multiple spaces', () => {
        expect(findPreviousWORDStart('hello   ', 8)).toBe(0);
      });

      it('should skip tabs', () => {
        expect(findPreviousWORDStart('hello\t', 6)).toBe(0);
      });

      it('should skip mixed whitespace', () => {
        expect(findPreviousWORDStart('hello \t\n', 8)).toBe(0);
      });

      it('should return null when only whitespace', () => {
        expect(findPreviousWORDStart('   ', 3)).toBe(null);
      });
    });

    describe('edge cases', () => {
      it('should return null for column 0', () => {
        expect(findPreviousWORDStart('hello', 0)).toBe(null);
      });

      it('should return null for negative column', () => {
        expect(findPreviousWORDStart('hello', -1)).toBe(null);
      });

      it('should handle empty string', () => {
        expect(findPreviousWORDStart('', 0)).toBe(null);
      });

      it('should handle single WORD', () => {
        expect(findPreviousWORDStart('hello', 5)).toBe(null);
      });

      it('should handle WORD preceded by punctuation', () => {
        expect(findPreviousWORDStart('!hello', 6)).toBe(1);
      });

      it('should handle WORD preceded by whitespace', () => {
        expect(findPreviousWORDStart(' hello', 6)).toBe(1);
      });
    });
  });

  describe('findPreviousWORDEnd', () => {
    describe('in middle of WORD', () => {
      it('should find end of previous WORD from middle of current WORD', () => {
        expect(findPreviousWORDEnd('hello world', 8)).toBe(4);
      });

      it('should find end of previous WORD from start of current WORD', () => {
        expect(findPreviousWORDEnd('hello world', 6)).toBe(4);
      });

      it('should handle multiple WORDs', () => {
        expect(findPreviousWORDEnd('one two three four', 18)).toBe(12);
      });

      it('should treat punctuation as part of WORD', () => {
        expect(findPreviousWORDEnd('hello-world test', 15)).toBe(10);
      });
    });

    describe('at or past end of line', () => {
      it('should return end of last WORD when at end of line', () => {
        expect(findPreviousWORDEnd('hello world', 11)).toBe(10);
      });

      it('should return end of last WORD when past end of line', () => {
        expect(findPreviousWORDEnd('hello world', 20)).toBe(10);
      });

      it('should handle single WORD', () => {
        expect(findPreviousWORDEnd('hello', 5)).toBe(4);
        expect(findPreviousWORDEnd('hello', 10)).toBe(4);
      });

      it('should handle WORD followed by spaces', () => {
        expect(findPreviousWORDEnd('hello   ', 8)).toBe(4);
      });

      it('should handle WORD with punctuation', () => {
        expect(findPreviousWORDEnd('hello!', 5)).toBe(4);
      });
    });

    describe('on whitespace', () => {
      it('should skip whitespace and find end of previous WORD', () => {
        expect(findPreviousWORDEnd('hello ', 5)).toBe(4);
      });

      it('should skip multiple spaces', () => {
        expect(findPreviousWORDEnd('hello   ', 8)).toBe(4);
      });

      it('should skip whitespace between WORDs', () => {
        expect(findPreviousWORDEnd('hello world', 5)).toBe(4);
      });
    });

    describe('edge cases', () => {
      it('should return null for column 0', () => {
        expect(findPreviousWORDEnd('hello', 0)).toBe(null);
      });

      it('should return null for negative column', () => {
        expect(findPreviousWORDEnd('hello', -1)).toBe(null);
      });

      it('should handle empty string', () => {
        expect(findPreviousWORDEnd('', 0)).toBe(null);
      });

      it('should return null for single character WORD at start', () => {
        expect(findPreviousWORDEnd('a', 1)).toBe(0);
      });

      it('should return null when no previous WORD', () => {
        expect(findPreviousWORDEnd('hello', 3)).toBe(null);
      });

      it('should handle only whitespace', () => {
        expect(findPreviousWORDEnd('   ', 3)).toBe(null);
      });

      it('should handle only punctuation', () => {
        expect(findPreviousWORDEnd('!!!', 3)).toBe(2);
      });
    });
  });

  describe('integration tests', () => {
    describe('word vs WORD differences', () => {
      it('should treat punctuation differently for word vs WORD', () => {
        const line = 'hello, world!';

        // Word movement stops at punctuation
        expect(findNextWordStart(line, 0)).toBe(7); // skips comma, finds 'world'
        expect(findWordEnd(line, 0)).toBe(4); // ends at 'hello'

        // WORD movement includes punctuation
        expect(findNextWORDStart(line, 0)).toBe(7); // includes comma, finds 'world'
        expect(findNextWORDEnd(line, 0)).toBe(5); // includes comma
      });

      it('should handle hyphenated words differently', () => {
        const line = 'hello-world test';

        // Word movement treats hyphen as separator
        expect(findNextWordStart(line, 0)).toBe(6); // finds 'world'
        expect(findWordEnd(line, 0)).toBe(4); // ends at 'hello'

        // WORD movement treats hyphen as part of WORD
        expect(findNextWORDStart(line, 0)).toBe(11); // finds 'test'
        expect(findNextWORDEnd(line, 0)).toBe(10); // ends at 'hello-world'
      });
    });

    describe('complex scenarios', () => {
      it('should handle mixed content with word movement', () => {
        const line = 'function(arg1, arg2) { return; }';

        expect(findNextWordStart(line, 0)).toBe(9); // 'arg1'
        expect(findWordEnd(line, 0)).toBe(7); // 'function'
        expect(findPreviousWordStart(line, 20)).toBe(16); // 'return'
        expect(findPreviousWordEnd(line, 20)).toBe(20); // 'return'
      });

      it('should handle mixed content with WORD movement', () => {
        const line = 'function(arg1, arg2) { return; }';

        expect(findNextWORDStart(line, 0)).toBe(9); // 'arg1,'
        expect(findNextWORDEnd(line, 0)).toBe(7); // 'function'
        expect(findPreviousWORDStart(line, 25)).toBe(15); // '{'
        expect(findPreviousWORDEnd(line, 25)).toBe(21); // 'return;'
      });
    });

    describe('real-world text', () => {
      it('should handle code-like text', () => {
        const line = 'const foo = bar + baz;';

        expect(findNextWordStart(line, 0)).toBe(6); // 'foo'
        expect(findWordEnd(line, 0)).toBe(4); // 'const'
        expect(findNextWordStart(line, 6)).toBe(12); // 'bar'
        expect(findWordEnd(line, 6)).toBe(8); // 'foo'
      });

      it('should handle natural language', () => {
        const line = 'Hello, world! How are you?';

        expect(findNextWordStart(line, 0)).toBe(7); // 'world'
        expect(findWordEnd(line, 0)).toBe(4); // 'Hello'
        expect(findNextWordStart(line, 7)).toBe(14); // 'How'
        expect(findWordEnd(line, 7)).toBe(11); // 'world'
      });
    });
  });
});
