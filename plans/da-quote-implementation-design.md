# Design Document: da" (Around Quote) Text Object Implementation

## Overview

This document outlines the design approach for implementing the `da"` text object and related "around" quote text objects (`da'`, `da\``) in the vim-engine project.

## Current Architecture Analysis

### Directory Structure

```
packages/vim-engine/src/plugins/textobjects/
├── index.ts                      # Main export file
├── base/
│   ├── index.ts
│   └── InsideBracketTextObject.ts  # Base class for bracket text objects
├── iquote/
│   ├── index.ts
│   ├── InsideQuoteTextObject.ts    # Handles i", i', i`
│   └── InsideQuoteTextObject.test.ts
├── iw/
│   ├── index.ts
│   ├── InsideWordTextObject.ts     # Handles iw
│   └── InsideWordTextObject.test.ts
├── i-curly/
│   ├── index.ts
│   └── InsideCurlyBraceTextObject.ts  # Handles i{
├── i-paren/
│   ├── index.ts
│   └── InsideParenTextObject.ts       # Handles i(
├── i-square/
│   ├── index.ts
│   └── InsideSquareBracketTextObject.ts  # Handles i[
└── i-angle/
    ├── index.ts
    └── InsideAngleBracketTextObject.ts   # Handles i<
```

### Key Implementation Patterns

#### 1. InsideBracketTextObject (Base Class)

Location: [`InsideBracketTextObject.ts`](packages/vim-engine/src/plugins/textobjects/base/InsideBracketTextObject.ts)

This is a generic base class that:

- Takes bracket characters as constructor parameters
- Uses [`findMatchingBracket()`](packages/vim-engine/src/plugins/movement/utils/bracketMatcher.ts) for finding matching pairs
- Provides [`getWordBoundaries()`](packages/vim-engine/src/plugins/textobjects/base/InsideBracketTextObject.ts:118) method that returns the **inner** content

**Boundary calculation for `i{`:**

```typescript
// Start: right after opening bracket
startColumn = openBracket.column + 1;

// End: right before closing bracket
endColumn = closeBracket.column;
```

#### 2. InsideQuoteTextObject (Standalone)

Location: [`InsideQuoteTextObject.ts`](packages/vim-engine/src/plugins/textobjects/iquote/InsideQuoteTextObject.ts)

This class:

- Extends `AbstractVimPlugin` directly (not `InsideBracketTextObject`)
- Handles multiple quote types via a `quoteMap`: `i"`, `i'`, `i\``
- Works on the current line only
- Uses pattern from context to determine quote character

**Boundary calculation for `i"`:**

```typescript
// From findQuoteBoundaries():
return {
  start: openingQuote + 1, // After opening quote
  end: closingQuote, // At closing quote (exclusive)
};
```

#### 3. Bracket Text Objects (i-curly, i-paren, etc.)

Each bracket type has a minimal class that extends `InsideBracketTextObject`:

```typescript
// InsideCurlyBraceTextObject.ts
export class InsideCurlyBraceTextObject extends InsideBracketTextObject {
  readonly name = 'textobject-i-curly';
  readonly patterns = ['i{'];

  constructor() {
    super('{', '}', 'textobject-i-curly', 'i{', 'Inside curly brace text object (i{)');
  }
}
```

### Registration Pattern

Text objects are registered in [`VimContext.tsx`](packages/vim-demo/src/contexts/VimContext.tsx:160):

```typescript
engine.registerPlugin(new InsideQuoteTextObject());
engine.registerPlugin(new InsideCurlyBraceTextObject());
// etc.
```

---

## Key Difference: di" vs da"

| Aspect             | di" (Inside)       | da" (Around)       |
| ------------------ | ------------------ | ------------------ |
| Start position     | `openingQuote + 1` | `openingQuote`     |
| End position       | `closingQuote`     | `closingQuote + 1` |
| Includes quotes    | No                 | Yes                |
| Example: `"hello"` | Deletes `hello`    | Deletes `"hello"`  |

### Visual Example

```
Text:     Say "hello" world
Cursor:         ^

di" result: Say "" world     (quotes remain, content deleted)
da" result: Say  world        (quotes and content deleted)
```

---

## Proposed Implementation Approach

### Recommended: Option 1 - Create AroundQuoteTextObject Class

Create a new standalone class following the existing pattern.

#### File Structure

```
packages/vim-engine/src/plugins/textobjects/
├── aquote/                          # NEW DIRECTORY
│   ├── index.ts                     # NEW FILE
│   ├── AroundQuoteTextObject.ts     # NEW FILE
│   └── AroundQuoteTextObject.test.ts # NEW FILE
└── index.ts                         # UPDATE: add export
```

#### Class Design

```typescript
// AroundQuoteTextObject.ts
export class AroundQuoteTextObject extends AbstractVimPlugin {
  readonly name = 'textobject-aquote';
  readonly version = '1.0.0';
  readonly description = 'Around quote text object (a", a\', a`)';
  readonly patterns = ['a"', "a'", 'a`'];
  readonly modes: VimMode[] = [VIM_MODE.OPERATOR_PENDING, VIM_MODE.VISUAL];

  private readonly quoteMap: Record<string, string> = {
    'a"': '"',
    "a'": "'",
    'a`': '`',
  };

  getWordBoundaries(
    context: ExecutionContext
  ): { start: CursorPosition; end: CursorPosition } | null {
    // ... same quote finding logic as InsideQuoteTextObject ...
    // BUT with different boundary calculation:
    return {
      start: new CursorPosition(cursor.line, openingQuote), // Include opening quote
      end: new CursorPosition(cursor.line, closingQuote + 1), // Include closing quote
    };
  }
}
```

### Code Reuse Strategy

The quote-finding logic in [`findQuoteBoundaries()`](packages/vim-engine/src/plugins/textobjects/iquote/InsideQuoteTextObject.ts:129) can be extracted into a shared utility:

```
packages/vim-engine/src/plugins/textobjects/utils/
└── quoteUtils.ts    # NEW FILE with shared quote-finding logic
```

This utility would provide:

- `findQuotePositions(line, quoteChar)` - Find all quote positions
- `findEnclosingQuotePair(line, column, quoteChar)` - Find the pair containing cursor

---

## Implementation Checklist

### Phase 1: Core Implementation

- [ ] Create `packages/vim-engine/src/plugins/textobjects/aquote/` directory
- [ ] Create `AroundQuoteTextObject.ts` with the around quote logic
- [ ] Create `index.ts` to export the class
- [ ] Update `packages/vim-engine/src/plugins/textobjects/index.ts` to export aquote

### Phase 2: Testing

- [ ] Create `AroundQuoteTextObject.test.ts` with comprehensive tests:
  - [ ] Test `a"` with cursor inside quotes
  - [ ] Test `a'` with cursor inside quotes
  - [ ] Test `a\`` with cursor inside quotes
  - [ ] Test cursor on opening quote
  - [ ] Test cursor on closing quote
  - [ ] Test cursor outside quotes (should return null)
  - [ ] Test empty quotes `""`
  - [ ] Test multiple quote pairs on same line

