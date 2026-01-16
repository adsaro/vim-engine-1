/**
 * Bracket Matcher Tests
 */
import { TextBuffer } from '../../../state/TextBuffer';
import { CursorPosition } from '../../../state/CursorPosition';
import { findMatchingBracket, findMatchingBracketLegacy, type MatchResult } from './bracketMatcher';

describe('bracketMatcher', () => {
  describe('findMatchingBracket', () => {
    describe('function existence', () => {
      it('should be a function', () => {
        expect(typeof findMatchingBracket).toBe('function');
      });
    });

    describe('return structure', () => {
      it('should return an object with line, column, and found properties', () => {
        const buffer = new TextBuffer('(test)');
        const cursor = new CursorPosition(0, 0);
        const result = findMatchingBracket(buffer, cursor);

        expect(result).toHaveProperty('line');
        expect(result).toHaveProperty('column');
        expect(result).toHaveProperty('found');
        expect(typeof result.line).toBe('number');
        expect(typeof result.column).toBe('number');
        expect(typeof result.found).toBe('boolean');
      });

      it('should return a MatchResult type', () => {
        const buffer = new TextBuffer('(test)');
        const cursor = new CursorPosition(0, 0);
        const result = findMatchingBracket(buffer, cursor);

        // Verify structure matches MatchResult interface
        expect(result).toEqual(
          expect.objectContaining({
            line: expect.any(Number),
            column: expect.any(Number),
            found: expect.any(Boolean),
          })
        );
      });
    });

    describe('empty buffer scenarios', () => {
      it('should return not found for empty buffer', () => {
        const buffer = new TextBuffer();
        const cursor = new CursorPosition(0, 0);
        const result = findMatchingBracket(buffer, cursor);
        expect(result.found).toBe(false);
      });

      it('should return not found for empty lines array', () => {
        const buffer = new TextBuffer([]);
        const cursor = new CursorPosition(0, 0);
        const result = findMatchingBracket(buffer, cursor);
        expect(result.found).toBe(false);
      });
    });

    describe('invalid position scenarios', () => {
      it('should return not found for line beyond document', () => {
        const buffer = new TextBuffer('(test)');
        const cursor = new CursorPosition(10, 0);
        const result = findMatchingBracket(buffer, cursor);
        expect(result.found).toBe(false);
      });

      it('should return not found for column beyond line length', () => {
        const buffer = new TextBuffer('(test)');
        const cursor = new CursorPosition(0, 100);
        const result = findMatchingBracket(buffer, cursor);
        expect(result.found).toBe(false);
      });

      // Note: CursorPosition clamps negative values to 0, so we can't test negative values directly
    });

    // ============================================
    // BASIC MOVEMENT TESTS
    // ============================================

    describe('basic bracket matching - parentheses', () => {
      it('should find matching closing bracket from opening parenthesis', () => {
        const buffer = new TextBuffer('(hello world)');
        const cursor = new CursorPosition(0, 0);
        const result = findMatchingBracket(buffer, cursor);
        expect(result.line).toBe(0);
        expect(result.column).toBe(12);
        expect(result.found).toBe(true);
      });

      it('should find matching opening bracket from closing parenthesis', () => {
        const buffer = new TextBuffer('(hello world)');
        const cursor = new CursorPosition(0, 12);
        const result = findMatchingBracket(buffer, cursor);
        expect(result.line).toBe(0);
        expect(result.column).toBe(0);
        expect(result.found).toBe(true);
      });

      it('should work at any position on the bracket character', () => {
        const buffer = new TextBuffer('(test)');
        const cursor = new CursorPosition(0, 0);
        const result = findMatchingBracket(buffer, cursor);
        expect(result.found).toBe(true);
      });
    });

    describe('basic bracket matching - square brackets', () => {
      it('should find matching closing bracket from opening square bracket', () => {
        const buffer = new TextBuffer('[array, item]');
        const cursor = new CursorPosition(0, 0);
        const result = findMatchingBracket(buffer, cursor);
        expect(result.line).toBe(0);
        expect(result.column).toBe(12);
        expect(result.found).toBe(true);
      });

      it('should find matching opening bracket from closing square bracket', () => {
        const buffer = new TextBuffer('[array, item]');
        const cursor = new CursorPosition(0, 12);
        const result = findMatchingBracket(buffer, cursor);
        expect(result.line).toBe(0);
        expect(result.column).toBe(0);
        expect(result.found).toBe(true);
      });
    });

    describe('basic bracket matching - curly braces', () => {
      it('should find matching closing bracket from opening curly brace', () => {
        const buffer = new TextBuffer('{object: value}');
        const cursor = new CursorPosition(0, 0);
        const result = findMatchingBracket(buffer, cursor);
        expect(result.line).toBe(0);
        expect(result.column).toBe(14);
        expect(result.found).toBe(true);
      });

      it('should find matching opening bracket from closing curly brace', () => {
        const buffer = new TextBuffer('{object: value}');
        const cursor = new CursorPosition(0, 14);
        const result = findMatchingBracket(buffer, cursor);
        expect(result.line).toBe(0);
        expect(result.column).toBe(0);
        expect(result.found).toBe(true);
      });
    });

    describe('basic bracket matching - angle brackets', () => {
      it('should find matching closing bracket from opening angle bracket', () => {
        const buffer = new TextBuffer('<component>');
        const cursor = new CursorPosition(0, 0);
        const result = findMatchingBracket(buffer, cursor);
        expect(result.line).toBe(0);
        expect(result.column).toBe(10);
        expect(result.found).toBe(true);
      });

      it('should find matching opening bracket from closing angle bracket', () => {
        const buffer = new TextBuffer('<component>');
        const cursor = new CursorPosition(0, 10);
        const result = findMatchingBracket(buffer, cursor);
        expect(result.line).toBe(0);
        expect(result.column).toBe(0);
        expect(result.found).toBe(true);
      });
    });

    // ============================================
    // NESTED BRACKET TESTS
    // ============================================

    describe('nested brackets - single level', () => {
      it('should match nested parentheses correctly', () => {
        const buffer = new TextBuffer('(())');
        const cursor = new CursorPosition(0, 0);
        const result = findMatchingBracket(buffer, cursor);
        expect(result.line).toBe(0);
        expect(result.column).toBe(3);
        expect(result.found).toBe(true);
      });

      it('should match inner parentheses correctly', () => {
        const buffer = new TextBuffer('(())');
        const cursor = new CursorPosition(0, 1);
        const result = findMatchingBracket(buffer, cursor);
        expect(result.line).toBe(0);
        expect(result.column).toBe(2);
        expect(result.found).toBe(true);
      });
    });

    describe('nested brackets - multiple levels', () => {
      it('should match deeply nested parentheses', () => {
        const buffer = new TextBuffer('(((())))');
        const cursor = new CursorPosition(0, 0);
        const result = findMatchingBracket(buffer, cursor);
        expect(result.line).toBe(0);
        expect(result.column).toBe(7);
        expect(result.found).toBe(true);
      });

      it('should match second level parentheses', () => {
        const buffer = new TextBuffer('(((())))');
        const cursor = new CursorPosition(0, 1);
        const result = findMatchingBracket(buffer, cursor);
        expect(result.line).toBe(0);
        expect(result.column).toBe(6);
        expect(result.found).toBe(true);
      });

      it('should match third level parentheses', () => {
        const buffer = new TextBuffer('(((())))');
        const cursor = new CursorPosition(0, 2);
        const result = findMatchingBracket(buffer, cursor);
        expect(result.line).toBe(0);
        expect(result.column).toBe(5);
        expect(result.found).toBe(true);
      });
    });

    describe('nested brackets - mixed bracket types', () => {
      it('should match mixed brackets correctly', () => {
        const buffer = new TextBuffer('({[]})');
        const cursor = new CursorPosition(0, 0);
        const result = findMatchingBracket(buffer, cursor);
        expect(result.line).toBe(0);
        expect(result.column).toBe(5);
        expect(result.found).toBe(true);
      });

      it('should match inner square brackets in mixed context', () => {
        const buffer = new TextBuffer('({[]})');
        const cursor = new CursorPosition(0, 2);
        const result = findMatchingBracket(buffer, cursor);
        expect(result.line).toBe(0);
        expect(result.column).toBe(3);
        expect(result.found).toBe(true);
      });

      it('should match complex nested structure', () => {
        const buffer = new TextBuffer('({[({})]})');
        const cursor = new CursorPosition(0, 0);
        const result = findMatchingBracket(buffer, cursor);
        expect(result.line).toBe(0);
        expect(result.column).toBe(9);
        expect(result.found).toBe(true);
      });
    });

    describe('nested brackets - deep nesting', () => {
      it('should handle 10 levels of nesting', () => {
        const deepNested = '('.repeat(10) + ')'.repeat(10);
        const buffer = new TextBuffer(deepNested);
        const cursor = new CursorPosition(0, 0);
        const result = findMatchingBracket(buffer, cursor);
        expect(result.line).toBe(0);
        expect(result.column).toBe(19);
        expect(result.found).toBe(true);
      });

      it('should handle matching at middle depth', () => {
        const deepNested = '('.repeat(10) + ')'.repeat(10);
        const buffer = new TextBuffer(deepNested);
        const cursor = new CursorPosition(0, 5);
        const result = findMatchingBracket(buffer, cursor);
        expect(result.line).toBe(0);
        expect(result.column).toBe(14);
        expect(result.found).toBe(true);
      });
    });

    // ============================================
    // MULTI-LINE TESTS
    // ============================================

    describe('multi-line bracket matching', () => {
      it('should match brackets spanning multiple lines', () => {
        const buffer = new TextBuffer('(\n  content\n)');
        const cursor = new CursorPosition(0, 0);
        const result = findMatchingBracket(buffer, cursor);
        expect(result.line).toBe(2);
        expect(result.column).toBe(0);
        expect(result.found).toBe(true);
      });

      it('should match closing bracket on different line', () => {
        const buffer = new TextBuffer('(\n  content\n)');
        const cursor = new CursorPosition(2, 0);
        const result = findMatchingBracket(buffer, cursor);
        expect(result.line).toBe(0);
        expect(result.column).toBe(0);
        expect(result.found).toBe(true);
      });

      it('should handle nested brackets across lines', () => {
        const buffer = new TextBuffer([
          'function test() {',
          '  if (condition) {',
          '    return (value);',
          '  }',
          '}',
        ]);
        const cursor = new CursorPosition(0, 16);
        const result = findMatchingBracket(buffer, cursor);
        expect(result.line).toBe(4);
        expect(result.column).toBe(0);
        expect(result.found).toBe(true);
      });

      it('should match inner brackets across lines', () => {
        const buffer = new TextBuffer([
          'function test() {',
          '  if (condition) {',
          '    return (value);',
          '  }',
          '}',
        ]);
        // Line 2: '    return (value);' - ( is at column 10, ) is at column 17
        const cursor = new CursorPosition(2, 10);
        const result = findMatchingBracket(buffer, cursor);
        expect(result.line).toBe(2);
        expect(result.column).toBe(17);
        expect(result.found).toBe(true);
      });

      it('should work with cursor on content between bracket lines', () => {
        const buffer = new TextBuffer([
          'line 1 (',
          '  content',
          ') line 3',
        ]);
        const cursor = new CursorPosition(1, 2);
        const result = findMatchingBracket(buffer, cursor);
        // When cursor is not on a bracket, search forward finds next bracket
        // The first bracket after line 1 col 2 is the closing bracket on line 2 at column 0
        // Since it's a closing bracket, we search backward for the matching opening bracket
        // The opening bracket is on line 0 at column 7
        expect(result.found).toBe(true);
        expect(result.line).toBe(0);
        expect(result.column).toBe(7);
      });
    });

    // ============================================
    // EDGE CASE TESTS
    // ============================================

    describe('cursor not on bracket', () => {
      it('should search forward and find next bracket pair', () => {
        const buffer = new TextBuffer('no bracket here (test) after');
        const cursor = new CursorPosition(0, 5);
        // 'no bracket here (test) after'
        // position 5 is at 'b', first '(' is at position 16, ')' is at position 21
        const result = findMatchingBracket(buffer, cursor);
        expect(result.line).toBe(0);
        expect(result.column).toBe(21);
        expect(result.found).toBe(true);
      });

      it('should stay at cursor if no bracket found', () => {
        const buffer = new TextBuffer('no brackets here');
        const cursor = new CursorPosition(0, 5);
        const result = findMatchingBracket(buffer, cursor);
        expect(result.line).toBe(0);
        expect(result.column).toBe(5);
        expect(result.found).toBe(false);
      });

      it('should handle empty line content', () => {
        const buffer = new TextBuffer('text  ');
        const cursor = new CursorPosition(0, 5);
        const result = findMatchingBracket(buffer, cursor);
        expect(result.found).toBe(false);
      });
    });

    describe('unmatched brackets', () => {
      it('should handle unmatched opening bracket', () => {
        const buffer = new TextBuffer('(unclosed');
        const cursor = new CursorPosition(0, 0);
        const result = findMatchingBracket(buffer, cursor);
        expect(result.found).toBe(false);
      });

      it('should handle unmatched closing bracket', () => {
        const buffer = new TextBuffer('extra)');
        const cursor = new CursorPosition(0, 5);
        const result = findMatchingBracket(buffer, cursor);
        expect(result.found).toBe(false);
      });

      it('should handle single bracket with no match', () => {
        const buffer = new TextBuffer('(');
        const cursor = new CursorPosition(0, 0);
        const result = findMatchingBracket(buffer, cursor);
        expect(result.found).toBe(false);
      });
    });

    describe('single line with no brackets', () => {
      it('should return not found for content without brackets', () => {
        const buffer = new TextBuffer('just plain text');
        const cursor = new CursorPosition(0, 5);
        const result = findMatchingBracket(buffer, cursor);
        expect(result.found).toBe(false);
      });

      it('should return not found for empty line', () => {
        const buffer = new TextBuffer(['', 'text']);
        const cursor = new CursorPosition(0, 0);
        const result = findMatchingBracket(buffer, cursor);
        expect(result.found).toBe(false);
      });
    });

    describe('cursor at line end', () => {
      it('should handle cursor at end of line', () => {
        const buffer = new TextBuffer('(test)');
        const cursor = new CursorPosition(0, 6);
        const result = findMatchingBracket(buffer, cursor);
        // Column 6 is after the closing bracket, not on a bracket
        expect(result.found).toBe(false);
      });

      it('should find next bracket when cursor is after all brackets', () => {
        const buffer = new TextBuffer('first (match) second (also)');
        // 'first (match) second (also)'
        // position 20 is after 'first (match) ', second '(' is at 21, ')' is at 26
        const cursor = new CursorPosition(0, 20);
        const result = findMatchingBracket(buffer, cursor);
        expect(result.line).toBe(0);
        expect(result.column).toBe(26);
        expect(result.found).toBe(true);
      });
    });

    // ============================================
    // PERFORMANCE BENCHMARK TESTS
    // ============================================

    describe('performance benchmarks', () => {
      /**
       * Performance target: Single bracket match should complete in < 0.5ms
       */
      it('should complete single bracket match in < 0.5ms', () => {
        const buffer = new TextBuffer('(function call with args)');
        const cursor = new CursorPosition(0, 0);
        
        const iterations = 1000;
        const start = performance.now();
        
        for (let i = 0; i < iterations; i++) {
          findMatchingBracket(buffer, cursor);
        }
        
        const elapsed = performance.now() - start;
        const averageMs = elapsed / iterations;
        
        // Log for debugging
        console.log(`Single bracket match: ${averageMs.toFixed(4)}ms average (${iterations} iterations)`);
        
        expect(averageMs).toBeLessThan(0.5);
      });

      /**
       * Performance target: Multi-line match should complete in < 2ms
       */
      it('should complete multi-line match in < 2ms', () => {
        const buffer = new TextBuffer([
          'function test() {',
          '  if (condition) {',
          '    return (value);',
          '  }',
          '}',
        ]);
        const cursor = new CursorPosition(0, 16);
        
        const iterations = 1000;
        const start = performance.now();
        
        for (let i = 0; i < iterations; i++) {
          findMatchingBracket(buffer, cursor);
        }
        
        const elapsed = performance.now() - start;
        const averageMs = elapsed / iterations;
        
        console.log(`Multi-line match: ${averageMs.toFixed(4)}ms average (${iterations} iterations)`);
        
        expect(averageMs).toBeLessThan(2);
      });

      /**
       * Performance target: Large buffer (1000+ lines) should complete in < 10ms
       */
      it('should handle 1000-line buffer in < 10ms', () => {
        const lines: string[] = [];
        for (let i = 0; i < 1000; i++) {
          lines.push(`line ${i} with some content here`);
        }
        // Add bracket pair at the end
        lines[999] = 'some text (matching) here';
        const buffer = new TextBuffer(lines);
        const cursor = new CursorPosition(999, 10);
        
        const iterations = 100;
        const start = performance.now();
        
        for (let i = 0; i < iterations; i++) {
          findMatchingBracket(buffer, cursor);
        }
        
        const elapsed = performance.now() - start;
        const averageMs = elapsed / iterations;
        
        console.log(`1000-line buffer: ${averageMs.toFixed(4)}ms average (${iterations} iterations)`);
        
        expect(averageMs).toBeLessThan(10);
      });

      /**
       * Performance target: Deep nesting (100+ levels) should complete in < 5ms
       */
      it('should handle 100-level nesting in < 5ms', () => {
        const deepNested = '('.repeat(100) + 'content' + ')'.repeat(100);
        const buffer = new TextBuffer(deepNested);
        const cursor = new CursorPosition(0, 50);
        
        const iterations = 500;
        const start = performance.now();
        
        for (let i = 0; i < iterations; i++) {
          findMatchingBracket(buffer, cursor);
        }
        
        const elapsed = performance.now() - start;
        const averageMs = elapsed / iterations;
        
        console.log(`100-level nesting: ${averageMs.toFixed(4)}ms average (${iterations} iterations)`);
        
        expect(averageMs).toBeLessThan(5);
      });

      /**
       * Performance target: Large multi-line document with nested brackets
       */
      it('should handle large nested document efficiently', () => {
        const lines: string[] = [];
        // Create a large function-like structure
        lines.push('function complex() {');
        for (let i = 1; i < 500; i++) {
          lines.push(`  line ${i} (nested ${i}) {`);
        }
        lines.push('  return value;');
        for (let i = 0; i < 500; i++) {
          lines.push('}');
        }
        const buffer = new TextBuffer(lines);
        const cursor = new CursorPosition(0, 19);
        
        const iterations = 50;
        const start = performance.now();
        
        for (let i = 0; i < iterations; i++) {
          findMatchingBracket(buffer, cursor);
        }
        
        const elapsed = performance.now() - start;
        const averageMs = elapsed / iterations;
        
        console.log(`Large nested doc: ${averageMs.toFixed(4)}ms average (${iterations} iterations)`);
        
        expect(averageMs).toBeLessThan(20);
      });

      /**
       * Benchmark: Various bracket types performance
       */
      it('should have consistent performance across bracket types', () => {
        const testCases = [
          { name: 'parentheses', content: '(test content here)' },
          { name: 'square', content: '[test content here]' },
          { name: 'curly', content: '{test content here}' },
          { name: 'angle', content: '<test content here>' },
        ];
        
        const results: { name: string; avgMs: number }[] = [];
        
        for (const testCase of testCases) {
          const buffer = new TextBuffer(testCase.content);
          const cursor = new CursorPosition(0, 0);
          
          const iterations = 1000;
          const start = performance.now();
          
          for (let i = 0; i < iterations; i++) {
            findMatchingBracket(buffer, cursor);
          }
          
          const elapsed = performance.now() - start;
          results.push({ name: testCase.name, avgMs: elapsed / iterations });
        }
        
        // Log results
        for (const result of results) {
          console.log(`${result.name}: ${result.avgMs.toFixed(4)}ms`);
        }
        
        // All bracket types should perform similarly
        const maxMs = Math.max(...results.map(r => r.avgMs));
        expect(maxMs).toBeLessThan(0.5);
      });

      /**
       * Benchmark: Cold start performance (first call vs. subsequent calls)
       */
      it('should have minimal cold start overhead', () => {
        const buffer = new TextBuffer('(test)');
        const cursor = new CursorPosition(0, 0);
        
        // First call (cold)
        const coldStart = performance.now();
        findMatchingBracket(buffer, cursor);
        const coldTime = performance.now() - coldStart;
        
        // Warm calls
        const iterations = 1000;
        const warmStart = performance.now();
        
        for (let i = 0; i < iterations; i++) {
          findMatchingBracket(buffer, cursor);
        }
        
        const warmTime = performance.now() - warmStart;
        const warmAvg = warmTime / iterations;
        
        console.log(`Cold start: ${coldTime.toFixed(4)}ms`);
        console.log(`Warm average: ${warmAvg.toFixed(4)}ms`);
        
        // Cold start should not be significantly slower
        expect(coldTime).toBeLessThan(5);
        expect(warmAvg).toBeLessThan(0.5);
      });
    });

    // ============================================
    // LEGACY API TESTS
    // ============================================

    describe('legacy API - findMatchingBracketLegacy', () => {
      it('should be a function', () => {
        expect(typeof findMatchingBracketLegacy).toBe('function');
      });

      it('should work with array of lines', () => {
        const lines = ['(test)'];
        const result = findMatchingBracketLegacy(lines, 0, 0);
        expect(result.line).toBe(0);
        expect(result.column).toBe(5);
        expect(result.found).toBe(true);
      });

      it('should handle nested brackets', () => {
        const lines = ['(nested (deep))'];
        const result = findMatchingBracketLegacy(lines, 0, 0);
        expect(result.line).toBe(0);
        expect(result.column).toBe(14);
        expect(result.found).toBe(true);
      });

      it('should return not found for empty array', () => {
        const lines: string[] = [];
        const result = findMatchingBracketLegacy(lines, 0, 0);
        expect(result.found).toBe(false);
      });

      it('should return not found for invalid line', () => {
        const lines = ['(test)'];
        const result = findMatchingBracketLegacy(lines, 10, 0);
        expect(result.found).toBe(false);
      });
    });

    // ============================================
    // REAL-WORLD SCENARIO TESTS
    // ============================================

    describe('real-world scenarios', () => {
      it('should match JavaScript function brackets', () => {
        const buffer = new TextBuffer([
          'function calculate(a, b) {',
          '  const result = a + b;',
          '  return result;',
          '}',
        ]);
        // Line 0: 'function calculate(a, b) {' - { at column 25
        const cursor = new CursorPosition(0, 25);
        const result = findMatchingBracket(buffer, cursor);
        expect(result.line).toBe(3);
        expect(result.column).toBe(0);
        expect(result.found).toBe(true);
      });

      it('should match array brackets in code', () => {
        const buffer = new TextBuffer('const arr = [1, 2, 3, 4, 5];');
        // 'const arr = [1, 2, 3, 4, 5];' - [ at column 11, ] at column 26
        const cursor = new CursorPosition(0, 11);
        const result = findMatchingBracket(buffer, cursor);
        expect(result.line).toBe(0);
        expect(result.column).toBe(26);
        expect(result.found).toBe(true);
      });

      it('should match if statement brackets', () => {
        const buffer = new TextBuffer([
          'if (condition) {',
          '  doSomething();',
          '}',
        ]);
        // Line 0: 'if (condition) {' - ( at column 3, ) at column 13
        const cursor = new CursorPosition(0, 3);
        const result = findMatchingBracket(buffer, cursor);
        expect(result.line).toBe(0);
        expect(result.column).toBe(13);
        expect(result.found).toBe(true);
      });

      it('should handle HTML-like tag matching', () => {
        const buffer = new TextBuffer('<div class="container">');
        // '<div class="container">' - < at column 0, > at column 22
        const cursor = new CursorPosition(0, 0);
        const result = findMatchingBracket(buffer, cursor);
        expect(result.line).toBe(0);
        expect(result.column).toBe(22);
        expect(result.found).toBe(true);
      });
    });

    // ============================================
    // BRACKET TYPE COMPREHENSIVE TESTS
    // ============================================

    describe('all bracket types comprehensive', () => {
      it('should handle parentheses with content', () => {
        const buffer = new TextBuffer('(function call with args)');
        const cursor = new CursorPosition(0, 0);
        const result = findMatchingBracket(buffer, cursor);
        expect(result.found).toBe(true);
        expect(result.column).toBe(24);
      });

      it('should handle nested square brackets', () => {
        const buffer = new TextBuffer('[[[nested]]]');
        const cursor = new CursorPosition(0, 0);
        const result = findMatchingBracket(buffer, cursor);
        expect(result.found).toBe(true);
        expect(result.column).toBe(11);
      });

      it('should handle nested curly braces', () => {
        const buffer = new TextBuffer('{{{object}}}');
        const cursor = new CursorPosition(0, 0);
        const result = findMatchingBracket(buffer, cursor);
        expect(result.found).toBe(true);
        expect(result.column).toBe(11);
      });

      it('should handle nested angle brackets', () => {
        const buffer = new TextBuffer('<<<tags>>>');
        const cursor = new CursorPosition(0, 0);
        const result = findMatchingBracket(buffer, cursor);
        expect(result.found).toBe(true);
        expect(result.column).toBe(9);
      });

      it('should handle alternating bracket types', () => {
        const buffer = new TextBuffer('([{}])');
        const cursor = new CursorPosition(0, 0);
        const result = findMatchingBracket(buffer, cursor);
        expect(result.found).toBe(true);
        expect(result.column).toBe(5);
      });
    });
  });
});
