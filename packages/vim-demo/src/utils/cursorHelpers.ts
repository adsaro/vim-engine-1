/**
 * Cursor position utilities for the vim-demo React application.
 * These helpers calculate visual cursor positions from vim-engine cursor positions.
 */

export interface CursorRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface ViewportInfo {
  scrollTop: number;
  scrollLeft: number;
  viewportHeight: number;
  viewportWidth: number;
  lineHeight: number;
  charWidth: number;
}

/**
 * Calculate the visual rectangle for a cursor position.
 * 
 * @param line - 0-indexed line number
 * @param column - 0-indexed column number
 * @param content - The full content string
 * @param viewportInfo - Viewport information for calculations
 * @returns Cursor rectangle with position and dimensions
 */
export function calculateCursorRect(
  line: number,
  column: number,
  content: string,
  viewportInfo: ViewportInfo
): CursorRect {
  const lines = content.split('\n');
  const lineText = lines[line] || '';
  const charCount = Math.min(column, lineText.length);
  
  // Calculate position
  const top = (line * viewportInfo.lineHeight) - viewportInfo.scrollTop;
  const left = (charCount * viewportInfo.charWidth) - viewportInfo.scrollLeft;
  
  return {
    top: Math.max(0, top),
    left: Math.max(0, left),
    width: viewportInfo.charWidth,
    height: viewportInfo.lineHeight,
  };
}

/**
 * Check if a cursor position is visible within the viewport.
 */
export function isCursorVisible(
  line: number,
  column: number,
  viewportInfo: ViewportInfo
): boolean {
  const top = (line * viewportInfo.lineHeight) - viewportInfo.scrollTop;
  const left = (column * viewportInfo.charWidth) - viewportInfo.scrollLeft;
  
  return (
    top >= 0 &&
    top < viewportInfo.viewportHeight &&
    left >= 0 &&
    left < viewportInfo.viewportWidth
  );
}

/**
 * Calculate the scroll position needed to make a cursor visible.
 */
export function calculateScrollToCursor(
  line: number,
  column: number,
  viewportInfo: ViewportInfo
): { scrollTop: number; scrollLeft: number } {
  const desiredTop = line * viewportInfo.lineHeight;
  const desiredLeft = column * viewportInfo.charWidth;
  
  // Keep cursor centered vertically with some padding
  const paddingLines = 3;
  const scrollTop = Math.max(
    0,
    desiredTop - (paddingLines * viewportInfo.lineHeight)
  );
  
  // Keep cursor centered horizontally with some padding
  const paddingChars = 5;
  const scrollLeft = Math.max(
    0,
    desiredLeft - (paddingChars * viewportInfo.charWidth)
  );
  
  return { scrollTop, scrollLeft };
}

/**
 * Convert a zero-indexed line/column to a character offset.
 */
export function lineColumnToOffset(
  line: number,
  column: number,
  content: string
): number {
  const lines = content.split('\n');
  let offset = 0;
  
  for (let i = 0; i < line && i < lines.length; i++) {
    offset += lines[i].length + 1; // +1 for newline
  }
  
  if (line < lines.length) {
    offset += Math.min(column, lines[line].length);
  }
  
  return offset;
}

/**
 * Convert a character offset to zero-indexed line/column.
 */
export function offsetToLineColumn(offset: number, content: string): { line: number; column: number } {
  const lines = content.split('\n');
  let currentOffset = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const lineLength = lines[i].length + 1; // +1 for newline
    
    if (currentOffset + lineLength > offset) {
      return {
        line: i,
        column: Math.min(offset - currentOffset, lines[i].length),
      };
    }
    
    currentOffset += lineLength;
  }
  
  // If offset is beyond content, return end position
  return {
    line: lines.length - 1,
    column: lines[lines.length - 1]?.length || 0,
  };
}

/**
 * Get the line number from a character offset.
 */
export function getLineFromOffset(offset: number, content: string): number {
  const lines = content.split('\n');
  let currentOffset = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const lineLength = lines[i].length + 1;
    
    if (currentOffset + lineLength > offset) {
      return i;
    }
    
    currentOffset += lineLength;
  }
  
  return lines.length - 1;
}

/**
 * Get the column number from a character offset within a specific line.
 */
export function getColumnFromOffset(line: number, offset: number, content: string): number {
  const lines = content.split('\n');
  const lineText = lines[line] || '';
  return Math.min(offset, lineText.length);
}
