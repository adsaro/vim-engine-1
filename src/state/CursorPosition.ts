/**
 * CursorPosition - Immutable cursor position tracking
 *
 * The CursorPosition class manages immutable cursor location with line and column coordinates.
 * All mutation methods return new instances to ensure immutability.
 *
 * @example
 * ```typescript
 * import { CursorPosition } from './state/CursorPosition';
 *
 * // Create at default position (0, 0)
 * const cursor = new CursorPosition();
 *
 * // Create at specific position
 * const cursor2 = new CursorPosition(5, 10);
 *
 * // Move cursor (returns new instance)
 * const newCursor = cursor.withLine(5).withColumn(10);
 *
 * // Check position
 * if (cursor.isAtStart()) {
 *   console.log('At start of buffer');
 * }
 *
 * // Clone position
 * const cloned = cursor.clone();
 *
 * // Convert to string
 * console.log(cursor.toString()); // "(5, 10)"
 * ```
 */
export class CursorPosition {
  private readonly _line: number;
  private readonly _column: number;
  private readonly _desiredColumn: number;

  /**
   * Create a new CursorPosition
   *
   * @param line - The line number (default: 0, clamped to minimum 0)
   * @param column - The column number (default: 0, clamped to minimum 0)
   * @param desiredColumn - The desired column for vertical movement (default: undefined, uses column)
   *
   * @example
   * ```typescript
   * // Default position
   * const pos1 = new CursorPosition();
   *
   * // Specific position
   * const pos2 = new CursorPosition(5, 10);
   *
   * // Single argument (line only)
   * const pos3 = new CursorPosition(3);
   *
   * // With desired column (for vertical movement)
   * const pos4 = new CursorPosition(3, 10, 20); // column is 10, but desired is 20
   * ```
   */
  constructor(line: number = 0, column: number = 0, desiredColumn: number | undefined = undefined) {
    this._line = Math.max(0, line);
    this._column = Math.max(0, column);
    this._desiredColumn = desiredColumn !== undefined ? Math.max(0, desiredColumn) : this._column;
  }

  /**
   * The line number (0-indexed, read-only)
   */
  get line(): number {
    return this._line;
  }

  /**
   * The column number (0-indexed, read-only)
   * This is the actual column position, clamped to the current line's length
   */
  get column(): number {
    return this._column;
  }

  /**
   * The desired column number for vertical movement (0-indexed, read-only)
   * This is preserved when moving vertically to allow returning to this column
   * when moving to a longer line
   */
  get desiredColumn(): number {
    return this._desiredColumn;
  }

  /**
   * Create a new position with a different line
   *
   * @param line - The new line number (clamped to minimum 0)
   * @returns {CursorPosition} A new CursorPosition with the specified line
   *
   * @example
   * ```typescript
   * const cursor = new CursorPosition(5, 10);
   * const newCursor = cursor.withLine(15);
   * // newCursor.line === 15, newCursor.column === 10
   * ```
   */
  withLine(line: number): CursorPosition {
    return new CursorPosition(line, this._column, this._desiredColumn);
  }

  /**
   * Create a new position with a different column
   *
   * @param column - The new column number (clamped to minimum 0)
   * @returns {CursorPosition} A new CursorPosition with the specified column
   *
   * @example
   * ```typescript
   * const cursor = new CursorPosition(5, 10);
   * const newCursor = cursor.withColumn(20);
   * // newCursor.line === 5, newCursor.column === 20
   * ```
   */
  withColumn(column: number): CursorPosition {
    return new CursorPosition(this._line, column, column);
  }

  /**
   * Create a new position with a different desired column
   *
   * This is used for vertical movement to preserve the desired column position
   * even when the actual column is clamped to the line length.
   *
   * @param column - The actual column number (clamped to minimum 0)
   * @param desiredColumn - The desired column number (clamped to minimum 0)
   * @returns {CursorPosition} A new CursorPosition with the specified columns
   *
   * @example
   * ```typescript
   * const cursor = new CursorPosition(5, 10, 20);
   * const newCursor = cursor.withColumns(8, 20);
   * // newCursor.column === 8, newCursor.desiredColumn === 20
   * ```
   */
  withColumns(column: number, desiredColumn: number): CursorPosition {
    return new CursorPosition(this._line, column, desiredColumn);
  }

