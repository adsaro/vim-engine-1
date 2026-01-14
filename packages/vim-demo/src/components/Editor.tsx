import { useRef, useEffect, useState, useCallback } from 'react';
import { useVim } from '../contexts/VimContext';
import { VIM_MODE } from '@vim-engine/core';
import { calculateCursorRect, calculateScrollToCursor, ViewportInfo } from '../utils/cursorHelpers';

const LINE_HEIGHT = 24;
const CHAR_WIDTH = 8.4; // Approximate monospace character width
const TEXTAREA_PADDING_LEFT = 8; // Padding on the textarea

export function Editor() {
  const { vimState, content, handleKeyDown } = useVim();
  const [viewportInfo, setViewportInfo] = useState<ViewportInfo>({
    scrollTop: 0,
    scrollLeft: 0,
    viewportHeight: 400,
    viewportWidth: 800,
    lineHeight: LINE_HEIGHT,
    charWidth: CHAR_WIDTH,
    paddingLeft: TEXTAREA_PADDING_LEFT,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);

  // Update viewport info on resize
  useEffect(() => {
    const updateViewport = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setViewportInfo((prev) => ({
          ...prev,
          viewportHeight: rect.height,
          viewportWidth: rect.width,
        }));
      }
    };

    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  // Calculate cursor position
  const cursorRect = calculateCursorRect(
    vimState.cursor.line,
    vimState.cursor.column,
    content,
    viewportInfo
  );

  // Scroll to cursor when it goes out of view
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      const scrollInfo = calculateScrollToCursor(
        vimState.cursor.line,
        vimState.cursor.column,
        viewportInfo
      );

      // Only auto-scroll if cursor is not visible
      if (textarea.scrollTop !== scrollInfo.scrollTop) {
        textarea.scrollTop = scrollInfo.scrollTop;
      }
      if (textarea.scrollLeft !== scrollInfo.scrollLeft) {
        textarea.scrollLeft = scrollInfo.scrollLeft;
      }
    }
  }, [vimState.cursor.line, vimState.cursor.column, viewportInfo.viewportHeight, viewportInfo.viewportWidth]);

  // Focus editor on click
  const handleContainerClick = useCallback(() => {
    textareaRef.current?.focus();
  }, []);

  // Update scroll position state
  const handleScroll = useCallback((event: React.UIEvent<HTMLTextAreaElement>) => {
    try {
      const target = event.currentTarget;
      if (target) {
        setViewportInfo((prev) => ({
          ...prev,
          scrollTop: target.scrollTop,
          scrollLeft: target.scrollLeft,
        }));
      }
    } catch (error) {
      // Ignore scroll errors (can happen during rapid cursor movements)
    }
  }, []);

  // Determine cursor style based on mode
  const getCursorStyle = () => {
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      width: `${CHAR_WIDTH}px`,
      height: `${LINE_HEIGHT}px`,
      top: `${cursorRect.top}px`,
      left: `${cursorRect.left}px`,
      transition: 'all 0.05s ease',
    };

    switch (vimState.mode) {
      case VIM_MODE.INSERT:
        return { ...baseStyle, backgroundColor: '#22c55e', opacity: 0.8 };
      case VIM_MODE.VISUAL:
        return { ...baseStyle, backgroundColor: '#a855f7', opacity: 0.8 };
      case VIM_MODE.COMMAND:
        return { ...baseStyle, backgroundColor: '#eab308', opacity: 0.8 };
      case VIM_MODE.REPLACE:
        return { ...baseStyle, backgroundColor: '#ef4444', opacity: 0.8 };
      case VIM_MODE.SELECT:
        return { ...baseStyle, backgroundColor: '#f97316', opacity: 0.8 };
      default:
        return { ...baseStyle, backgroundColor: '#3b82f6', opacity: 0.8 };
    }
  };

  // Calculate line numbers width
  const lineCount = vimState.buffer.getLineCount();
  const lineNumbersWidth = Math.max(40, String(lineCount).length * 12 + 20);

  return (
    <div
      ref={containerRef}
      className="flex-1 bg-gray-900 overflow-hidden relative"
      onClick={handleContainerClick}
    >
      {/* Line numbers */}
      <div
        className="absolute left-0 top-0 bottom-0 bg-gray-800 border-r border-gray-700 select-none overflow-hidden"
        style={{ width: `${lineNumbersWidth}px` }}
      >
        <div
          className="text-right pr-2 text-gray-500 text-sm font-mono"
          style={{
            paddingTop: `${viewportInfo.scrollTop}px`,
            lineHeight: `${LINE_HEIGHT}px`,
          }}
        >
          {Array.from({ length: lineCount }, (_, i) => (
            <div
              key={i}
              className={i === vimState.cursor.line ? 'text-gray-300' : ''}
              style={{ height: `${LINE_HEIGHT}px` }}
            >
              {i + 1}
            </div>
          ))}
        </div>
      </div>

      {/* Editor area with textarea and cursor overlay */}
      <div
        className="absolute"
        style={{ left: `${lineNumbersWidth}px`, right: 0, top: 0, bottom: 0 }}
      >
        {/* Textarea for input */}
        <textarea
          ref={textareaRef}
          value={content}
          onKeyDown={handleKeyDown}
          onScroll={handleScroll}
          readOnly
          className="w-full h-full bg-gray-900 text-gray-100 font-mono resize-none outline-none p-2 overflow-auto"
          style={{
            fontFamily: 'monospace',
            fontSize: '14px',
            lineHeight: `${LINE_HEIGHT}px`,
            paddingTop: `${viewportInfo.scrollTop}px`,
            paddingLeft: '8px',
            tabSize: 2,
          }}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
        />

        {/* Cursor overlay */}
        <div ref={cursorRef} style={getCursorStyle()} className="pointer-events-none" />
      </div>
    </div>
  );
}
