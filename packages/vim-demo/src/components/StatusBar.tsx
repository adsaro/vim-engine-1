import { useVim } from '../contexts/VimContext';
import { VIM_MODE } from '@vim-engine/core';

export function StatusBar() {
  const { vimState, content } = useVim();

  const lineCount = vimState.buffer.getLineCount();
  const currentLine = vimState.cursor.line + 1;
  const currentColumn = vimState.cursor.column + 1;

  const getModeColor = () => {
    switch (vimState.mode) {
      case VIM_MODE.NORMAL:
        return 'bg-vim-normal text-white';
      case VIM_MODE.INSERT:
        return 'bg-vim-insert text-white';
      case VIM_MODE.VISUAL:
        return 'bg-vim-visual text-white';
      case VIM_MODE.COMMAND:
        return 'bg-vim-command text-black';
      case VIM_MODE.REPLACE:
        return 'bg-vim-replace text-white';
      case VIM_MODE.SELECT:
        return 'bg-vim-select text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  const getModeLabel = () => {
    switch (vimState.mode) {
      case VIM_MODE.NORMAL:
        return 'NORMAL';
      case VIM_MODE.INSERT:
        return 'INSERT';
      case VIM_MODE.VISUAL:
        return 'VISUAL';
      case VIM_MODE.COMMAND:
        return 'COMMAND';
      case VIM_MODE.REPLACE:
        return 'REPLACE';
      case VIM_MODE.SELECT:
        return 'SELECT';
      default:
        return vimState.mode.toUpperCase();
    }
  };

  return (
    <div className="bg-gray-800 border-t border-gray-700 px-4 py-1 flex items-center justify-between text-sm">
      <div className="flex items-center space-x-4">
        {/* Mode indicator */}
        <span className={`px-2 py-0.5 rounded ${getModeColor()}`}>{getModeLabel()}</span>

        {/* File info */}
        <span className="text-gray-400">
          {lineCount} line{lineCount !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="flex items-center space-x-6">
        {/* Cursor position */}
        <span className="text-gray-400">
          <span className="text-gray-200">{currentLine}</span>
          <span className="mx-1">,</span>
          <span className="text-gray-200">{currentColumn}</span>
        </span>

        {/* Character and byte count */}
        <span className="text-gray-500">
          {content.length} char{content.length !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
}