  /**
   * Move cursor left by one column
   *
   * @returns {CursorPosition} A new CursorPosition with column decremented by 1 (minimum 0)
   *
   * @example
   * ```typescript
   * const cursor = new CursorPosition(5, 10);
   * const newCursor = cursor.moveLeft();
   * // newCursor.line === 5, newCursor.column === 9
   * ```
   */
  moveLeft(): CursorPosition {
    return new CursorPosition(
      this._line,
      Math.max(0, this._column - 1),
      Math.max(0, this._column - 1)
    );
  }

  /**
   * Move cursor right by one column
   *
   * @returns {CursorPosition} A new CursorPosition with column incremented by 1
   *
   * @example
   * ```typescript
   * const cursor = new CursorPosition(5, 10);
   * const newCursor = cursor.moveRight();
   * // newCursor.line === 5, newCursor.column === 11
   * ```
   */
  moveRight(): CursorPosition {
    return new CursorPosition(this._line, this._column + 1, this._column + 1);
  }

  /**
   * Move cursor up by one line
   *
   * @returns {CursorPosition} A new CursorPosition with line decremented by 1 (minimum 0)
   *
   * @example
   * ```typescript
   * const cursor = new CursorPosition(5, 10);
   * const newCursor = cursor.moveUp();
   * // newCursor.line === 4, newCursor.column === 10
   * ```
   */
  moveUp(): CursorPosition {
    return new CursorPosition(Math.max(0, this._line - 1), this._column, this._desiredColumn);
  }

  /**
   * Move cursor down by one line
   *
   * @returns {CursorPosition} A new CursorPosition with line incremented by 1
   *
   * @example
   * ```typescript
   * const cursor = new CursorPosition(5, 10);
   * const newCursor = cursor.moveDown();
   * // newCursor.line === 6, newCursor.column === 10
   * ```
   */
  moveDown(): CursorPosition {
    return new CursorPosition(this._line + 1, this._column, this._desiredColumn);
  }

  /**
   * Check if cursor is at the start of the line
   *
   * @returns {boolean} True if column is 0
   *
   * @example
   * ```typescript
   * const cursor = new CursorPosition(5, 0);
   * if (cursor.isAtStartOfLine()) {
   *   console.log('At beginning of line');
   * }
   * ```
   */
  isAtStartOfLine(): boolean {
    return this._column === 0;
  }

  /**
   * Check if cursor is at the end of the line
   *
   * @param lineLength - The length of the current line
   * @returns {boolean} True if column equals line length
   *
   * @example
   * ```typescript
   * const cursor = new CursorPosition(5, 20);
   * if (cursor.isAtEndOfLine(currentLine.length)) {
   *   console.log('At end of line');
   * }
   * ```
   */
  isAtEndOfLine(lineLength: number): boolean {
    return this._column === lineLength;
  }

  /**
   * Check if cursor is at the start of the buffer
   *
   * @returns {boolean} True if at position (0, 0)
   *
   * @example
   * ```typescript
   * const cursor = new CursorPosition(0, 0);
   * if (cursor.isAtStart()) {
   *   console.log('At buffer start');
   * }
   * ```
   */
  isAtStart(): boolean {
    return this._line === 0 && this._column === 0;
  }

  /**
   * Check if cursor is at the end of the buffer
   *
   * @param maxLine - The last valid line number
   * @param maxColumn - The last valid column number
   * @returns {boolean} True if at the specified end position
   *
   * @example
   * ```typescript
   * const cursor = new CursorPosition(100, 50);
   * if (cursor.isAtEnd(lastLine, lastLine.length)) {
   *   console.log('At buffer end');
   * }
   * ```
   */
  isAtEnd(maxLine: number, maxColumn: number): boolean {
    return this._line === maxLine && this._column === maxColumn;
  }

