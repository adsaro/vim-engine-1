/**
 * ChangeOperatorPlugin - Change operator (c key)
 *
 * Implements the vim 'c' operator for deleting text with motions and entering insert mode.
 * Supports motions like: cw (change word), cc (change line), c$ (change to end), etc.
 * Works in operator-pending mode.
 *
 * @example
 * ```typescript
 * import { ChangeOperatorPlugin } from './operators/change/ChangeOperatorPlugin';
 *
 * const plugin = new ChangeOperatorPlugin();
 * // Press 'c' then 'w' to change a word (delete word and enter insert mode)
 * // Press 'c' then 'c' to change current line
 * ```
 */
import { AbstractVimPlugin } from '../../../plugin/AbstractVimPlugin';
import { ExecutionContext } from '../../../plugin/ExecutionContext';
import { VimMode, VIM_MODE } from '../../../state/VimMode';
import { CursorPosition } from '../../../state/CursorPosition';
import { TextBuffer } from '../../../state/TextBuffer';

/**
 * ChangeOperatorPlugin - Delete text with motions and enter insert mode
 *
 * The 'c' operator in vim is used with motions to delete text and then enter insert mode.
 * When 'c' is pressed, it enters operator-pending mode and waits for a motion.
 */
export class ChangeOperatorPlugin extends AbstractVimPlugin {
  /**
   * Plugin name
   */
  readonly name = 'operator-change';

  /**
   * Plugin version
   */
  readonly version = '1.0.0';

  /**
   * Plugin description
   */
  readonly description = 'Change operator (c key)';

  /**
   * Keystroke patterns handled by this plugin
   * 'c' starts the operator, 'cc' is a special case for change line
   */
  readonly patterns = ['c', 'cc'];

  /**
   * Modes this plugin is active in
   */
  readonly modes: VimMode[] = [VIM_MODE.NORMAL, VIM_MODE.OPERATOR_PENDING];

  /**
   * Create a new ChangeOperatorPlugin
   */
  constructor() {
    super(
      'operator-change',
      'Change operator (c key)',
      ['c', 'cc'],
      [VIM_MODE.NORMAL, VIM_MODE.OPERATOR_PENDING]
    );
  }

  /**
   * Perform the change action
   *
   * If in NORMAL mode, enters OPERATOR_PENDING mode.
   * If in OPERATOR_PENDING mode (second 'c'), changes current line.
   *
   * @param context - The execution context
   */
  protected performAction(context: ExecutionContext): void {
    const currentMode = context.getMode();
    const pattern = context.getCurrentPattern();

    if (currentMode === VIM_MODE.NORMAL) {
      if (pattern === 'cc') {
        // Special case: 'cc' changes the current line immediately
        this.changeLine(context);
      } else {
        // Enter operator-pending mode, waiting for motion
        context.setMode(VIM_MODE.OPERATOR_PENDING);
        context.getState().setPendingOperator('c');
        // Save the count for when the motion/second operator comes
        context.getState().setPendingCount(context.getCount() || 1);
      }
    } else if (currentMode === VIM_MODE.OPERATOR_PENDING) {
      // Second 'c' in operator-pending mode means change line
      this.changeLine(context);
      // changeLine() already sets mode to INSERT, just clear the pending operator
      context.getState().setPendingOperator(null);
    }
  }

  /**
   * Change the current line (delete line and enter insert mode)
   *
   * @param context - The execution context
   */
  changeLine(context: ExecutionContext): void {
    const buffer = context.getBuffer();
    const cursor = context.getCursor();
    // Use pending count if in operator-pending mode, otherwise use current count
    const count = context.getMode() === VIM_MODE.OPERATOR_PENDING
      ? context.getState().getPendingCount()
      : (context.getCount() || 1);

    if (buffer.isEmpty()) {
      // If buffer is empty, just enter insert mode
      context.setMode(VIM_MODE.INSERT);
      return;
    }

    // Store the lines being deleted
    const linesToDelete: string[] = [];
    const startLine = cursor.line;
    const endLine = Math.min(startLine + count - 1, buffer.getLineCount() - 1);

    for (let i = startLine; i <= endLine; i++) {
      const line = buffer.getLine(i);
      if (line !== null) {
        linesToDelete.push(line);
      }
    }

    // Store deleted text in unnamed register (with newline)
    const deletedText = linesToDelete.join('\n') + '\n';
    context.setRegister('"', deletedText);

    // Delete lines from bottom to top to maintain correct indices
    for (let i = endLine; i >= startLine; i--) {
      buffer.deleteLine(i);
    }

    // Insert new empty line(s) at the position
    for (let i = 0; i < count; i++) {
      buffer.insertLine(startLine, '');
    }

    // Move cursor to start of first new line
    context.setCursor(new CursorPosition(startLine, 0));

    // Enter insert mode
    context.setMode(VIM_MODE.INSERT);
  }

