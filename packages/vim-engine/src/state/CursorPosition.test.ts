/**
 * CursorPosition Unit Tests
 */
import { CursorPosition } from './CursorPosition';

describe('CursorPosition', () => {
  describe('Constructor', () => {
    it('should create position with default values (0, 0)', () => {
      const position = new CursorPosition();
      expect(position.line).toBe(0);
      expect(position.column).toBe(0);
    });

    it('should create position with specified line and column', () => {
      const position = new CursorPosition(5, 10);
      expect(position.line).toBe(5);
      expect(position.column).toBe(10);
    });

    it('should create position with only line specified', () => {
      const position = new CursorPosition(3);
      expect(position.line).toBe(3);
      expect(position.column).toBe(0);
    });

    it('should clamp negative coordinates to 0', () => {
      const position = new CursorPosition(-1, -5);
      expect(position.line).toBe(0);
      expect(position.column).toBe(0);
    });
  });

  describe('withLine', () => {
    it('should return new position with new line', () => {
      const position = new CursorPosition(5, 10);
      const newPosition = position.withLine(15);
      expect(newPosition.line).toBe(15);
      expect(newPosition.column).toBe(10);
    });

    it('should not modify original position', () => {
      const position = new CursorPosition(5, 10);
      const newPosition = position.withLine(15);
      expect(position.line).toBe(5);
      expect(position.column).toBe(10);
    });

    it('should clamp negative line to 0', () => {
      const position = new CursorPosition(5, 10);
      const newPosition = position.withLine(-3);
      expect(newPosition.line).toBe(0);
    });
  });

  describe('withColumn', () => {
    it('should return new position with new column', () => {
      const position = new CursorPosition(5, 10);
      const newPosition = position.withColumn(20);
      expect(newPosition.line).toBe(5);
      expect(newPosition.column).toBe(20);
    });

    it('should not modify original position', () => {
      const position = new CursorPosition(5, 10);
      const newPosition = position.withColumn(20);
      expect(position.line).toBe(5);
      expect(position.column).toBe(10);
    });

    it('should clamp negative column to 0', () => {
      const position = new CursorPosition(5, 10);
      const newPosition = position.withColumn(-3);
      expect(newPosition.column).toBe(0);
    });
  });

  describe('moveLeft', () => {
    it('should return new position with column decremented by 1', () => {
      const position = new CursorPosition(5, 10);
      const newPosition = position.moveLeft();
      expect(newPosition.line).toBe(5);
      expect(newPosition.column).toBe(9);
    });

    it('should not modify original position', () => {
      const position = new CursorPosition(5, 10);
      position.moveLeft();
      expect(position.column).toBe(10);
    });

    it('should clamp column to 0 when moving left from 0', () => {
      const position = new CursorPosition(5, 0);
      const newPosition = position.moveLeft();
      expect(newPosition.column).toBe(0);
    });
  });

  describe('moveRight', () => {
    it('should return new position with column incremented by 1', () => {
      const position = new CursorPosition(5, 10);
      const newPosition = position.moveRight();
      expect(newPosition.line).toBe(5);
      expect(newPosition.column).toBe(11);
    });

    it('should not modify original position', () => {
      const position = new CursorPosition(5, 10);
      position.moveRight();
      expect(position.column).toBe(10);
    });
  });

  describe('moveUp', () => {
    it('should return new position with line decremented by 1', () => {
      const position = new CursorPosition(5, 10);
      const newPosition = position.moveUp();
      expect(newPosition.line).toBe(4);
      expect(newPosition.column).toBe(10);
    });

    it('should not modify original position', () => {
      const position = new CursorPosition(5, 10);
      position.moveUp();
      expect(position.line).toBe(5);
    });

    it('should clamp line to 0 when moving up from 0', () => {
      const position = new CursorPosition(0, 10);
      const newPosition = position.moveUp();
      expect(newPosition.line).toBe(0);
    });
  });

  describe('moveDown', () => {
    it('should return new position with line incremented by 1', () => {
      const position = new CursorPosition(5, 10);
      const newPosition = position.moveDown();
      expect(newPosition.line).toBe(6);
      expect(newPosition.column).toBe(10);
    });

    it('should not modify original position', () => {
      const position = new CursorPosition(5, 10);
      position.moveDown();
      expect(position.line).toBe(5);
    });
  });

  describe('Query Methods', () => {
    describe('isAtStartOfLine', () => {
      it('should return true when column is 0', () => {
        const position = new CursorPosition(5, 0);
        expect(position.isAtStartOfLine()).toBe(true);
      });

      it('should return false when column is greater than 0', () => {
        const position = new CursorPosition(5, 1);
        expect(position.isAtStartOfLine()).toBe(false);
      });
    });

    describe('isAtEndOfLine', () => {
      it('should return true when column is at line length', () => {
        const position = new CursorPosition(5, 20);
        expect(position.isAtEndOfLine(20)).toBe(true);
      });

      it('should return false when column is less than line length', () => {
        const position = new CursorPosition(5, 19);
        expect(position.isAtEndOfLine(20)).toBe(false);
      });

      it('should return false when column is greater than line length', () => {
        const position = new CursorPosition(5, 21);
        expect(position.isAtEndOfLine(20)).toBe(false);
      });
    });

    describe('isAtStart', () => {
      it('should return true when at (0, 0)', () => {
        const position = new CursorPosition(0, 0);
        expect(position.isAtStart()).toBe(true);
      });

      it('should return false when line is greater than 0', () => {
        const position = new CursorPosition(1, 0);
        expect(position.isAtStart()).toBe(false);
      });

      it('should return false when column is greater than 0', () => {
        const position = new CursorPosition(0, 1);
        expect(position.isAtStart()).toBe(false);
      });
    });

    describe('isAtEnd', () => {
      it('should return true when at end of buffer', () => {
        const position = new CursorPosition(100, 50);
        expect(position.isAtEnd(100, 50)).toBe(true);
      });

      it('should return false when before end of buffer', () => {
        const position = new CursorPosition(100, 49);
        expect(position.isAtEnd(100, 50)).toBe(false);
      });

      it('should return false when past end of buffer', () => {
        const position = new CursorPosition(100, 51);
        expect(position.isAtEnd(100, 50)).toBe(false);
      });
    });
  });

  describe('Comparison Methods', () => {
    describe('equals', () => {
      it('should return true for same position', () => {
        const pos1 = new CursorPosition(5, 10);
        const pos2 = new CursorPosition(5, 10);
        expect(pos1.equals(pos2)).toBe(true);
      });

      it('should return false for different line', () => {
        const pos1 = new CursorPosition(5, 10);
        const pos2 = new CursorPosition(6, 10);
        expect(pos1.equals(pos2)).toBe(false);
      });

      it('should return false for different column', () => {
        const pos1 = new CursorPosition(5, 10);
        const pos2 = new CursorPosition(5, 11);
        expect(pos1.equals(pos2)).toBe(false);
      });

      it('should return true for same object reference', () => {
        const position = new CursorPosition(5, 10);
        expect(position.equals(position)).toBe(true);
      });
    });

    describe('isBefore', () => {
      it('should return true when line is less', () => {
        const pos1 = new CursorPosition(4, 10);
        const pos2 = new CursorPosition(5, 10);
        expect(pos1.isBefore(pos2)).toBe(true);
      });

      it('should return true when line is equal and column is less', () => {
        const pos1 = new CursorPosition(5, 9);
        const pos2 = new CursorPosition(5, 10);
        expect(pos1.isBefore(pos2)).toBe(true);
      });

      it('should return false when line is greater', () => {
        const pos1 = new CursorPosition(6, 10);
        const pos2 = new CursorPosition(5, 10);
        expect(pos1.isBefore(pos2)).toBe(false);
      });

      it('should return false when line is equal and column is greater', () => {
        const pos1 = new CursorPosition(5, 11);
        const pos2 = new CursorPosition(5, 10);
        expect(pos1.isBefore(pos2)).toBe(false);
      });

      it('should return false when positions are equal', () => {
        const pos1 = new CursorPosition(5, 10);
        const pos2 = new CursorPosition(5, 10);
        expect(pos1.isBefore(pos2)).toBe(false);
      });
    });

    describe('isAfter', () => {
      it('should return true when line is greater', () => {
        const pos1 = new CursorPosition(6, 10);
        const pos2 = new CursorPosition(5, 10);
        expect(pos1.isAfter(pos2)).toBe(true);
      });

      it('should return true when line is equal and column is greater', () => {
        const pos1 = new CursorPosition(5, 11);
        const pos2 = new CursorPosition(5, 10);
        expect(pos1.isAfter(pos2)).toBe(true);
      });

      it('should return false when line is less', () => {
        const pos1 = new CursorPosition(4, 10);
        const pos2 = new CursorPosition(5, 10);
        expect(pos1.isAfter(pos2)).toBe(false);
      });

      it('should return false when line is equal and column is less', () => {
        const pos1 = new CursorPosition(5, 9);
        const pos2 = new CursorPosition(5, 10);
        expect(pos1.isAfter(pos2)).toBe(false);
      });

      it('should return false when positions are equal', () => {
        const pos1 = new CursorPosition(5, 10);
        const pos2 = new CursorPosition(5, 10);
        expect(pos1.isAfter(pos2)).toBe(false);
      });
    });
  });

  describe('Utility Methods', () => {
    describe('clone', () => {
      it('should create a new position with same values', () => {
        const position = new CursorPosition(5, 10);
        const cloned = position.clone();
        expect(cloned.line).toBe(5);
        expect(cloned.column).toBe(10);
      });

      it('should return an equal but independent instance', () => {
        const position = new CursorPosition(5, 10);
        const cloned = position.clone();
        expect(cloned.equals(position)).toBe(true);
        expect(cloned).not.toBe(position);
      });
    });

    describe('toString', () => {
      it('should return formatted string', () => {
        const position = new CursorPosition(5, 10);
        expect(position.toString()).toBe('(5, 10)');
      });

      it('should handle zero values', () => {
        const position = new CursorPosition(0, 0);
        expect(position.toString()).toBe('(0, 0)');
      });
    });

    describe('toJSON', () => {
      it('should return JSON object with line and column', () => {
        const position = new CursorPosition(5, 10);
        const json = position.toJSON();
        expect(json).toEqual({ line: 5, column: 10 });
      });

      it('should handle zero values', () => {
        const position = new CursorPosition(0, 0);
        const json = position.toJSON();
        expect(json).toEqual({ line: 0, column: 0 });
      });
    });

    describe('fromJSON', () => {
      it('should create position from JSON object', () => {
        const position = CursorPosition.fromJSON({ line: 5, column: 10 });
        expect(position.line).toBe(5);
        expect(position.column).toBe(10);
      });

      it('should handle zero values', () => {
        const position = CursorPosition.fromJSON({ line: 0, column: 0 });
        expect(position.line).toBe(0);
        expect(position.column).toBe(0);
      });

      it('should clamp negative values', () => {
        const position = CursorPosition.fromJSON({ line: -1, column: -5 });
        expect(position.line).toBe(0);
        expect(position.column).toBe(0);
      });
    });

    describe('fromEvent', () => {
      it('should create position from mouse event', () => {
        const event = {
          clientX: 100,
          clientY: 200,
        } as MouseEvent;
        const position = CursorPosition.fromEvent(event, 10, 20);
        // column = 100 / 10 = 10, line = 200 / 20 = 10
        expect(position.line).toBe(10);
        expect(position.column).toBe(10);
      });

      it('should apply character and line height multipliers', () => {
        const event = {
          clientX: 150,
          clientY: 300,
        } as MouseEvent;
        const position = CursorPosition.fromEvent(event, 15, 25);
        expect(position.line).toBe(12); // 300 / 25
        expect(position.column).toBe(10); // 150 / 15
      });

      it('should handle zero coordinates', () => {
        const event = {
          clientX: 0,
          clientY: 0,
        } as MouseEvent;
        const position = CursorPosition.fromEvent(event, 10, 20);
        expect(position.line).toBe(0);
        expect(position.column).toBe(0);
      });
    });
  });

  describe('Immutability', () => {
    it('should not allow direct modification of line property', () => {
      const position = new CursorPosition(5, 10);
      // Properties are readonly through getters, so this would be a TypeScript error at compile time
      // At runtime, we can verify the value doesn't change
      const newPosition = position.withLine(20);
      expect(position.line).toBe(5);
      expect(newPosition.line).toBe(20);
    });

    it('should not allow direct modification of column property', () => {
      const position = new CursorPosition(5, 10);
      const newPosition = position.withColumn(20);
      expect(position.column).toBe(10);
      expect(newPosition.column).toBe(20);
    });

    it('should create new instances for all movement methods', () => {
      const original = new CursorPosition(5, 10);

      const afterMoveLeft = original.moveLeft();
      const afterMoveRight = original.moveRight();
      const afterMoveUp = original.moveUp();
      const afterMoveDown = original.moveDown();
      const afterWithLine = original.withLine(15);
      const afterWithColumn = original.withColumn(15);
      const cloned = original.clone();

      expect(afterMoveLeft).not.toBe(original);
      expect(afterMoveRight).not.toBe(original);
      expect(afterMoveUp).not.toBe(original);
      expect(afterMoveDown).not.toBe(original);
      expect(afterWithLine).not.toBe(original);
      expect(afterWithColumn).not.toBe(original);
      expect(cloned).not.toBe(original);
    });
  });
});
