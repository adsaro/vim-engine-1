/**
 * TextBuffer Unit Tests
 */
import { TextBuffer } from './TextBuffer';

describe('TextBuffer', () => {
  describe('Constructor', () => {
    it('should create empty buffer by default', () => {
      const buffer = new TextBuffer();
      expect(buffer.getLineCount()).toBe(0);
      expect(buffer.isEmpty()).toBe(true);
    });

    it('should create buffer from string', () => {
      const buffer = new TextBuffer('hello\nworld');
      expect(buffer.getLineCount()).toBe(2);
      expect(buffer.getLine(0)).toBe('hello');
      expect(buffer.getLine(1)).toBe('world');
    });

    it('should create buffer from string array', () => {
      const buffer = new TextBuffer(['line1', 'line2', 'line3']);
      expect(buffer.getLineCount()).toBe(3);
      expect(buffer.getLine(0)).toBe('line1');
      expect(buffer.getLine(1)).toBe('line2');
      expect(buffer.getLine(2)).toBe('line3');
    });

    it('should handle single line string', () => {
      const buffer = new TextBuffer('single line');
      expect(buffer.getLineCount()).toBe(1);
      expect(buffer.getLine(0)).toBe('single line');
    });

    it('should handle empty string', () => {
      const buffer = new TextBuffer('');
      expect(buffer.getLineCount()).toBe(0);
      expect(buffer.isEmpty()).toBe(true);
    });

    it('should handle empty array', () => {
      const buffer = new TextBuffer([]);
      expect(buffer.getLineCount()).toBe(0);
      expect(buffer.isEmpty()).toBe(true);
    });

    it('should handle string with trailing newline', () => {
      const buffer = new TextBuffer('line1\nline2\n');
      expect(buffer.getLineCount()).toBe(2);
      expect(buffer.getLine(0)).toBe('line1');
      expect(buffer.getLine(1)).toBe('line2');
    });
  });

  describe('getLine', () => {
    it('should return line at valid index', () => {
      const buffer = new TextBuffer(['line1', 'line2', 'line3']);
      expect(buffer.getLine(0)).toBe('line1');
      expect(buffer.getLine(1)).toBe('line2');
      expect(buffer.getLine(2)).toBe('line3');
    });

    it('should return null for invalid index', () => {
      const buffer = new TextBuffer(['line1', 'line2']);
      expect(buffer.getLine(-1)).toBeNull();
      expect(buffer.getLine(100)).toBeNull();
    });

    it('should return null for empty buffer', () => {
      const buffer = new TextBuffer();
      expect(buffer.getLine(0)).toBeNull();
    });
  });

  describe('setLine', () => {
    it('should set line at valid index', () => {
      const buffer = new TextBuffer(['old1', 'old2', 'old3']);
      buffer.setLine(1, 'new2');
      expect(buffer.getLine(1)).toBe('new2');
      expect(buffer.getLine(0)).toBe('old1');
      expect(buffer.getLine(2)).toBe('old3');
    });

    it('should return false for invalid index', () => {
      const buffer = new TextBuffer(['line1', 'line2']);
      expect(buffer.setLine(-1, 'test')).toBe(false);
      expect(buffer.setLine(100, 'test')).toBe(false);
    });

    it('should return true for valid index', () => {
      const buffer = new TextBuffer(['line1', 'line2']);
      expect(buffer.setLine(0, 'test')).toBe(true);
    });
  });

  describe('insertLine', () => {
    it('should insert line at valid index', () => {
      const buffer = new TextBuffer(['line1', 'line2', 'line3']);
      buffer.insertLine(1, 'inserted');
      expect(buffer.getLineCount()).toBe(4);
      expect(buffer.getLine(0)).toBe('line1');
      expect(buffer.getLine(1)).toBe('inserted');
      expect(buffer.getLine(2)).toBe('line2');
      expect(buffer.getLine(3)).toBe('line3');
    });

    it('should insert at beginning', () => {
      const buffer = new TextBuffer(['line1', 'line2']);
      buffer.insertLine(0, 'newFirst');
      expect(buffer.getLineCount()).toBe(3);
      expect(buffer.getLine(0)).toBe('newFirst');
      expect(buffer.getLine(1)).toBe('line1');
    });

    it('should insert at end', () => {
      const buffer = new TextBuffer(['line1', 'line2']);
      buffer.insertLine(2, 'newLast');
      expect(buffer.getLineCount()).toBe(3);
      expect(buffer.getLine(1)).toBe('line2');
      expect(buffer.getLine(2)).toBe('newLast');
    });

    it('should return false for invalid index', () => {
      const buffer = new TextBuffer(['line1', 'line2']);
      expect(buffer.insertLine(-1, 'test')).toBe(false);
      expect(buffer.insertLine(100, 'test')).toBe(false);
    });

    it('should return true for valid index', () => {
      const buffer = new TextBuffer(['line1', 'line2']);
      expect(buffer.insertLine(0, 'test')).toBe(true);
    });
  });

  describe('deleteLine', () => {
    it('should delete line at valid index', () => {
      const buffer = new TextBuffer(['line1', 'line2', 'line3']);
      buffer.deleteLine(1);
      expect(buffer.getLineCount()).toBe(2);
      expect(buffer.getLine(0)).toBe('line1');
      expect(buffer.getLine(1)).toBe('line3');
    });

    it('should return false for invalid index', () => {
      const buffer = new TextBuffer(['line1', 'line2']);
      expect(buffer.deleteLine(-1)).toBe(false);
      expect(buffer.deleteLine(100)).toBe(false);
    });

    it('should return true for valid index', () => {
      const buffer = new TextBuffer(['line1', 'line2']);
      expect(buffer.deleteLine(0)).toBe(true);
    });

    it('should handle deleting only line', () => {
      const buffer = new TextBuffer(['onlyLine']);
      buffer.deleteLine(0);
      expect(buffer.getLineCount()).toBe(0);
      expect(buffer.isEmpty()).toBe(true);
    });
  });

  describe('getLines', () => {
    it('should return all lines', () => {
      const buffer = new TextBuffer(['line1', 'line2', 'line3']);
      const lines = buffer.getLines();
      expect(lines).toEqual(['line1', 'line2', 'line3']);
    });

    it('should return copy of lines array', () => {
      const buffer = new TextBuffer(['line1', 'line2']);
      const lines = buffer.getLines();
      lines[0] = 'modified';
      expect(buffer.getLine(0)).toBe('line1');
    });
  });

  describe('setLines', () => {
    it('should replace all lines', () => {
      const buffer = new TextBuffer(['old1', 'old2']);
      buffer.setLines(['new1', 'new2', 'new3']);
      expect(buffer.getLineCount()).toBe(3);
      expect(buffer.getLine(0)).toBe('new1');
      expect(buffer.getLine(1)).toBe('new2');
      expect(buffer.getLine(2)).toBe('new3');
    });

    it('should handle empty array', () => {
      const buffer = new TextBuffer(['line1', 'line2']);
      buffer.setLines([]);
      expect(buffer.getLineCount()).toBe(0);
      expect(buffer.isEmpty()).toBe(true);
    });
  });

  describe('getContent', () => {
    it('should return full content as string', () => {
      const buffer = new TextBuffer(['line1', 'line2', 'line3']);
      expect(buffer.getContent()).toBe('line1\nline2\nline3');
    });

    it('should handle single line', () => {
      const buffer = new TextBuffer('single');
      expect(buffer.getContent()).toBe('single');
    });

    it('should handle empty buffer', () => {
      const buffer = new TextBuffer();
      expect(buffer.getContent()).toBe('');
    });
  });

  describe('setContent', () => {
    it('should replace content from string', () => {
      const buffer = new TextBuffer(['old1', 'old2']);
      buffer.setContent('new1\nnew2\nnew3');
      expect(buffer.getLineCount()).toBe(3);
      expect(buffer.getLine(0)).toBe('new1');
      expect(buffer.getLine(1)).toBe('new2');
      expect(buffer.getLine(2)).toBe('new3');
    });

    it('should handle empty string', () => {
      const buffer = new TextBuffer(['line1', 'line2']);
      buffer.setContent('');
      expect(buffer.getLineCount()).toBe(0);
      expect(buffer.isEmpty()).toBe(true);
    });
  });

  describe('getLineCount', () => {
    it('should return correct line count', () => {
      const buffer = new TextBuffer(['a', 'b', 'c', 'd', 'e']);
      expect(buffer.getLineCount()).toBe(5);
    });

    it('should return 0 for empty buffer', () => {
      const buffer = new TextBuffer();
      expect(buffer.getLineCount()).toBe(0);
    });
  });

  describe('isEmpty', () => {
    it('should return true for empty buffer', () => {
      const buffer = new TextBuffer([]);
      expect(buffer.isEmpty()).toBe(true);
    });

    it('should return false for non-empty buffer', () => {
      const buffer = new TextBuffer(['line1']);
      expect(buffer.isEmpty()).toBe(false);
    });

    it('should return false for buffer with empty lines', () => {
      const buffer = new TextBuffer(['']);
      expect(buffer.isEmpty()).toBe(false);
    });
  });

  describe('isValidLine', () => {
    it('should return true for valid line index', () => {
      const buffer = new TextBuffer(['line1', 'line2']);
      expect(buffer.isValidLine(0)).toBe(true);
      expect(buffer.isValidLine(1)).toBe(true);
    });

    it('should return false for invalid line index', () => {
      const buffer = new TextBuffer(['line1', 'line2']);
      expect(buffer.isValidLine(-1)).toBe(false);
      expect(buffer.isValidLine(2)).toBe(false);
      expect(buffer.isValidLine(100)).toBe(false);
    });

    it('should return false for empty buffer', () => {
      const buffer = new TextBuffer();
      expect(buffer.isValidLine(0)).toBe(false);
    });
  });

  describe('getCharAt', () => {
    it('should return character at valid position', () => {
      const buffer = new TextBuffer(['hello', 'world']);
      expect(buffer.getCharAt(0, 0)).toBe('h');
      expect(buffer.getCharAt(0, 4)).toBe('o');
      expect(buffer.getCharAt(1, 0)).toBe('w');
    });

    it('should return null for invalid position', () => {
      const buffer = new TextBuffer(['hello']);
      expect(buffer.getCharAt(-1, 0)).toBeNull();
      expect(buffer.getCharAt(0, -1)).toBeNull();
      expect(buffer.getCharAt(0, 100)).toBeNull();
      expect(buffer.getCharAt(100, 0)).toBeNull();
    });

    it('should handle empty line', () => {
      const buffer = new TextBuffer(['']);
      expect(buffer.getCharAt(0, 0)).toBeNull();
    });
  });

  describe('insertCharAt', () => {
    it('should insert character at valid position', () => {
      const buffer = new TextBuffer(['hello']);
      buffer.insertCharAt(0, 5, '!');
      expect(buffer.getLine(0)).toBe('hello!');
    });

    it('should insert at beginning', () => {
      const buffer = new TextBuffer(['hello']);
      buffer.insertCharAt(0, 0, 'X');
      expect(buffer.getLine(0)).toBe('Xhello');
    });

    it('should insert in middle', () => {
      const buffer = new TextBuffer(['hello']);
      buffer.insertCharAt(0, 2, 'X');
      expect(buffer.getLine(0)).toBe('heXllo');
    });

    it('should return false for invalid position', () => {
      const buffer = new TextBuffer(['hello']);
      expect(buffer.insertCharAt(-1, 0, 'x')).toBe(false);
      expect(buffer.insertCharAt(0, -1, 'x')).toBe(false);
      expect(buffer.insertCharAt(100, 0, 'x')).toBe(false);
    });

    it('should return true for valid position', () => {
      const buffer = new TextBuffer(['hello']);
      expect(buffer.insertCharAt(0, 0, 'x')).toBe(true);
    });
  });

  describe('deleteCharAt', () => {
    it('should delete character at valid position', () => {
      const buffer = new TextBuffer(['hello']);
      buffer.deleteCharAt(0, 2);
      expect(buffer.getLine(0)).toBe('helo');
    });

    it('should delete from beginning', () => {
      const buffer = new TextBuffer(['hello']);
      buffer.deleteCharAt(0, 0);
      expect(buffer.getLine(0)).toBe('ello');
    });

    it('should delete from end', () => {
      const buffer = new TextBuffer(['hello']);
      buffer.deleteCharAt(0, 4);
      expect(buffer.getLine(0)).toBe('hell');
    });

    it('should return false for invalid position', () => {
      const buffer = new TextBuffer(['hello']);
      expect(buffer.deleteCharAt(-1, 0)).toBe(false);
      expect(buffer.deleteCharAt(0, -1)).toBe(false);
      expect(buffer.deleteCharAt(100, 0)).toBe(false);
      expect(buffer.deleteCharAt(0, 100)).toBe(false);
    });

    it('should return true for valid position', () => {
      const buffer = new TextBuffer(['hello']);
      expect(buffer.deleteCharAt(0, 0)).toBe(true);
    });
  });

  describe('clone', () => {
    it('should create independent copy', () => {
      const buffer = new TextBuffer(['line1', 'line2']);
      const cloned = buffer.clone();
      cloned.setLine(0, 'modified');
      expect(buffer.getLine(0)).toBe('line1');
    });

    it('should have same content', () => {
      const buffer = new TextBuffer(['line1', 'line2']);
      const cloned = buffer.clone();
      expect(cloned.getLineCount()).toBe(2);
      expect(cloned.getLine(0)).toBe('line1');
      expect(cloned.getLine(1)).toBe('line2');
    });
  });

  describe('toArray', () => {
    it('should return copy of lines array', () => {
      const buffer = new TextBuffer(['line1', 'line2']);
      const arr = buffer.toArray();
      arr[0] = 'modified';
      expect(buffer.getLine(0)).toBe('line1');
      expect(arr).toEqual(['modified', 'line2']);
    });
  });

  describe('fromArray', () => {
    it('should create buffer from array', () => {
      const buffer = TextBuffer.fromArray(['a', 'b', 'c']);
      expect(buffer.getLineCount()).toBe(3);
      expect(buffer.getLine(0)).toBe('a');
      expect(buffer.getLine(1)).toBe('b');
      expect(buffer.getLine(2)).toBe('c');
    });

    it('should handle empty array', () => {
      const buffer = TextBuffer.fromArray([]);
      expect(buffer.getLineCount()).toBe(0);
      expect(buffer.isEmpty()).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle many lines', () => {
      const lines = Array.from({ length: 100 }, (_, i) => `line${i}`);
      const buffer = new TextBuffer(lines);
      expect(buffer.getLineCount()).toBe(100);
      expect(buffer.getLine(99)).toBe('line99');
    });

    it('should handle long lines', () => {
      const longLine = 'x'.repeat(10000);
      const buffer = new TextBuffer([longLine]);
      expect(buffer.getLine(0)).toBe(longLine);
      expect(buffer.getLine(0)?.length).toBe(10000);
    });

    it('should handle lines with special characters', () => {
      const specialLine = 'hello\tworld\ntest"\'\n\\';
      const buffer = new TextBuffer([specialLine]);
      expect(buffer.getLine(0)).toBe(specialLine);
    });

    it('should handle unicode characters', () => {
      const unicodeLine = 'Hello 世界 🌍 Émoji';
      const buffer = new TextBuffer([unicodeLine]);
      expect(buffer.getLine(0)).toBe(unicodeLine);
    });
  });
});
