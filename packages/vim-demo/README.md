# @vim-engine/demo

A React application demonstrating the vim-engine core functionality with a full-featured vim-like editor interface.

## Features

- **Full Vim Mode Support**: Normal, Insert, Visual, Command, Replace, and Select modes
- **Vim-style Navigation**: h/j/k/l, w/b/e, gg/G, 0/$, and more
- **Mode Indicators**: Visual feedback for current mode with color-coded status bar
- **Command Palette**: Help modal showing all available keyboard shortcuts (press `?` to toggle)
- **Line Numbers**: Display line numbers with current line highlighting
- **Status Bar**: Shows current mode, cursor position, and file statistics
- **React Integration**: Clean integration with React using hooks and context

## Installation

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Run linting
pnpm lint
```

## Project Structure

```
packages/vim-demo/
├── src/
│   ├── components/
│   │   ├── Editor.tsx        # Main editor with cursor overlay
│   │   ├── StatusBar.tsx     # Status bar showing mode and position
│   │   ├── ModeIndicator.tsx # Mode badge components
│   │   └── CommandPalette.tsx # Help modal with keyboard shortcuts
│   ├── contexts/
│   │   └── VimContext.tsx    # React context for vim state
│   ├── hooks/
│   │   └── useVimEngine.ts   # Hook for integrating vim-engine
│   ├── utils/
│   │   └── cursorHelpers.ts  # Cursor position utilities
│   ├── App.tsx               # Root component
│   ├── main.tsx              # Entry point
│   └── index.css             # Tailwind styles
├── public/
│   └── vite.svg
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── postcss.config.js
```

## Keyboard Shortcuts

### Navigation

| Key | Description |
|-----|-------------|
| `h` | Move left |
| `j` | Move down |
| `k` | Move up |
| `l` | Move right |
| `w` | Move to next word |
| `b` | Move to previous word |
| `e` | Move to end of word |
| `0` | Move to beginning of line |
| `$` | Move to end of line |
| `gg` | Move to beginning of file |
| `G` | Move to end of file |

### Insert Mode

| Key | Description |
|-----|-------------|
| `i` | Insert before cursor |
| `I` | Insert at beginning of line |
| `a` | Insert after cursor |
| `A` | Insert at end of line |
| `o` | Open new line below |
| `O` | Open new line above |
| `Esc` | Return to normal mode |

### Visual Mode

| Key | Description |
|-----|-------------|
| `v` | Enter visual mode |
| `V` | Enter visual line mode |
| `Ctrl+v` | Enter visual block mode |
| `y` | Yank (copy) selected text |
| `d` | Delete selected text |
| `c` | Change selected text |
| `Esc` | Exit visual mode |

### Editing

| Key | Description |
|-----|-------------|
| `x` | Delete character under cursor |
| `X` | Delete character before cursor |
| `dd` | Delete current line |
| `yy` | Yank (copy) current line |
| `p` | Paste after cursor |
| `P` | Paste before cursor |
| `u` | Undo |
| `Ctrl+r` | Redo |

### Search

| Key | Description |
|-----|-------------|
| `/` | Search forward |
| `?` | Search backward |
| `n` | Next search match |
| `N` | Previous search match |

### Command Mode

| Key | Description |
|-----|-------------|
| `:` | Enter command mode |
| `:w` | Write (save) file |
| `:q` | Quit |
| `:wq` | Write and quit |
| `:q!` | Quit without saving |

## Mode Colors

| Mode | Color | Description |
|------|-------|-------------|
| Normal | Blue | Default navigation mode |
| Insert | Green | Text insertion mode |
| Visual | Purple | Text selection mode |
| Command | Yellow | Ex command mode |
| Replace | Red | Character replacement mode |
| Select | Orange | Selection mode |

## Dependencies

- **@vim-engine/core**: The core vim-engine library
- **react**: UI framework
- **react-dom**: React DOM rendering
- **@vitejs/plugin-react**: Vite React plugin
- **tailwindcss**: Utility-first CSS framework

## Development

```bash
# Start development server on port 3000
pnpm dev

# Run type checking
pnpm build

# Fix linting issues
pnpm lint:fix
```

## License

MIT
