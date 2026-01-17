import { VimMode, VIM_MODE } from '@vim-engine/core';

interface ModeIndicatorProps {
  mode: VimMode;
  size?: 'sm' | 'md' | 'lg';
}

export function ModeIndicator({ mode, size = 'md' }: ModeIndicatorProps) {
  const getModeConfig = () => {
    switch (mode) {
      case VIM_MODE.NORMAL:
        return {
          label: 'NORMAL',
          color: 'bg-vim-normal',
          textColor: 'text-vim-normal',
          borderColor: 'border-vim-normal',
        };
      case VIM_MODE.INSERT:
        return {
          label: 'INSERT',
          color: 'bg-vim-insert',
          textColor: 'text-vim-insert',
          borderColor: 'border-vim-insert',
        };
      case VIM_MODE.VISUAL:
        return {
          label: 'VISUAL',
          color: 'bg-vim-visual',
          textColor: 'text-vim-visual',
          borderColor: 'border-vim-visual',
        };
      case VIM_MODE.COMMAND:
        return {
          label: 'COMMAND',
          color: 'bg-vim-command',
          textColor: 'text-vim-command',
          borderColor: 'border-vim-command',
        };
      case VIM_MODE.REPLACE:
        return {
          label: 'REPLACE',
          color: 'bg-vim-replace',
          textColor: 'text-vim-replace',
          borderColor: 'border-vim-replace',
        };
      case VIM_MODE.SELECT:
        return {
          label: 'SELECT',
          color: 'bg-vim-select',
          textColor: 'text-vim-select',
          borderColor: 'border-vim-select',
        };
      case VIM_MODE.SEARCH:
        return {
          label: 'SEARCH',
          color: 'bg-vim-search',
          textColor: 'text-vim-search',
          borderColor: 'border-vim-search',
        };
      default:
        return {
          label: mode.toUpperCase(),
          color: 'bg-gray-500',
          textColor: 'text-gray-500',
          borderColor: 'border-gray-500',
        };
    }
  };

  const config = getModeConfig();

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <div className="flex items-center space-x-2">
      <span
        className={`inline-flex items-center justify-center rounded font-mono font-semibold ${config.color} ${sizeClasses[size]}`}
      >
        {config.label}
      </span>
    </div>
  );
}

// Mode badge for help dialogs
export function ModeBadge({ mode }: { mode: VimMode }) {
  const getConfig = (m: VimMode) => {
    switch (m) {
      case VIM_MODE.NORMAL:
        return { label: 'N', color: 'bg-vim-normal' };
      case VIM_MODE.INSERT:
        return { label: 'I', color: 'bg-vim-insert' };
      case VIM_MODE.VISUAL:
        return { label: 'V', color: 'bg-vim-visual' };
      case VIM_MODE.COMMAND:
        return { label: ':', color: 'bg-vim-command' };
      case VIM_MODE.REPLACE:
        return { label: 'R', color: 'bg-vim-replace' };
      case VIM_MODE.SELECT:
        return { label: 'S', color: 'bg-vim-select' };
      case VIM_MODE.SEARCH:
        return { label: '/', color: 'bg-vim-search' };
      default:
        return { label: '?', color: 'bg-gray-500' };
    }
  };

  const { label, color } = getConfig(mode);

  return (
    <span
      className={`inline-flex items-center justify-center w-6 h-6 rounded text-white text-xs font-mono font-bold ${color}`}
    >
      {label}
    </span>
  );
}