  /**
   * Execute change with a motion
   *
   * Called by the VimExecutor when a motion follows 'c'
   *
   * @param context - The execution context
   * @param from - Start position
   * @param to - End position from motion
   * @param inclusive - Whether the motion is inclusive (default false for exclusive)
   */
  executeChangeWithMotion(
    context: ExecutionContext,
    from: CursorPosition,
    to: CursorPosition,
    inclusive: boolean = false
  ): void {
    const buffer = context.getBuffer();

    if (buffer.isEmpty()) {
      context.setMode(VIM_MODE.INSERT);
      return;
    }

    // Ensure from is before to
    const [start, rawEnd] = this.comparePositions(from, to) <= 0 ? [from, to] : [to, from];

    // Adjust end position based on whether motion is inclusive or exclusive
    const end = inclusive
      ? this.adjustEndForInclusive(buffer, start, rawEnd)
      : rawEnd;

    // Store deleted text
    const deletedText = this.extractText(buffer, start, end);
    context.setRegister('"', deletedText);

    // Delete the text
    this.deleteText(buffer, start, end);

    // Move cursor to start position
    context.setCursor(new CursorPosition(start.line, start.column));

    // Enter insert mode
    context.setMode(VIM_MODE.INSERT);
  }

  /**
   * Adjust end position to make it inclusive (vim-style)
   *
   * @param buffer - The text buffer
   * @param start - Start position
   * @param end - Raw end position from motion
   * @returns Adjusted end position that includes the target character
   */
  private adjustEndForInclusive(
    buffer: TextBuffer,
    start: CursorPosition,
    end: CursorPosition
  ): CursorPosition {
    if (start.line === end.line) {
      // Same line: include the character at end position by adding 1 to column
      const line = buffer.getLine(end.line);
      if (line === null) return end;
      // Don't go past end of line
      const newColumn = Math.min(end.column + 1, line.length);
      return new CursorPosition(end.line, newColumn);
    } else {
      // Multi-line: include full last line by setting column to line length
      const line = buffer.getLine(end.line);
      if (line === null) return end;
      return new CursorPosition(end.line, line.length);
    }
  }

  /**
   * Compare two cursor positions
   *
   * @param a - First position
   * @param b - Second position
   * @returns negative if a < b, 0 if equal, positive if a > b
   */
  private comparePositions(a: CursorPosition, b: CursorPosition): number {
    if (a.line !== b.line) {
      return a.line - b.line;
    }
    return a.column - b.column;
  }

  /**
   * Extract text from buffer between two positions
   *
   * @param buffer - The text buffer
   * @param start - Start position
   * @param end - End position (exclusive for single line, inclusive line for multi-line)
   * @returns The extracted text
   */
  private extractText(buffer: TextBuffer, start: CursorPosition, end: CursorPosition): string {
    const lines: string[] = [];

    for (let line = start.line; line <= end.line; line++) {
      const lineContent = buffer.getLine(line);
      if (lineContent === null) continue;

      if (start.line === end.line) {
        // Single line
        lines.push(lineContent.slice(start.column, end.column));
      } else if (line === start.line) {
        // First line of multi-line
        lines.push(lineContent.slice(start.column));
      } else if (line === end.line) {
        // Last line of multi-line
        lines.push(lineContent.slice(0, end.column));
      } else {
        // Middle lines
        lines.push(lineContent);
      }
    }

    return lines.join('\n');
  }

  /**
   * Delete text from buffer between two positions
   *
   * @param buffer - The text buffer
   * @param start - Start position
   * @param end - End position
   */
  private deleteText(buffer: TextBuffer, start: CursorPosition, end: CursorPosition): void {
    if (start.line === end.line) {
      // Single line deletion
      const line = buffer.getLine(start.line);
      if (line === null) return;

      const newContent = line.slice(0, start.column) + line.slice(end.column);
      buffer.setLine(start.line, newContent);
    } else {
      // Multi-line deletion
      const startLine = buffer.getLine(start.line);
      const endLine = buffer.getLine(end.line);

      if (startLine === null || endLine === null) return;

      // Combine start of first line with end of last line
      const newContent = startLine.slice(0, start.column) + endLine.slice(end.column);
      buffer.setLine(start.line, newContent);

      // Delete middle lines and last line
      for (let line = end.line; line > start.line; line--) {
        buffer.deleteLine(line);
      }
    }
  }
}
