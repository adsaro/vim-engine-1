# Line Movement Plugins

## Overview

Line movement plugins provide commands to move the cursor to specific positions on the current line. These are essential Vim navigation commands that allow quick movement to key positions within a line.

## Available Commands

| Key | Plugin Name | Action | Description |
|------|--------------|--------|-------------|
| `0` | ZeroMovementPlugin | Move to start of line | Moves to column 0 (absolute start of line) |
| `^` | CaretMovementPlugin | Move to first non-blank | Moves to first non-whitespace character |
| `$` | DollarMovementPlugin | Move to end of line | Moves to last character of line |
| `g_` | GUnderscoreMovementPlugin | Move to last non-blank | Moves to last non-whitespace character |

## Usage Examples

### 0 - Move to Start of Line

Moves the cursor to column 0 (absolute start of line), regardless of indentation.

```typescript
// Before: "    hello world" with cursor at column 8 (on 'w')
// After:  "    hello world" with cursor at column 0 (on space)

executor.handleKeystroke('0');
```

**Key characteristics:**
- Always moves to column 0
- Ignores indentation
- Works on empty lines (stays at column 0)

### ^ - Move to First Non-Blank

Moves the cursor to the first non-whitespace character on the line.

```typescript
// Before: "    hello world" with cursor at column 8 (on 'w')
// After:  "    hello world" with cursor at column 4 (on 'h')

executor.handleKeystroke('^');
```

**Key characteristics:**
- Skips leading spaces and tabs
- Stays at column 0 if line is empty or whitespace-only
- Useful for navigating code with consistent indentation

### $ - Move to End of Line

Moves the cursor to the very last character of the line, including trailing whitespace.

```typescript
// Before: "hello world    " with cursor at column 0 (on 'h')
// After:  "hello world    " with cursor at column 14 (on space)

executor.handleKeystroke('$');
```

**Key characteristics:**
- Moves to last character (line.length - 1)
- Includes trailing whitespace
- Stays at column 0 if line is empty

### g_ - Move to Last Non-Blank

Moves the cursor to the last non-whitespace character of the line.

```typescript
// Before: "hello world    " with cursor at column 0 (on 'h')
// After:  "hello world    " with cursor at column 10 (on 'd')

executor.handleKeystroke('g_');
```

**Key characteristics:**
- Moves to last non-whitespace character
- Excludes trailing spaces and tabs
- Stays at column 0 if line is empty or whitespace-only

## Count-Based Movements

All line movement commands support count prefixes. A count moves the cursor down (count - 1) lines, then applies the line movement.

### Examples

```typescript
// Move to start of line 3 lines down
executor.handleKeystroke('30');
// Equivalent to: jjj0 (move down 3 lines, then to start)

// Move to first non-whitespace on line 5 lines down
executor.handleKeystroke('5^');
// Equivalent to: jjjj^

// Move to end of line 2 lines down
executor.handleKeystroke('2$');
// Equivalent to: j$

// Move to last non-whitespace on line 4 lines down
executor.handleKeystroke('4g_');
// Equivalent to: jjjg_
```

### Count Behavior

- `count 1`: No line movement, just apply the line movement to current line
- `count > 1`: Move down (count - 1) lines, then apply the line movement
- Count is clamped to buffer bounds (won't move past the last line)

## Mode Support

All line movement commands work in the following modes:

- **NORMAL mode**: Full support
- **VISUAL mode**: Full support (extends/updates selection)
- **INSERT mode**: Not supported (commands are ignored)
- **COMMAND mode**: Not supported (commands are ignored)

## Edge Cases

### Empty Lines

- `0`: Stays at column 0
- `^`: Stays at column 0
- `$`: Stays at column 0
- `g_`: Stays at column 0

### Whitespace-Only Lines

- `0`: Moves to column 0
- `^`: Stays at column 0 (no non-whitespace to find)
- `$`: Moves to last whitespace character
- `g_`: Stays at column 0 (no non-whitespace to find)

### Single Character Lines

- `0`: Moves to column 0
- `^`: Moves to column 0 (first character is non-whitespace)
- `$`: Moves to column 0 (last character is at position 0)
- `g_`: Moves to column 0 (last character is non-whitespace)

### Empty Buffer

All commands handle empty buffers gracefully and keep the cursor at (0, 0).

## Integration with Other Movements

Line movements can be combined with other movement commands for efficient navigation:

```typescript
// Navigate to start, then move right
executor.handleKeystroke('0l');

// Navigate to first non-whitespace, then move right
executor.handleKeystroke('^l');

// Navigate to end, then move left
executor.handleKeystroke('$h');

// Navigate to last non-whitespace, then move left
executor.handleKeystroke('g_h');
```

### Combining with Vertical Movements

```typescript
// Move down, then to start of line
executor.handleKeystroke('j0');

// Move down, then to first non-whitespace
executor.handleKeystroke('j^');

// Move up, then to end of line
executor.handleKeystroke('k$');
```

## Visual Mode

In VISUAL mode, line movements update the selection by moving the cursor to the target position:

```typescript
// Enter visual mode and select to end of line
executor.handleKeystroke('v$');

// Enter visual mode and select to start of line
executor.handleKeystroke('v0');
```

## Comparison with Similar Commands

| Command | Target | Includes Trailing Whitespace? | Includes Leading Whitespace? |
|----------|---------|------------------------------|------------------------------|
| `0` | Column 0 | N/A | Yes |
| `^` | First non-whitespace | N/A | No |
| `$` | Last character | Yes | N/A |
| `g_` | Last non-whitespace | No | N/A |

## Performance Considerations

Line movements are highly efficient operations:

- **Time Complexity**: O(1) for basic movements, O(n) for count-based movements where n is the count
- **Space Complexity**: O(1)
- No buffer modifications
- No history operations

## Best Practices

1. **Use `^` for code navigation**: When working with indented code, `^` is often more useful than `0` as it skips indentation.

2. **Use `g_` instead of `$` for text editing**: When editing text, `g_` is often preferred as it excludes trailing whitespace.

3. **Combine with counts for multi-line operations**: Use counts to quickly navigate across multiple lines (e.g., `3$` to go to the end of the third line down).

4. **Use in VISUAL mode for selections**: Line movements in VISUAL mode are excellent for quickly selecting lines or portions of lines.

## Common Patterns

### Navigate to function start
```typescript
// Assuming cursor is somewhere in a function body
executor.handleKeystroke('^');  // Go to start of current line
```

### Navigate to end of statement
```typescript
executor.handleKeystroke('$');  // Go to end of current line
```

### Clean trailing whitespace
```typescript
executor.handleKeystroke('g_');  // Go to last non-whitespace
executor.handleKeystroke('d$');   // Delete to end (removes trailing whitespace)
```

### Select entire line
```typescript
executor.handleKeystroke('v$');  // Enter visual mode and select to end
```

## Implementation Details

All line movement plugins extend the [`LineMovementPlugin`](./base/LineMovementPlugin.ts) base class, which provides:

- Common line retrieval and validation logic
- Column position calculation template method
- Count-based movement handling
- Edge case handling (empty lines, whitespace-only lines, empty buffer)

Each plugin implements the abstract [`calculateLinePosition()`](./base/LineMovementPlugin.ts) method to define its specific line positioning logic.

## See Also

- [MovementPlugin Base Class](./base/MovementPlugin.ts)
- [Word Movement Plugins](./w/WMovementPlugin.ts)
- [Directional Movement Plugins](./base/DirectionalMovementPlugin.ts)
- [Line Utilities](./utils/lineUtils.ts)
