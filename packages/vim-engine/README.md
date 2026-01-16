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

## Search Movement Keybindings

The vim-engine provides comprehensive search movement functionality that allows you to quickly navigate through your document using pattern-based searching.

### Keybindings

| Key | Description | Example |
|-----|-------------|---------|
| `/pattern` | Search forward for pattern | `/function` searches for "function" |
| `?pattern` | Search backward for pattern | `?const` searches backward for "const" |
| `n` | Jump to next match | After searching, `n` goes to next occurrence |
| `N` | Jump to previous match | After searching, `N` goes to previous occurrence |
| `*` | Search for word under cursor | Cursor on "test", `*` searches for next "test" |

### Usage Examples

#### Forward Search

```typescript
// Search for "function" in the document
executor.handleKeystroke('/');
executor.handleKeystroke('f');
executor.handleKeystroke('u');
executor.handleKeystroke('n');
executor.handleKeystroke('c');
executor.handleKeystroke('t');
executor.handleKeystroke('i');
executor.handleKeystroke('o');
executor.handleKeystroke('n');
executor.handleKeystroke('Enter');
// Cursor moves to first occurrence of "function"
```

#### Backward Search

```typescript
// Search backward for "import"
executor.handleKeystroke('?');
executor.handleKeystroke('i');
executor.handleKeystroke('m');
executor.handleKeystroke('p');
executor.handleKeystroke('o');
executor.handleKeystroke('r');
executor.handleKeystroke('t');
executor.handleKeystroke('Enter');
// Cursor moves to previous occurrence of "import"
```

#### Navigate Between Matches

```typescript
// After performing a search
executor.handleKeystroke('n');  // Go to next match
executor.handleKeystroke('n');  // Go to next match again
executor.handleKeystroke('N');  // Go back to previous match
```

#### Search Word Under Cursor

```typescript
// Cursor is positioned on the word "example"
executor.handleKeystroke('*');
// Automatically searches for the next occurrence of "example"
```

### How Search Works

1. **Initiate Search**: Press `/` (forward) or `?` (backward) to start search input mode
2. **Enter Pattern**: Type your search pattern (supports regex patterns)
3. **Execute Search**: Press `Enter` to search for the pattern
4. **Navigate**: Use `n` for next match and `N` for previous match

### Key Features

- **Search History**: The engine maintains a history of your search patterns for quick access
- **Case-Sensitive**: Search is case-sensitive by default
- **Regex Support**: Search patterns support regular expressions for advanced matching
- **Direction Awareness**: Search direction is preserved between searches
- **Word Search**: The `*` key quickly searches for the word under the cursor

### Mode Support

Search movement commands work in the following modes:

- **NORMAL mode**: Full support for all search commands
- **VISUAL mode**: Full support for all search commands
- **SEARCH_INPUT mode**: Special mode for entering search patterns
- **INSERT mode**: Not supported (commands are ignored)
- **COMMAND mode**: Not supported (commands are ignored)

### Integration Notes

Search movement is implemented using the following components:

- [`SearchForwardPlugin`](./src/plugins/movement/search-forward/SearchForwardPlugin.ts) - Handles `/` key
- [`SearchBackwardPlugin`](./src/plugins/movement/search-backward/SearchBackwardPlugin.ts) - Handles `?` key
- [`SearchInputHandlerPlugin`](./src/plugins/movement/search-input/SearchInputHandlerPlugin.ts) - Manages search input
- [`SearchNextPlugin`](./src/plugins/movement/search-next/SearchNextPlugin.ts) - Handles `n` key
- [`SearchPrevPlugin`](./src/plugins/movement/search-prev/SearchPrevPlugin.ts) - Handles `N` key
- [`SearchWordUnderCursorPlugin`](./src/plugins/movement/search-word/SearchWordUnderCursorPlugin.ts) - Handles `*` key
- [`SearchInputManager`](./src/plugins/movement/utils/searchInputManager.ts) - Search state management
- [`searchUtils`](./src/plugins/movement/utils/searchUtils.ts) - Search utility functions

For detailed documentation on search movement implementation, see [`SEARCH_MOVEMENT.md`](./src/plugins/movement/SEARCH_MOVEMENT.md).

## Development

See the root `package.json` for available scripts.
