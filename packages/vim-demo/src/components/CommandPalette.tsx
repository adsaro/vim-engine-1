import { useState, useEffect, useCallback } from 'react';
import { useVim } from '../contexts/VimContext';
import { VIM_MODE, VimMode } from '@vim-engine/core';
import { ModeBadge } from './ModeIndicator';

interface CommandGroup {
  name: string;
  commands: { key: string; description: string; mode?: string }[];
}

const COMMAND_GROUPS: CommandGroup[] = [
  {
    name: 'Navigation',
    commands: [
      { key: 'h', description: 'Move left' },
      { key: 'j', description: 'Move down' },
      { key: 'k', description: 'Move up' },
      { key: 'l', description: 'Move right' },
      { key: 'w', description: 'Move to next word' },
      { key: 'b', description: 'Move to previous word' },
      { key: 'e', description: 'Move to end of word' },
      { key: '0', description: 'Move to beginning of line' },
      { key: '$', description: 'Move to end of line' },
      { key: 'gg', description: 'Move to beginning of file' },
      { key: 'G', description: 'Move to end of file' },
    ],
  },
  {
    name: 'Insert Mode',
    commands: [
      { key: 'i', description: 'Insert before cursor', mode: 'INSERT' },
      { key: 'I', description: 'Insert at beginning of line', mode: 'INSERT' },
      { key: 'a', description: 'Insert after cursor', mode: 'INSERT' },
      { key: 'A', description: 'Insert at end of line', mode: 'INSERT' },
      { key: 'o', description: 'Open new line below', mode: 'INSERT' },
      { key: 'O', description: 'Open new line above', mode: 'INSERT' },
      { key: '<Esc>', description: 'Return to normal mode', mode: 'NORMAL' },
    ],
  },
  {
    name: 'Visual Mode',
    commands: [
      { key: 'v', description: 'Enter visual mode', mode: 'VISUAL' },
      { key: 'V', description: 'Enter visual line mode', mode: 'VISUAL' },
      { key: 'Ctrl+v', description: 'Enter visual block mode', mode: 'VISUAL' },
      { key: 'y', description: 'Yank (copy) selected text' },
      { key: 'd', description: 'Delete selected text' },
      { key: 'c', description: 'Change selected text' },
      { key: '<Esc>', description: 'Exit visual mode', mode: 'NORMAL' },
    ],
  },
  {
    name: 'Editing',
    commands: [
      { key: 'x', description: 'Delete character under cursor' },
      { key: 'X', description: 'Delete character before cursor' },
      { key: 'dd', description: 'Delete current line' },
      { key: 'yy', description: 'Yank (copy) current line' },
      { key: 'p', description: 'Paste after cursor' },
      { key: 'P', description: 'Paste before cursor' },
      { key: 'u', description: 'Undo' },
      { key: 'Ctrl+r', description: 'Redo' },
    ],
  },
  {
    name: 'Search',
    commands: [
      { key: '/', description: 'Search forward', mode: 'COMMAND' },
      { key: '?', description: 'Search backward', mode: 'COMMAND' },
      { key: 'n', description: 'Next search match' },
      { key: 'N', description: 'Previous search match' },
    ],
  },
  {
    name: 'Command Mode',
    commands: [
      { key: ':', description: 'Enter command mode', mode: 'COMMAND' },
      { key: ':w', description: 'Write (save) file' },
      { key: ':q', description: 'Quit' },
      { key: ':wq', description: 'Write and quit' },
      { key: ':q!', description: 'Quit without saving' },
      { key: '<Enter>', description: 'Execute command', mode: 'COMMAND' },
      { key: '<Esc>', description: 'Cancel command', mode: 'NORMAL' },
    ],
  },
];

export function CommandPalette() {
  const { vimState, handleKeystroke } = useVim();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // Toggle with ? key
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === '?' && !event.ctrlKey && !event.metaKey) {
        // Only toggle if not in insert mode
        if (vimState.mode !== VIM_MODE.INSERT) {
          event.preventDefault();
          setIsOpen((prev) => !prev);
        }
      }
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    },
    [vimState.mode]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1.5 rounded text-sm"
        >
          ?
        </button>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gray-900 px-4 py-3 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">VIM Engine - Keyboard Shortcuts</h2>
          <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          {COMMAND_GROUPS.map((group, index) => (
            <button
              key={group.name}
              onClick={() => setActiveTab(index)}
              className={`px-4 py-2 text-sm ${
                activeTab === index
                  ? 'bg-gray-700 text-white border-b-2 border-vim-normal'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              {group.name}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          <div className="space-y-6">
            {COMMAND_GROUPS.map((group, groupIndex) => (
              <div key={group.name} className={groupIndex === activeTab ? '' : 'hidden'}>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  {group.name}
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {group.commands.map((cmd, cmdIndex) => (
                    <div
                      key={`${cmd.key}-${cmdIndex}`}
                      className="flex items-center justify-between py-2 px-3 bg-gray-700/30 rounded"
                    >
                      <div className="flex items-center space-x-3">
                        <kbd className="bg-gray-700 text-gray-200 px-2 py-0.5 rounded text-sm font-mono min-w-[3rem] text-center">
                          {cmd.key}
                        </kbd>
                        <span className="text-gray-300">{cmd.description}</span>
                      </div>
                      {cmd.mode && <ModeBadge mode={cmd.mode as VimMode} />}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-900 px-4 py-2 border-t border-gray-700 text-xs text-gray-500 flex items-center justify-between">
          <span>
            Press <kbd className="bg-gray-700 px-1 rounded">?</kbd> to toggle this help
          </span>
          <span>
            Press <kbd className="bg-gray-700 px-1 rounded">Esc</kbd> to close
          </span>
        </div>
      </div>
    </div>
  );
}
