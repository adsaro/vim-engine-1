/**
 * DCapitalDeletePlugin - Delete to end of line (D key - capital)
 *
 * Implements the vim 'D' command for deleting from cursor to end of line.
 * Equivalent to 'd$' but works immediately without entering operator-pending mode.
 * Supports numeric prefix (e.g., '3D' deletes to end of line 3 lines down).
 *
 * @example
 * ```typescript
 * import { DCapitalDeletePlugin } from './operators/D-capital/DCapitalDeletePlugin';
 *
 * const plugin = new DCapitalDeletePlugin();
 * // Press 'D' to delete from cursor to end of line
 * // Press '3D' to delete to end of line on line 3 lines down
 * ```
 */
import { AbstractVimPlugin } from '../../../plugin/AbstractVimPlugin';
import { ExecutionContext } from '../../../plugin/ExecutionContext';
import { VimMode, VIM_MODE } from '../../../state/VimMode';
import { CursorPosition } from '../../../state/CursorPosition';

/**
 * DCapitalDeletePlugin - Deletes from cursor to end of line
 *
 * The 'D' key (Shift+d) in vim normal mode deletes from the cursor position
 * to the end of the current line. If a count is provided (e.g., '3D'), it moves
 * down (count - 1) lines first, then deletes to end of that line.
 */
export class DCapitalDeletePlugin extends AbstractVimPlugin {
  /**
   * Plugin name
   */
  readonly name = 'operator-D-capital';

  /**
   * Plugin version
   */
  readonly version = '1.0.0';

  /**
   * Plugin description
   */
  readonly description = 'Delete to end of line (D key - capital)';

  /**
   * Keystroke patterns handled by this plugin
   */
  readonly patterns = ['D'];

  /**
   * Modes this plugin is active in
   */
  readonly modes: VimMode[] = [VIM_MODE.NORMAL, VIM_MODE.VISUAL];

  /**
   * Create a new DCapitalDeletePlugin
   */
  constructor() {
    super(
      'operator-D-capital',
      'Delete to end of line (D key - capital)',
      ['D'],
      [VIM_MODE.NORMAL, VIM_MODE.VISUAL]
    );
  }

  /**
   * Perform the delete action
   *
   * Deletes from cursor position to end of line.
   * If count is set (e.g., '3D'), moves down (count - 1) lines first.
   * The deleted text is stored in the unnamed register.
   *
   * @param context - The execution context
   */
  protected performAction(context: ExecutionContext): void {
    const buffer = context.getBuffer();
    const cursor = context.getCursor();
    const count = context.getCount() || 1;

    // Don't do anything if buffer is empty
    if (buffer.isEmpty()) {
      return;
    }

    // Calculate target line (move down count - 1 lines)
    const targetLine = Math.min(cursor.line + count - 1, buffer.getLineCount() - 1);
    const line = buffer.getLine(targetLine);
    if (line === null) {
      return;
    }

    // Determine start and end positions
    const startLine = cursor.line;
    const startColumn = cursor.column;
    const endLine = targetLine;
    const endColumn = line.length;

    // Store deleted text
    const deletedText = this.extractText(buffer, startLine, startColumn, endLine, endColumn);
    context.setRegister('"', deletedText);

    // Delete the text
    this.deleteText(buffer, startLine, startColumn, endLine, endColumn);

    // Move cursor to start position (it may have moved if we deleted across lines)
    context.setCursor(new CursorPosition(startLine, startColumn));
  }

  /**
   * Extract text from buffer between two positions
   *
   * @param buffer - The text buffer
   * @param startLine - Start line index
   * @param startColumn - Start column index
   * @param endLine - End line index
   * @param endColumn - End column index (exclusive)
   * @returns The extracted text
   */
  private extractText(
    buffer: ReturnType<ExecutionContext['getBuffer']>,
    startLine: number,
    startColumn: number,
    endLine: number,
    endColumn: number
  ): string {
    const lines: string[] = [];

    for (let line = startLine; line <= endLine; line++) {
      const lineContent = buffer.getLine(line);
      if (lineContent === null) continue;

      if (startLine === endLine) {
        // Single line
        lines.push(lineContent.slice(startColumn, endColumn));
      } else if (line === startLine) {
        // First line of multi-line
        lines.push(lineContent.slice(startColumn));
      } else if (line === endLine) {
        // Last line of multi-line
        lines.push(lineContent.slice(0, endColumn));
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
   * @param startLine - Start line index
   * @param startColumn - Start column index
   * @param endLine - End line index
   * @param endColumn - End column index (exclusive)
   */
  private deleteText(
    buffer: ReturnType<ExecutionContext['getBuffer']>,
    startLine: number,
    startColumn: number,
    endLine: number,
    endColumn: number
  ): void {
    if (startLine === endLine) {
      // Single line deletion
      const line = buffer.getLine(startLine);
      if (line === null) return;

      const newContent = line.slice(0, startColumn) + line.slice(endColumn);
      buffer.setLine(startLine, newContent);
    } else {
      // Multi-line deletion
      const startLineContent = buffer.getLine(startLine);
      const endLineContent = buffer.getLine(endLine);

      if (startLineContent === null || endLineContent === null) return;

      // Combine start of first line with end of last line
      const newContent = startLineContent.slice(0, startColumn) + endLineContent.slice(endColumn);
      buffer.setLine(startLine, newContent);

      // Delete middle lines and last line
      for (let line = endLine; line > startLine; line--) {
        buffer.deleteLine(line);
      }
    }
  }
}
