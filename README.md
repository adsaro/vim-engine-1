# vim-engine

A TypeScript-based Vim emulation engine with a React demo application. This is a monorepo containing the core vim-engine library and a full-featured demo application.

## Packages

This workspace contains two packages:

- [**vim-engine**](packages/vim-engine/) - The core Vim emulation engine
- [**vim-demo**](packages/vim-demo/) - A React application demonstrating vim-engine

## Features

### Core Engine (`vim-engine`)

- **Plugin-based Architecture**: Extensible plugin system for adding new commands and behaviors
- **Comprehensive State Management**: Text buffer, cursor position, vim modes, and undo/redo history
- **Input Handling**: Robust keyboard event processing with support for vim-style key sequences
- **Dependency Injection**: Clean separation of concerns with a DI container
- **Full Test Suite**: Unit tests, integration tests, and performance benchmarks

### Demo Application (`vim-demo`)

- **Full Vim Mode Support**: Normal, Insert, Visual, Command, Replace, and Select modes
- **Vim-style Navigation**: h/j/k/l, w/b/e, gg/G, 0/$, and more
- **Mode Indicators**: Visual feedback for current mode with color-coded status bar
- **Command Palette**: Help modal showing all available keyboard shortcuts
- **Line Numbers**: Display line numbers with current line highlighting
- **Status Bar**: Shows current mode, cursor position, and file statistics

## Quick Start

```bash
# Install dependencies
pnpm install

# Run development server (demo app)
pnpm dev

# Build all packages
pnpm build

# Run tests
pnpm test

# Format code
pnpm format
```

## Project Structure

```
vim-engine/
├── packages/
│   ├── vim-engine/          # Core vim engine library
│   │   ├── src/
│   │   │   ├── config/      # Configuration and keyboard mapping
│   │   │   ├── core/        # Core engine components
│   │   │   ├── di/          # Dependency injection container
│   │   │   ├── input/       # Input handling
│   │   │   ├── plugin/      # Plugin system
│   │   │   ├── plugins/     # Built-in plugins (movement)
│   │   │   ├── state/       # State management
│   │   │   └── index.ts     # Library entry point
│   │   ├── tests/           # Test files
│   │   ├── package.json
│   │   └── vite.config.ts
│   │
│   └── vim-demo/            # React demo application
│       ├── src/
│       │   ├── components/  # React components
│       │   ├── contexts/    # React contexts
│       │   ├── hooks/       # Custom hooks
│       │   └── utils/       # Utilities
│       ├── package.json
│       └── vite.config.ts
│
├── package.json             # Root package.json (monorepo config)
├── pnpm-workspace.yaml      # pnpm workspace config
└── vite.config.ts           # Root vite config
```

## Supported Vim Motions

| Key  | Description                  |
| ---- | ---------------------------- |
| `h`  | Move left                    |
| `j`  | Move down                    |
| `k`  | Move up                      |
| `l`  | Move right                   |
| `w`  | Move to next word            |
| `b`  | Move to previous word        |
| `e`  | Move to end of word          |
| `ge` | Move to end of previous word |
| `0`  | Move to beginning of line    |
| `$`  | Move to end of line          |
| `gg` | Move to beginning of file    |
| `G`  | Move to end of file          |

## Supported Modes

| Mode    | Color  | Description                |
| ------- | ------ | -------------------------- |
| Normal  | Blue   | Default navigation mode    |
| Insert  | Green  | Text insertion mode        |
| Visual  | Purple | Text selection mode        |
| Command | Yellow | Ex command mode            |
| Replace | Red    | Character replacement mode |
| Select  | Orange | Selection mode             |

## Development

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode (vim-engine only)
cd packages/vim-engine && pnpm test:watch
```

### Building

```bash
# Build all packages
pnpm build

# Build specific package
cd packages/vim-engine && pnpm build
```

### Code Formatting

```bash
# Format code
pnpm format

# Check formatting
pnpm format:check
```

## Technologies

- **TypeScript**: Primary language
- **Vite**: Build tool and dev server
- **React**: UI framework (demo app)
- **TailwindCSS**: Styling (demo app)
- **pnpm**: Package manager
- **Turbo**: Build orchestration
- **Vitest**: Testing framework

## License

MIT