  /**
   * Compare equality with another position
   *
   * @param other - The position to compare with
   * @returns {boolean} True if positions are equal
   *
   * @example
   * ```typescript
   * const pos1 = new CursorPosition(5, 10);
   * const pos2 = new CursorPosition(5, 10);
   * if (pos1.equals(pos2)) {
   *   console.log('Same position');
   * }
   * ```
   */
  equals(other: CursorPosition): boolean {
    return this._line === other._line && this._column === other._column;
  }

  /**
   * Check if this position is before another
   *
   * @param other - The position to compare with
   * @returns {boolean} True if this position comes before the other
   *
   * @example
   * ```typescript
   * const pos1 = new CursorPosition(4, 10);
   * const pos2 = new CursorPosition(5, 10);
   * if (pos1.isBefore(pos2)) {
   *   // pos1 is above or to the left of pos2
   * }
   * ```
   */
  isBefore(other: CursorPosition): boolean {
    if (this._line < other._line) return true;
    if (this._line > other._line) return false;
    return this._column < other._column;
  }

  /**
   * Check if this position is after another
   *
   * @param other - The position to compare with
   * @returns {boolean} True if this position comes after the other
   *
   * @example
   * ```typescript
   * const pos1 = new CursorPosition(6, 10);
   * const pos2 = new CursorPosition(5, 10);
   * if (pos1.isAfter(pos2)) {
   *   // pos1 is below or to the right of pos2
   * }
   * ```
   */
  isAfter(other: CursorPosition): boolean {
    if (this._line > other._line) return true;
    if (this._line < other._line) return false;
    return this._column > other._column;
  }

  /**
   * Create a copy of this position
   *
   * @returns {CursorPosition} A new position with the same coordinates
   *
   * @example
   * ```typescript
   * const cursor = new CursorPosition(5, 10);
   * const saved = cursor.clone();
   * // saved.line === 5, saved.column === 10
   * ```
   */
  clone(): CursorPosition {
    return new CursorPosition(this._line, this._column, this._desiredColumn);
  }

  /**
   * Get string representation
   *
   * @returns {string} Position in format "(line, column)"
   *
   * @example
   * ```typescript
   * const cursor = new CursorPosition(5, 10);
   * console.log(cursor.toString()); // "(5, 10)"
   * ```
   */
  toString(): string {
    return `(${this._line}, ${this._column})`;
  }

  /**
   * Get JSON representation
   *
   * @returns {Object} Object with line and column properties
   *
   * @example
   * ```typescript
   * const cursor = new CursorPosition(5, 10);
   * const json = cursor.toJSON();
   * // json === { line: 5, column: 10 }
   * ```
   */
  toJSON(): { line: number; column: number } {
    return { line: this._line, column: this._column };
  }

  /**
   * Create position from JSON object
   *
   * @param data - Object with line and column properties
   * @returns {CursorPosition} A new CursorPosition from the JSON data
   *
   * @example
   * ```typescript
   * const cursor = CursorPosition.fromJSON({ line: 5, column: 10 });
   * ```
   */
  static fromJSON(data: { line: number; column: number }): CursorPosition {
    return new CursorPosition(data.line, data.column, data.column);
  }

  /**
   * Create position from mouse event
   *
   * Converts mouse coordinates to a cursor position based on
   * character width and line height.
   *
   * @param event - The mouse event
   * @param charWidth - Width of a single character in pixels
   * @param lineHeight - Height of a line in pixels
   * @returns {CursorPosition} The calculated position
   *
   * @example
   * ```typescript
   * document.addEventListener('click', (event) => {
   *   const pos = CursorPosition.fromEvent(event, 10, 20);
   *   console.log(`Clicked at line ${pos.line}, column ${pos.column}`);
   * });
   * ```
   */
  static fromEvent(event: MouseEvent, charWidth: number, lineHeight: number): CursorPosition {
    const column = Math.floor(event.clientX / charWidth);
    const line = Math.floor(event.clientY / lineHeight);
    return new CursorPosition(line, column, column);
  }
}
