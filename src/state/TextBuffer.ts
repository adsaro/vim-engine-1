/**
 * TextBuffer - Manages text content with line-based operations
 *
 * The TextBuffer class provides a line-oriented interface for text management.
 * It handles text as an array of lines, supporting operations like getting,
 * setting, inserting, and deleting lines. Character-level operations are also
 * supported for precise text manipulation.
 *
 * @example
 * ```typescript
 * import { TextBuffer } from './state/TextBuffer';
 *
 * // Create from string
 * const buffer = new TextBuffer('Hello\nWorld');
 *
 * // Create from array
 * const buffer2 = new TextBuffer(['Line 1', 'Line 2']);
 *
 * // Line operations
 * const line = buffer.getLine(0); // 'Hello'
 * buffer.setLine(0, 'Hello!'); // Update first line
 * buffer.insertLine(1, 'Middle'); // Insert at position 1
 * buffer.deleteLine(0); // Delete first line
 *
 * // Character operations
 * buffer.insertCharAt(0, 5, '!'); // Insert '!' at position 0:5
 * buffer.deleteCharAt(0, 5); // Delete char at position 0:5
 *
 * // Content operations
 * const content = buffer.getContent(); // Get full text
 * buffer.setContent('New content'); // Replace all content
 * const lineCount = buffer.getLineCount(); // Number of lines
 *
 * // Utility
 * const cloned = buffer.clone(); // Create a copy
 * ```
 */
export class TextBuffer {
  private lines: string[] = [];

  /**
   * Create a new TextBuffer
   *
   * @param initialContent - Initial content as string (separated by newlines)
   *                        or array of lines
   *
   * @example
   * ```typescript
   * // Empty buffer
   * const empty = new TextBuffer();
   *
   * // From string
   * const fromString = new TextBuffer('Line 1\nLine 2');
   *
   * // From array
   * const fromArray = new TextBuffer(['Line 1', 'Line 2']);
   * ```
   */
  constructor(initialContent: string | string[] = []) {
    if (typeof initialContent === 'string') {
      // Handle empty string - result in 0 lines
      if (initialContent === '') {
        this.lines = [];
      } else {
        // Split by newline but filter out trailing empty line from trailing newline
        const splitLines = initialContent.split('\n');
        if (splitLines.length > 1 && splitLines[splitLines.length - 1] === '') {
          splitLines.pop();
        }
        this.lines = splitLines;
      }
    } else {
      this.lines = [...initialContent];
    }
  }

  /**
   * Get line at specified index
   *
   * @param lineNumber - The zero-based line index
   * @returns {string | null} The line content, or null if out of bounds
   *
   * @example
   * ```typescript
   * const line = buffer.getLine(0);
   * if (line !== null) {
   *   console.log(line);
   * }
   * ```
   */
  getLine(lineNumber: number): string | null {
    if (lineNumber < 0 || lineNumber >= this.lines.length) {
      return null;
    }
    return this.lines[lineNumber];
  }

  /**
   * Set line at specified index
   *
   * @param lineNumber - The zero-based line index
   * @param content - The new line content
   * @returns {boolean} True if successful, false if out of bounds
   *
   * @example
   * ```typescript
   * if (buffer.setLine(0, 'Updated content')) {
   *   console.log('Line updated');
   * }
   * ```
   */
  setLine(lineNumber: number, content: string): boolean {
    if (lineNumber < 0 || lineNumber >= this.lines.length) {
      return false;
    }
    this.lines[lineNumber] = content;
    return true;
  }

  /**
   * Insert line at specified index
   *
   * @param lineNumber - The position to insert at (0 to lines.length)
   * @param content - The line content to insert
   * @returns {boolean} True if successful, false if invalid position
   *
   * @example
   * ```typescript
   * // Insert at beginning
   * buffer.insertLine(0, 'New first line');
   *
   * // Insert at end (append)
   * buffer.insertLine(buffer.getLineCount(), 'New last line');
   * ```
   */
  insertLine(lineNumber: number, content: string): boolean {
    if (lineNumber < 0 || lineNumber > this.lines.length) {
      return false;
    }
    this.lines.splice(lineNumber, 0, content);
    return true;
  }

  /**
   * Delete line at specified index
   *
   * @param lineNumber - The zero-based line index to delete
   * @returns {boolean} True if successful, false if out of bounds
   *
   * @example
   * ```typescript
   * buffer.deleteLine(0); // Delete first line
   * ```
   */
  deleteLine(lineNumber: number): boolean {
    if (lineNumber < 0 || lineNumber >= this.lines.length) {
      return false;
    }
    this.lines.splice(lineNumber, 1);
    return true;
  }

  /**
   * Get all lines as a new array
   *
   * Returns a copy to prevent external mutation.
   *
   * @returns {string[]} Array of all lines
   *
   * @example
   * ```typescript
   * const lines = buffer.getLines();
   * lines.forEach((line, index) => {
   *   console.log(`${index}: ${line}`);
   * });
   * ```
   */
  getLines(): string[] {
    return [...this.lines];
  }

