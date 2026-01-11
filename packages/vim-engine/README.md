# vim-engine

A TypeScript-based vim emulation engine that provides vi-like keybindings and modal editing functionality.

## Installation

```bash
npm install vim-engine
```

## Usage

```typescript
import { VimEngine } from 'vim-engine';

const editor = new VimEngine({
  // configuration options
});
```

## Package Structure

- `src/` - Source code
  - `config/` - Configuration and keyboard mapping
  - `core/` - Core engine components (CommandRouter, VimExecutor, etc.)
  - `di/` - Dependency injection container
  - `input/` - Input handling (KeyboardEventNormalizer, KeystrokeProcessor)
  - `plugin/` - Plugin system (AbstractVimPlugin, PluginRegistry)
  - `plugins/` - Built-in plugins (movement, etc.)
  - `state/` - State management (TextBuffer, VimState, history)
- `tests/` - Test files

## Development

See the root `package.json` for available scripts.