### Phase 3: Integration

- [ ] Update `packages/vim-engine/src/index.ts` to export `AroundQuoteTextObject`
- [ ] Update `packages/vim-demo/src/contexts/VimContext.tsx` to register the plugin:
  ```typescript
  engine.registerPlugin(new AroundQuoteTextObject());
  ```

### Phase 4: Optional Refactoring

- [ ] Extract shared quote-finding logic into `utils/quoteUtils.ts`
- [ ] Refactor `InsideQuoteTextObject` to use shared utility
- [ ] Refactor `AroundQuoteTextObject` to use shared utility

---

## Future Considerations

### Around Bracket Text Objects (a{, a(, a[, a<)

The same approach can be applied to bracket text objects:

1. Create `AroundBracketTextObject` base class (similar to `InsideBracketTextObject`)
2. Create individual classes: `AroundCurlyBraceTextObject`, `AroundParenTextObject`, etc.
3. Key difference in boundary calculation:
   ```typescript
   // Around includes the brackets
   startColumn = openBracket.column; // On opening bracket
   endColumn = closeBracket.column + 1; // After closing bracket
   ```

### Alternative: Unified Quote Text Object

Consider consolidating `Inside` and `Around` into a single `QuoteTextObject` class that handles both:

- Patterns: `i"`, `i'`, `i\``, `a"`, `a'`, `a\``
- Use pattern prefix (`i` vs `a`) to determine boundary behavior

---

## Summary

The recommended approach is to create a new `AroundQuoteTextObject` class that mirrors the structure of `InsideQuoteTextObject` but includes the quote characters in the selected range. This follows the existing patterns in the codebase and maintains consistency with how other text objects are implemented.

The key implementation difference is in the boundary calculation:

- **Inside (`i"`)**: `start = openingQuote + 1`, `end = closingQuote`
- **Around (`a"`)**: `start = openingQuote`, `end = closingQuote + 1`