  /**
   * Replace all lines with new array
   *
   * @param lines - The new array of lines
   * @returns {void}
   *
   * @example
   * ```typescript
   * buffer.setLines(['New line 1', 'New line 2']);
   * ```
   */
  setLines(lines: string[]): void {
    this.lines = [...lines];
  }

  /**
   * Get full content as string
   *
   * Joins all lines with newline characters.
   *
   * @returns {string} The full text content
   *
   * @example
   * ```typescript
   * const content = buffer.getContent();
   * console.log(content); // "Line 1\nLine 2\nLine 3"
   * ```
   */
  getContent(): string {
    return this.lines.join('\n');
  }

  /**
   * Replace entire content from string
   *
   * @param content - The new content string
   * @returns {void}
   *
   * @example
   * ```typescript
   * buffer.setContent('New\nContent\nHere');
   * ```
   */
  setContent(content: string): void {
    if (content === '') {
      this.lines = [];
    } else {
      const splitLines = content.split('\n');
      if (splitLines.length > 1 && splitLines[splitLines.length - 1] === '') {
        splitLines.pop();
      }
      this.lines = splitLines;
    }
  }

  /**
   * Get total line count
   *
   * @returns {number} The number of lines in the buffer
   *
   * @example
   * ```typescript
   * const count = buffer.getLineCount();
   * console.log(`Buffer has ${count} lines`);
   * ```
   */
  getLineCount(): number {
    return this.lines.length;
  }

  /**
   * Check if buffer is empty
   *
   * @returns {boolean} True if buffer has no lines
   *
   * @example
   * ```typescript
   * if (buffer.isEmpty()) {
   *   console.log('Buffer is empty');
   * }
   * ```
   */
  isEmpty(): boolean {
    return this.lines.length === 0;
  }

  /**
   * Check if line index is valid
   *
   * @param lineNumber - The line index to check
   * @returns {boolean} True if the line index is valid
   *
   * @example
   * ```typescript
   * if (buffer.isValidLine(5)) {
   *   const line = buffer.getLine(5);
   * }
   * ```
   */
  isValidLine(lineNumber: number): boolean {
    return lineNumber >= 0 && lineNumber < this.lines.length;
  }

  /**
   * Get character at position
   *
   * @param lineNumber - The line index
   * @param column - The column index
   * @returns {string | null} The character, or null if out of bounds
   *
   * @example
   * ```typescript
   * const char = buffer.getCharAt(0, 0);
   * if (char === 'H') {
   *   console.log('First character is H');
   * }
   * ```
   */
  getCharAt(lineNumber: number, column: number): string | null {
    const line = this.getLine(lineNumber);
    if (line === null || column < 0 || column >= line.length) {
      return null;
    }
    return line[column];
  }

  /**
   * Insert character at position
   *
   * @param lineNumber - The line index
   * @param column - The column index (0 to line.length)
   * @param char - The character to insert
   * @returns {boolean} True if successful, false if out of bounds
   *
   * @example
   * ```typescript
   * buffer.insertCharAt(0, 5, '!'); // Insert '!' at position 5
   * ```
   */
  insertCharAt(lineNumber: number, column: number, char: string): boolean {
    if (lineNumber < 0 || lineNumber >= this.lines.length) {
      return false;
    }
    if (column < 0 || column > this.lines[lineNumber].length) {
      return false;
    }
    const line = this.lines[lineNumber];
    this.lines[lineNumber] = line.slice(0, column) + char + line.slice(column);
    return true;
  }

  /**
   * Delete character at position
   *
   * @param lineNumber - The line index
   * @param column - The column index
   * @returns {boolean} True if successful, false if out of bounds
   *
   * @example
   * ```typescript
   * buffer.deleteCharAt(0, 5); // Delete char at position 5
   * ```
   */
  deleteCharAt(lineNumber: number, column: number): boolean {
    if (lineNumber < 0 || lineNumber >= this.lines.length) {
      return false;
    }
    const line = this.lines[lineNumber];
    if (column < 0 || column >= line.length) {
      return false;
    }
    this.lines[lineNumber] = line.slice(0, column) + line.slice(column + 1);
    return true;
  }

  /**
   * Create a copy of this buffer
   *
   * @returns {TextBuffer} A new buffer with the same content
   *
   * @example
   * ```typescript
   * const cloned = buffer.clone();
   * // Modifications to cloned don't affect original
   * ```
   */
  clone(): TextBuffer {
    return new TextBuffer([...this.lines]);
  }

  /**
   * Get lines as array
   *
   * Alias for getLines() for API consistency.
   *
   * @returns {string[]} Array of all lines
   */
  toArray(): string[] {
    return [...this.lines];
  }

  /**
   * Create buffer from array
   *
   * Static factory method for creating a buffer from an array.
   *
   * @param lines - The array of lines
   * @returns {TextBuffer} A new buffer with the provided content
   *
   * @example
   * ```typescript
   * const buffer = TextBuffer.fromArray(['Line 1', 'Line 2']);
   * ```
   */
  static fromArray(lines: string[]): TextBuffer {
    return new TextBuffer([...lines]);
  }
}
