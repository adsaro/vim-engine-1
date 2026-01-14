/**
 * Bracket Type Utilities Tests
 */
import {
  isOpenBracket,
  isCloseBracket,
  getMatchingBracket,
  getBracketPair,
  isBracket,
  BRACKET_PAIRS,
  type BracketPair,
} from './bracketTypes';

describe('bracketTypes', () => {
  describe('BRACKET_PAIRS', () => {
    it('should define all expected bracket pairs', () => {
      expect(BRACKET_PAIRS).toHaveLength(4);

      const pairs = BRACKET_PAIRS.map((p) => `${p.open}${p.close}`).sort();
      expect(pairs).toEqual(['()', '<>', '[]', '{}'].sort());
    });

    it('should have unique opening brackets', () => {
      const openBrackets = BRACKET_PAIRS.map((p) => p.open);
      const uniqueOpenBrackets = new Set(openBrackets);
      expect(uniqueOpenBrackets.size).toBe(openBrackets.length);
    });

    it('should have unique closing brackets', () => {
      const closeBrackets = BRACKET_PAIRS.map((p) => p.close);
      const uniqueCloseBrackets = new Set(closeBrackets);
      expect(uniqueCloseBrackets.size).toBe(closeBrackets.length);
    });
  });

  describe('isOpenBracket', () => {
    describe('valid opening brackets', () => {
      it('should return true for opening parenthesis', () => {
        expect(isOpenBracket('(')).toBe(true);
      });

      it('should return true for opening square bracket', () => {
        expect(isOpenBracket('[')).toBe(true);
      });

      it('should return true for opening curly brace', () => {
        expect(isOpenBracket('{')).toBe(true);
      });

      it('should return true for opening angle bracket', () => {
        expect(isOpenBracket('<')).toBe(true);
      });
    });

    describe('non-opening brackets', () => {
      it('should return false for closing brackets', () => {
        expect(isOpenBracket(')')).toBe(false);
        expect(isOpenBracket(']')).toBe(false);
        expect(isOpenBracket('}')).toBe(false);
        expect(isOpenBracket('>')).toBe(false);
      });

      it('should return false for non-bracket characters', () => {
        expect(isOpenBracket('a')).toBe(false);
        expect(isOpenBracket(' ')).toBe(false);
        expect(isOpenBracket('.')).toBe(false);
        expect(isOpenBracket('/')).toBe(false);
        expect(isOpenBracket('-')).toBe(false);
      });

      it('should return false for special characters', () => {
        expect(isOpenBracket('@')).toBe(false);
        expect(isOpenBracket('#')).toBe(false);
        expect(isOpenBracket('$')).toBe(false);
        expect(isOpenBracket('%')).toBe(false);
      });
    });

    describe('invalid inputs', () => {
      it('should return false for empty string', () => {
        expect(isOpenBracket('')).toBe(false);
      });

      it('should return false for multi-character strings', () => {
        expect(isOpenBracket('((')).toBe(false);
        expect(isOpenBracket('()')).toBe(false);
        expect(isOpenBracket('hello')).toBe(false);
      });
    });
  });

  describe('isCloseBracket', () => {
    describe('valid closing brackets', () => {
      it('should return true for closing parenthesis', () => {
        expect(isCloseBracket(')')).toBe(true);
      });

      it('should return true for closing square bracket', () => {
        expect(isCloseBracket(']')).toBe(true);
      });

      it('should return true for closing curly brace', () => {
        expect(isCloseBracket('}')).toBe(true);
      });

      it('should return true for closing angle bracket', () => {
        expect(isCloseBracket('>')).toBe(true);
      });
    });

    describe('non-closing brackets', () => {
      it('should return false for opening brackets', () => {
        expect(isCloseBracket('(')).toBe(false);
        expect(isCloseBracket('[')).toBe(false);
        expect(isCloseBracket('{')).toBe(false);
        expect(isCloseBracket('<')).toBe(false);
      });

      it('should return false for non-bracket characters', () => {
        expect(isCloseBracket('a')).toBe(false);
        expect(isCloseBracket(' ')).toBe(false);
        expect(isCloseBracket('.')).toBe(false);
        expect(isCloseBracket('/')).toBe(false);
      });

      it('should return false for special characters', () => {
        expect(isCloseBracket('@')).toBe(false);
        expect(isCloseBracket('#')).toBe(false);
        expect(isCloseBracket('$')).toBe(false);
        expect(isCloseBracket('%')).toBe(false);
      });
    });

    describe('invalid inputs', () => {
      it('should return false for empty string', () => {
        expect(isCloseBracket('')).toBe(false);
      });

      it('should return false for multi-character strings', () => {
        expect(isCloseBracket('))')).toBe(false);
        expect(isCloseBracket('()')).toBe(false);
        expect(isCloseBracket('hello')).toBe(false);
      });
    });
  });

  describe('getMatchingBracket', () => {
    describe('opening brackets', () => {
      it('should return closing bracket for opening parenthesis', () => {
        expect(getMatchingBracket('(')).toBe(')');
      });

      it('should return closing bracket for opening square bracket', () => {
        expect(getMatchingBracket('[')).toBe(']');
      });

      it('should return closing bracket for opening curly brace', () => {
        expect(getMatchingBracket('{')).toBe('}');
      });

      it('should return closing bracket for opening angle bracket', () => {
        expect(getMatchingBracket('<')).toBe('>');
      });
    });

    describe('closing brackets', () => {
      it('should return opening bracket for closing parenthesis', () => {
        expect(getMatchingBracket(')')).toBe('(');
      });

      it('should return opening bracket for closing square bracket', () => {
        expect(getMatchingBracket(']')).toBe('[');
      });

      it('should return opening bracket for closing curly brace', () => {
        expect(getMatchingBracket('}')).toBe('{');
      });

      it('should return opening bracket for closing angle bracket', () => {
        expect(getMatchingBracket('>')).toBe('<');
      });
    });

    describe('non-bracket characters', () => {
      it('should return null for letters', () => {
        expect(getMatchingBracket('a')).toBe(null);
        expect(getMatchingBracket('z')).toBe(null);
        expect(getMatchingBracket('A')).toBe(null);
        expect(getMatchingBracket('Z')).toBe(null);
      });

      it('should return null for numbers', () => {
        expect(getMatchingBracket('0')).toBe(null);
        expect(getMatchingBracket('9')).toBe(null);
      });

      it('should return null for whitespace', () => {
        expect(getMatchingBracket(' ')).toBe(null);
        expect(getMatchingBracket('\t')).toBe(null);
        expect(getMatchingBracket('\n')).toBe(null);
      });

      it('should return null for punctuation', () => {
        expect(getMatchingBracket('.')).toBe(null);
        expect(getMatchingBracket(',')).toBe(null);
        expect(getMatchingBracket('!')).toBe(null);
        expect(getMatchingBracket('/')).toBe(null);
        expect(getMatchingBracket('-')).toBe(null);
      });
    });

    describe('invalid inputs', () => {
      it('should return null for empty string', () => {
        expect(getMatchingBracket('')).toBe(null);
      });

      it('should return null for multi-character strings', () => {
        expect(getMatchingBracket('()')).toBe(null);
        expect(getMatchingBracket('(abc)')).toBe(null);
        expect(getMatchingBracket('hello')).toBe(null);
      });
    });
  });

  describe('getBracketPair', () => {
    describe('opening brackets', () => {
      it('should return correct pair for opening parenthesis', () => {
        const result = getBracketPair('(');
        expect(result).not.toBe(null);
        if (result) {
          expect(result.open).toBe('(');
          expect(result.close).toBe(')');
        }
      });

      it('should return correct pair for opening square bracket', () => {
        const result = getBracketPair('[');
        expect(result).not.toBe(null);
        if (result) {
          expect(result.open).toBe('[');
          expect(result.close).toBe(']');
        }
      });

      it('should return correct pair for opening curly brace', () => {
        const result = getBracketPair('{');
        expect(result).not.toBe(null);
        if (result) {
          expect(result.open).toBe('{');
          expect(result.close).toBe('}');
        }
      });

      it('should return correct pair for opening angle bracket', () => {
        const result = getBracketPair('<');
        expect(result).not.toBe(null);
        if (result) {
          expect(result.open).toBe('<');
          expect(result.close).toBe('>');
        }
      });
    });

    describe('closing brackets', () => {
      it('should return correct pair for closing parenthesis', () => {
        const result = getBracketPair(')');
        expect(result).not.toBe(null);
        if (result) {
          expect(result.open).toBe('(');
          expect(result.close).toBe(')');
        }
      });

      it('should return correct pair for closing square bracket', () => {
        const result = getBracketPair(']');
        expect(result).not.toBe(null);
        if (result) {
          expect(result.open).toBe('[');
          expect(result.close).toBe(']');
        }
      });

      it('should return correct pair for closing curly brace', () => {
        const result = getBracketPair('}');
        expect(result).not.toBe(null);
        if (result) {
          expect(result.open).toBe('{');
          expect(result.close).toBe('}');
        }
      });

      it('should return correct pair for closing angle bracket', () => {
        const result = getBracketPair('>');
        expect(result).not.toBe(null);
        if (result) {
          expect(result.open).toBe('<');
          expect(result.close).toBe('>');
        }
      });
    });

    describe('non-bracket characters', () => {
      it('should return null for letters', () => {
        expect(getBracketPair('a')).toBe(null);
        expect(getBracketPair('z')).toBe(null);
      });

      it('should return null for numbers', () => {
        expect(getBracketPair('0')).toBe(null);
        expect(getBracketPair('9')).toBe(null);
      });

      it('should return null for punctuation', () => {
        expect(getBracketPair('.')).toBe(null);
        expect(getBracketPair(',')).toBe(null);
        expect(getBracketPair('/')).toBe(null);
      });

      it('should return null for whitespace', () => {
        expect(getBracketPair(' ')).toBe(null);
        expect(getBracketPair('\t')).toBe(null);
      });
    });

    describe('invalid inputs', () => {
      it('should return null for empty string', () => {
        expect(getBracketPair('')).toBe(null);
      });

      it('should return null for multi-character strings', () => {
        expect(getBracketPair('()')).toBe(null);
        expect(getBracketPair('(abc)')).toBe(null);
        expect(getBracketPair('hello')).toBe(null);
      });
    });
  });

  describe('isBracket', () => {
    describe('opening brackets', () => {
      it('should return true for opening parenthesis', () => {
        expect(isBracket('(')).toBe(true);
      });

      it('should return true for opening square bracket', () => {
        expect(isBracket('[')).toBe(true);
      });

      it('should return true for opening curly brace', () => {
        expect(isBracket('{')).toBe(true);
      });

      it('should return true for opening angle bracket', () => {
        expect(isBracket('<')).toBe(true);
      });
    });

    describe('closing brackets', () => {
      it('should return true for closing parenthesis', () => {
        expect(isBracket(')')).toBe(true);
      });

      it('should return true for closing square bracket', () => {
        expect(isBracket(']')).toBe(true);
      });

      it('should return true for closing curly brace', () => {
        expect(isBracket('}')).toBe(true);
      });

      it('should return true for closing angle bracket', () => {
        expect(isBracket('>')).toBe(true);
      });
    });

    describe('non-bracket characters', () => {
      it('should return false for letters', () => {
        expect(isBracket('a')).toBe(false);
        expect(isBracket('z')).toBe(false);
      });

      it('should return false for numbers', () => {
        expect(isBracket('0')).toBe(false);
        expect(isBracket('9')).toBe(false);
      });

      it('should return false for whitespace', () => {
        expect(isBracket(' ')).toBe(false);
        expect(isBracket('\t')).toBe(false);
      });

      it('should return false for punctuation', () => {
        expect(isBracket('.')).toBe(false);
        expect(isBracket(',')).toBe(false);
        expect(isBracket('/')).toBe(false);
        expect(isBracket('-')).toBe(false);
      });
    });
  });

  describe('bracket pair consistency', () => {
    it('should have consistent matching between functions', () => {
      const brackets: string[] = ['(', ')', '[', ']', '{', '}', '<', '>'];

      for (const bracket of brackets) {
        const pair = getBracketPair(bracket);
        const matching = getMatchingBracket(bracket);

        expect(pair).not.toBe(null);
        expect(matching).not.toBe(null);

        if (pair && matching) {
          // If bracket is opening, matching should be closing and vice versa
          if (isOpenBracket(bracket)) {
            expect(isCloseBracket(matching)).toBe(true);
            expect(pair.close).toBe(matching);
          } else {
            expect(isOpenBracket(matching)).toBe(true);
            expect(pair.open).toBe(matching);
          }
        }
      }
    });
  });
});
