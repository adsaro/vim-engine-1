/**
 * DeleteOperatorPlugin - Delete operator (d key)
 *
 * Implements the vim 'd' operator for deleting text with motions.
 * Supports motions like: dw (delete word), dd (delete line), d$ (delete to end), etc.
 * Works in operator-pending mode.
 *
 * @example
 * ```typescript
 * import { DeleteOperatorPlugin } from './operators/delete/DeleteOperatorPlugin';
 *
 * const plugin = new DeleteOperatorPlugin();
 * // Press 'd' then 'w' to delete a word
 * // Press 'd' then 'd' to delete a line
 * ```
 */
import { AbstractVimPlugin } from '../../../plugin/AbstractVimPlugin';
import { ExecutionContext } from '../../../plugin/ExecutionContext';
import { VimMode, VIM_MODE } from '../../../state/VimMode';
import { CursorPosition } from '../../../state/CursorPosition';
import { TextBuffer } from '../../../state/TextBuffer';

/**
 * DeleteOperatorPlugin - Delete text with motions
 *
 * The 'd' operator in vim is used with motions to delete text.
 * When 'd' is pressed, it enters operator-pending mode and waits for a motion.
 */
export class DeleteOperatorPlugin extends AbstractVimPlugin {
  /**
   * Plugin name
   */
  readonly name = 'operator-delete';

  /**
   * Plugin version
   */
  readonly version = '1.0.0';

  /**
   * Plugin description
   */
  readonly description = 'Delete operator (d key)';

  /**
   * Keystroke patterns handled by this plugin
   * 'd' starts the operator, 'dd' is a special case for delete line
   */
  readonly patterns = ['d', 'dd'];

  /**
   * Modes this plugin is active in
   */
  readonly modes: VimMode[] = [VIM_MODE.NORMAL, VIM_MODE.OPERATOR_PENDING];

  /**
   * Create a new DeleteOperatorPlugin
   */
  constructor() {
    super(
      'operator-delete',
      'Delete operator (d key)',
      ['d', 'dd'],
      [VIM_MODE.NORMAL, VIM_MODE.OPERATOR_PENDING]
    );
  }

  /**
   * Perform the delete action
   *
   * If in NORMAL mode, enters OPERATOR_PENDING mode.
   * If in OPERATOR_PENDING mode (second 'd'), deletes current line.
   *
   * @param context - The execution context
   */
  protected performAction(context: ExecutionContext): void {
    const currentMode = context.getMode();
    const pattern = context.getCurrentPattern();

    if (currentMode === VIM_MODE.NORMAL) {
      if (pattern === 'dd') {
        // Special case: 'dd' deletes the current line immediately
        this.deleteLine(context);
      } else {
        // Enter operator-pending mode, waiting for motion
        context.setMode(VIM_MODE.OPERATOR_PENDING);
        context.getState().setPendingOperator('d');
      }
    } else if (currentMode === VIM_MODE.OPERATOR_PENDING) {
      // Second 'd' in operator-pending mode means delete line
      this.deleteLine(context);
      // Return to normal mode
      context.setMode(VIM_MODE.NORMAL);
      context.getState().setPendingOperator(null);
    }
  }

  /**
   * Delete the current line
   *
   * @param context - The execution context
   */
  private deleteLine(context: ExecutionContext): void {
    const buffer = context.getBuffer();
    const cursor = context.getCursor();
    const count = context.getCount();

    if (buffer.isEmpty()) {
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

    // Adjust cursor position if needed
    if (buffer.isEmpty()) {
      // Buffer is now empty, cursor stays at 0,0
      context.setCursor(new CursorPosition(0, 0));
    } else if (startLine >= buffer.getLineCount()) {
      // Deleted last line(s), move cursor up
      const newLine = buffer.getLineCount() - 1;
      context.setCursor(new CursorPosition(newLine, 0));
    } else {
      // Cursor stays at start of where deleted lines were
      context.setCursor(new CursorPosition(startLine, 0));
    }
  }

  /**
   * Execute delete with a motion
   *
   * Called by the VimExecutor when a motion follows 'd'
   *
   * @param context - The execution context
   * @param from - Start position
   * @param to - End position (exclusive)
   */
  executeDeleteWithMotion(context: ExecutionContext, from: CursorPosition, to: CursorPosition): void {
    const buffer = context.getBuffer();

    if (buffer.isEmpty()) {
      return;
    }

    // Ensure from is before to
    const [start, end] = this.comparePositions(from, to) <= 0 ? [from, to] : [to, from];

    // Store deleted text
    const deletedText = this.extractText(buffer, start, end);
    context.setRegister('"', deletedText);

    // Delete the text
    this.deleteText(buffer, start, end);

    // Move cursor to start position
    context.setCursor(new CursorPosition(start.line, start.column));
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
