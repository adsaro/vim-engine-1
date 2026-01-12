# Screen/Page Movement Keybindings Implementation Plan

## Overview

This plan outlines the implementation of Screen/Page Movement keybindings for the Vim engine project. These keybindings enable viewport-relative navigation including page scrolling and positioning within the visible screen area.

**Keybindings to Implement:**
- `Ctrl+f`: Page down - Moves forward one full screen
- `Ctrl+b`: Page up - Moves backward one full screen
- `Ctrl+d`: Half page down - Moves down half a screen
- `Ctrl+u`: Half page up - Moves up half a screen
- `H`: High (Top) - Moves to the top line of the current screen
- `M`: Middle - Moves to the middle line of the current screen
- `L`: Low (Bottom) - Moves to the bottom line of the current screen

**Location:** `packages/vim-engine/src/plugins/movement/`

**Reference:** [`docs/vim-movement-keybindings.md`](../docs/vim-movement-keybindings.md:44-56)

---

## Architecture Analysis

### Current State

The existing movement plugin architecture provides:

- [`MovementPlugin`](../packages/vim-engine/src/plugins/movement/base/MovementPlugin.ts:80) base class with:
  - `calculateNewPosition()` abstract method for position calculation
  - `validateMove()` for boundary checking
  - Configuration support via `MovementConfig`
  - Mode support (NORMAL, VISUAL, etc.)
- [`VimState`](../packages/vim-engine/src/state/VimState.ts:68) managing:
  - Text buffer
  - Cursor position
  - Editor mode
  - Registers, marks, jump list, etc.
- Well-established plugin patterns in [`CONTRIBUTING.md`](../packages/vim-engine/src/plugins/movement/CONTRIBUTING.md:1)

### Key Challenge: Viewport State

**Problem:** Screen/Page movements require viewport information (visible lines, scroll position) which is not currently tracked in `VimState`.

**Solution Options:**

1. **Add ViewportState to VimState** (Recommended)
   - Add `viewport` property to track visible line range
   - Plugins can query viewport information
   - Maintains single source of truth

2. **Pass Viewport Info via ExecutionContext**
   - Extend ExecutionContext with viewport data
   - More flexible but requires changes to execution flow

3. **Viewport Configuration in MovementConfig**
   - Add viewport dimensions to config
   - Less flexible but simpler

**Decision:** Option 1 (Add ViewportState to VimState) is recommended for consistency and maintainability.

---

## Implementation Phases

### Phase 1: Infrastructure Setup

**Objective:** Establish the necessary infrastructure for viewport-aware movement.

#### 1.1 Create ViewportState Module

**File:** `packages/vim-engine/src/state/ViewportState.ts`

**Responsibilities:**
- Track visible line range (first visible line, last visible line)
- Track scroll position
- Provide viewport dimension calculations
- Handle viewport updates

**Interface:**
```typescript
export class ViewportState {
  // Properties
  firstVisibleLine: number;
  lastVisibleLine: number;
  scrollOffset: number;
  
  // Methods
  getVisibleLineCount(): number;
  getMiddleLine(): number;
  updateViewport(firstLine: number, lastLine: number): void;
  scrollBy(delta: number, totalLines: number): void;
  clone(): ViewportState;
}
```

**Tasks:**
- [ ] Create ViewportState class
- [ ] Implement line range tracking
- [ ] Implement viewport calculation methods
- [ ] Add clone() method for state copying
- [ ] Write unit tests

#### 1.2 Integrate ViewportState into VimState

**File:** `packages/vim-engine/src/state/VimState.ts`

**Changes:**
- Add `viewport: ViewportState` property
- Initialize viewport in constructor
- Update `clone()` to include viewport
- Update `reset()` to reset viewport

**Tasks:**
- [ ] Add viewport property to VimState
- [ ] Initialize viewport in constructor
- [ ] Update clone() method
- [ ] Update reset() method
- [ ] Write integration tests

#### 1.3 Extend ExecutionContext for Viewport Access

**File:** `packages/vim-engine/src/plugin/ExecutionContext.ts`

**Changes:**
- Add `getViewport()` method
- Ensure plugins can access viewport state

**Tasks:**
- [ ] Add getViewport() method
- [ ] Update TypeScript types
- [ ] Write unit tests

---

### Phase 2: Screen Movement Plugins (H, M, L)

**Objective:** Implement plugins for positioning within the current screen.

#### 2.1 Create ScreenMovementPlugin Base Class

**File:** `packages/vim-engine/src/plugins/movement/base/ScreenMovementPlugin.ts`

**Purpose:** Base class for viewport-relative movements (H, M, L)

**Responsibilities:**
- Provide common viewport access logic
- Calculate target line based on viewport position
- Handle viewport edge cases

**Interface:**
```typescript
export abstract class ScreenMovementPlugin extends MovementPlugin {
  protected calculateTargetLine(
    cursor: CursorPosition,
    buffer: TextBuffer,
    viewport: ViewportState
  ): number;
}
```

**Tasks:**
- [ ] Create ScreenMovementPlugin base class
- [ ] Implement common viewport logic
- [ ] Write unit tests

#### 2.2 Implement HMovementPlugin (High/Top)

**Directory:** `packages/vim-engine/src/plugins/movement/h/`

**Note:** Directory already exists for horizontal movement (h key). Need to differentiate:
- Existing: `h/` for horizontal left movement
- New: `h-capital/` for screen top movement

**Decision:** Use `h-capital/` directory for screen top movement (capital H).

**Files:**
- `HCapitalMovementPlugin.ts`
- `index.ts`
- `HCapitalMovementPlugin.test.ts`

**Behavior:**
- Move cursor to first visible line of viewport
- Preserve column position within bounds
- Handle edge case: empty buffer or single line

**Tasks:**
- [ ] Create h-capital directory
- [ ] Implement HCapitalMovementPlugin
- [ ] Write comprehensive tests
- [ ] Update main index.ts

#### 2.3 Implement MMovementPlugin (Middle)

**Directory:** `packages/vim-engine/src/plugins/movement/m/`

**Files:**
- `MMovementPlugin.ts`
- `index.ts`
- `MMovementPlugin.test.ts`

**Behavior:**
- Move cursor to middle visible line of viewport
- Preserve column position within bounds
- Handle edge case: odd number of visible lines (round down)

**Tasks:**
- [ ] Create m directory
- [ ] Implement MMovementPlugin
- [ ] Write comprehensive tests
- [ ] Update main index.ts

#### 2.4 Implement LCapitalMovementPlugin (Low/Bottom)

**Directory:** `packages/vim-engine/src/plugins/movement/l-capital/`

**Note:** Directory already exists for horizontal movement (l key). Use `l-capital/` for screen bottom movement.

**Files:**
- `LCapitalMovementPlugin.ts`
- `index.ts`
- `LCapitalMovementPlugin.test.ts`

**Behavior:**
- Move cursor to last visible line of viewport
- Preserve column position within bounds
- Handle edge case: empty buffer or single line

**Tasks:**
- [ ] Create l-capital directory
- [ ] Implement LCapitalMovementPlugin
- [ ] Write comprehensive tests
- [ ] Update main index.ts

---

### Phase 3: Page Movement Plugins (Ctrl+f, Ctrl+b)

**Objective:** Implement plugins for full-page scrolling.

#### 3.1 Create PageMovementPlugin Base Class

**File:** `packages/vim-engine/src/plugins/movement/base/PageMovementPlugin.ts`

**Purpose:** Base class for page-based movements (Ctrl+f, Ctrl+b)

**Responsibilities:**
- Calculate page size based on viewport
- Handle viewport scrolling
- Update viewport state after movement
- Handle page edge cases

**Interface:**
```typescript
export abstract class PageMovementPlugin extends MovementPlugin {
  protected abstract getDirection(): 'forward' | 'backward';
  
  protected scrollPage(
    cursor: CursorPosition,
    buffer: TextBuffer,
    viewport: ViewportState
  ): CursorPosition;
}
```

**Tasks:**
- [ ] Create PageMovementPlugin base class
- [ ] Implement page scrolling logic
- [ ] Implement viewport update logic
- [ ] Write unit tests

#### 3.2 Implement CtrlFMovementPlugin (Page Down)

**Directory:** `packages/vim-engine/src/plugins/movement/ctrl-f/`

**Files:**
- `CtrlFMovementPlugin.ts`
- `index.ts`
- `CtrlFMovementPlugin.test.ts`

**Behavior:**
- Move cursor forward by one full screen
- Scroll viewport forward by visible line count
- Preserve column position within bounds
- Handle edge case: at end of buffer

**Tasks:**
- [ ] Create ctrl-f directory
- [ ] Implement CtrlFMovementPlugin
- [ ] Write comprehensive tests
- [ ] Update main index.ts

#### 3.3 Implement CtrlBMovementPlugin (Page Up)

**Directory:** `packages/vim-engine/src/plugins/movement/ctrl-b/`

**Files:**
- `CtrlBMovementPlugin.ts`
- `index.ts`
- `CtrlBMovementPlugin.test.ts`

**Behavior:**
- Move cursor backward by one full screen
- Scroll viewport backward by visible line count
- Preserve column position within bounds
- Handle edge case: at start of buffer

**Tasks:**
- [ ] Create ctrl-b directory
- [ ] Implement CtrlBMovementPlugin
- [ ] Write comprehensive tests
- [ ] Update main index.ts

---

### Phase 4: Half-Page Movement Plugins (Ctrl+d, Ctrl+u)

**Objective:** Implement plugins for half-page scrolling.

#### 4.1 Create HalfPageMovementPlugin Base Class

**File:** `packages/vim-engine/src/plugins/movement/base/HalfPageMovementPlugin.ts`

**Purpose:** Base class for half-page movements (Ctrl+d, Ctrl+u)

**Responsibilities:**
- Calculate half-page size based on viewport
- Handle viewport scrolling by half page
- Update viewport state after movement
- Handle half-page edge cases

**Interface:**
```typescript
export abstract class HalfPageMovementPlugin extends MovementPlugin {
  protected abstract getDirection(): 'forward' | 'backward';
  
  protected scrollHalfPage(
    cursor: CursorPosition,
    buffer: TextBuffer,
    viewport: ViewportState
  ): CursorPosition;
}
```

**Tasks:**
- [ ] Create HalfPageMovementPlugin base class
- [ ] Implement half-page scrolling logic
- [ ] Implement viewport update logic
- [ ] Write unit tests

#### 4.2 Implement CtrlDMovementPlugin (Half Page Down)

**Directory:** `packages/vim-engine/src/plugins/movement/ctrl-d/`

**Files:**
- `CtrlDMovementPlugin.ts`
- `index.ts`
- `CtrlDMovementPlugin.test.ts`

**Behavior:**
- Move cursor forward by half screen
- Scroll viewport forward by half visible line count
- Preserve column position within bounds
- Handle edge case: at end of buffer
- Handle edge case: odd number of visible lines (round down)

**Tasks:**
- [ ] Create ctrl-d directory
- [ ] Implement CtrlDMovementPlugin
- [ ] Write comprehensive tests
- [ ] Update main index.ts

#### 4.3 Implement CtrlUMovementPlugin (Half Page Up)

**Directory:** `packages/vim-engine/src/plugins/movement/ctrl-u/`

**Files:**
- `CtrlUMovementPlugin.ts`
- `index.ts`
- `CtrlUMovementPlugin.test.ts`

**Behavior:**
- Move cursor backward by half screen
- Scroll viewport backward by half visible line count
- Preserve column position within bounds
- Handle edge case: at start of buffer
- Handle edge case: odd number of visible lines (round down)

**Tasks:**
- [ ] Create ctrl-u directory
- [ ] Implement CtrlUMovementPlugin
- [ ] Write comprehensive tests
- [ ] Update main index.ts

---

### Phase 5: Integration and Export

**Objective:** Integrate all plugins into the main plugin system.

#### 5.1 Update Main Movement Index

**File:** `packages/vim-engine/src/plugins/movement/index.ts`

**Changes:**
- Add exports for all new plugins
- Ensure proper ordering (alphabetical or logical)

**Exports to Add:**
```typescript
export { HCapitalMovementPlugin } from './h-capital';
export { MMovementPlugin } from './m';
export { LCapitalMovementPlugin } from './l-capital';
export { CtrlFMovementPlugin } from './ctrl-f';
export { CtrlBMovementPlugin } from './ctrl-b';
export { CtrlDMovementPlugin } from './ctrl-d';
export { CtrlUMovementPlugin } from './ctrl-u';
```

**Tasks:**
- [ ] Add exports for screen movement plugins
- [ ] Add exports for page movement plugins
- [ ] Add exports for half-page movement plugins
- [ ] Verify all exports are correct

#### 5.2 Update Plugin Registry

**File:** `packages/vim-engine/src/plugin/PluginRegistry.ts` (if applicable)

**Tasks:**
- [ ] Register new plugins in registry (if auto-registration not used)
- [ ] Verify plugin registration order

#### 5.3 Update CONTRIBUTING.md

**File:** `packages/vim-engine/src/plugins/movement/CONTRIBUTING.md`

**Changes:**
- Add Screen/Page Movement category details
- Update plugin hierarchy diagram
- Add examples for screen/page movement plugins

**Tasks:**
- [ ] Add Screen/Page Movement section
- [ ] Update plugin hierarchy diagram
- [ ] Add implementation examples
- [ ] Add testing guidelines

---

### Phase 6: Comprehensive Testing

**Objective:** Ensure all plugins work correctly individually and together.

#### 6.1 Unit Tests

**Coverage Requirements:**
- Each plugin: 90%+ coverage
- Base classes: 95%+ coverage
- ViewportState: 100% coverage

**Test Categories:**
- Metadata tests (name, version, description, patterns, modes)
- Basic movement tests
- Boundary tests (buffer start/end, viewport edges)
- Empty state tests (empty buffer, single line)
- Configuration tests
- Edge case tests

**Tasks:**
- [ ] Verify all unit tests pass
- [ ] Check test coverage meets requirements
- [ ] Add missing test cases

#### 6.2 Integration Tests

**File:** `packages/vim-engine/tests/integration/screen-page-movement-integration.test.ts`

**Test Scenarios:**
- Sequential screen movements (H, M, L)
- Sequential page movements (Ctrl+f, Ctrl+b)
- Sequential half-page movements (Ctrl+d, Ctrl+u)
- Mixed movement types
- Count prefix support (e.g., 3Ctrl+f, 5H)
- Visual mode compatibility

**Tasks:**
- [ ] Create integration test file
- [ ] Implement test scenarios
- [ ] Verify all tests pass

#### 6.3 Performance Tests

**File:** `packages/vim-engine/tests/performance/screen-page-movement-benchmark.test.ts`

**Performance Budget:**
- Screen movement (H, M, L): < 0.1ms
- Page movement (Ctrl+f, Ctrl+b): < 0.5ms
- Half-page movement (Ctrl+d, Ctrl+u): < 0.5ms

**Test Scenarios:**
- Small buffer (10 lines)
- Medium buffer (100 lines)
- Large buffer (10,000 lines)
- Very large buffer (100,000 lines)

**Tasks:**
- [ ] Create performance benchmark tests
- [ ] Verify performance meets budget
- [ ] Optimize if necessary

---

### Phase 7: Documentation

**Objective:** Document the implementation for future developers.

#### 7.1 Create SCREEN_PAGE_MOVEMENT.md

**File:** `packages/vim-engine/src/plugins/movement/SCREEN_PAGE_MOVEMENT.md`

**Content:**
- Overview of screen/page movement
- ViewportState architecture
- Plugin structure and responsibilities
- Usage examples
- Edge case handling
- Performance considerations

**Tasks:**
- [ ] Create documentation file
- [ ] Document ViewportState
- [ ] Document all plugins
- [ ] Add usage examples

#### 7.2 Update README

**File:** `packages/vim-engine/README.md`

**Changes:**
- Add screen/page movement to features list
- Link to SCREEN_PAGE_MOVEMENT.md

**Tasks:**
- [ ] Update README
- [ ] Verify links work

---

## Edge Cases and Error Handling

### Viewport Edge Cases

1. **Empty Buffer**
   - All movements should return cursor unchanged
   - Viewport should remain at line 0

2. **Single Line Buffer**
   - All screen movements should move to line 0
   - Page movements should have no effect
   - Half-page movements should have no effect

3. **Buffer Smaller Than Viewport**
   - Screen movements should clamp to buffer bounds
   - Page movements should clamp to buffer bounds
   - Viewport should adjust to fit buffer

4. **Cursor Outside Viewport**
   - Screen movements should move cursor into viewport
   - Page movements should adjust viewport to include cursor

### Movement Edge Cases

1. **Count Prefix Support**
   - `3H` - Move to 3rd line from top
   - `2Ctrl+f` - Move forward 2 pages
   - `5Ctrl+d` - Move forward 5 half-pages

2. **Column Preservation**
   - All movements should preserve desired column
   - Clamp column to target line length
   - Handle empty lines gracefully

3. **Visual Mode Compatibility**
   - All movements should work in visual mode
   - Maintain visual selection anchor
   - Update visual selection end position

### Error Handling

1. **Invalid Viewport State**
   - Validate viewport bounds
   - Handle negative line numbers
   - Handle firstVisibleLine > lastVisibleLine

2. **Buffer Boundary Violations**
   - Clamp movements to valid line range
   - Prevent scrolling beyond buffer
   - Return cursor unchanged if invalid

3. **Configuration Errors**
   - Validate MovementConfig parameters
   - Handle invalid step values
   - Handle invalid mode specifications

---

## Configuration Considerations

### MovementConfig Extensions

Consider adding screen/page-specific configuration options:

```typescript
export interface MovementConfig {
  // Existing options
  step?: number;
  allowWrap?: boolean;
  scrollOnEdge?: boolean;
  visualModeEnabled?: boolean;
  
  // New options for screen/page movement
  pageSize?: number;           // Number of lines per page
  halfPageSize?: number;       // Number of lines per half-page
  viewportOffset?: number;      // Offset from viewport edge
  preserveColumn?: boolean;    // Whether to preserve column (default: true)
}
```

### Default Values

- `pageSize`: Calculated from ViewportState.visibleLineCount
- `halfPageSize`: Math.floor(pageSize / 2)
- `viewportOffset`: 0 (no offset from viewport edge)
- `preserveColumn`: true (preserve desired column)

---

## Testing Strategy

### Test Pyramid

```
        /\
       /  \      Integration Tests (10%)
      /____\
     /      \    Unit Tests (70%)
    /________\
   /          \  E2E Tests (20%)
  /____________\
```

### Test Organization

```
packages/vim-engine/tests/
├── unit/
│   ├── state/
│   │   └── ViewportState.test.ts
│   └── plugins/
│       └── movement/
│           ├── base/
│           │   ├── ScreenMovementPlugin.test.ts
│           │   ├── PageMovementPlugin.test.ts
│           │   └── HalfPageMovementPlugin.test.ts
│           ├── h-capital/
│           │   └── HCapitalMovementPlugin.test.ts
│           ├── m/
│           │   └── MMovementPlugin.test.ts
│           ├── l-capital/
│           │   └── LCapitalMovementPlugin.test.ts
│           ├── ctrl-f/
│           │   └── CtrlFMovementPlugin.test.ts
│           ├── ctrl-b/
│           │   └── CtrlBMovementPlugin.test.ts
│           ├── ctrl-d/
│           │   └── CtrlDMovementPlugin.test.ts
│           └── ctrl-u/
│               └── CtrlUMovementPlugin.test.ts
├── integration/
│   └── screen-page-movement-integration.test.ts
└── performance/
    └── screen-page-movement-benchmark.test.ts
```

### Test Data

Create test fixtures for various buffer sizes:
- Empty buffer
- Single line buffer
- Small buffer (10 lines)
- Medium buffer (100 lines)
- Large buffer (10,000 lines)
- Very large buffer (100,000 lines)

---

## Performance Considerations

### Optimization Guidelines

1. **Viewport State Caching**
   - Cache viewport calculations in ViewportState
   - Avoid recalculating on every movement

2. **Minimize Object Creation**
   - Reuse CursorPosition objects where possible
   - Avoid creating intermediate objects in hot paths

3. **Early Termination**
   - Check buffer boundaries before calculations
   - Return early for edge cases

4. **Efficient Line Access**
   - Use TextBuffer.getLine() efficiently
   - Cache line content when appropriate

### Performance Targets

| Operation                | Target Time | Maximum Acceptable |
| ------------------------ | ----------- | ------------------ |
| Screen movement (H/M/L)  | < 0.1ms     | 0.5ms              |
| Page movement (Ctrl+f/b) | < 0.5ms     | 2ms                |
| Half-page (Ctrl+d/u)    | < 0.5ms     | 2ms                |
| Viewport update          | < 0.05ms    | 0.2ms              |

---

## Integration with Existing Codebase

### Dependencies

**New Dependencies:**
- None (uses existing state and plugin infrastructure)

**Existing Dependencies:**
- `packages/vim-engine/src/state/VimState.ts`
- `packages/vim-engine/src/state/CursorPosition.ts`
- `packages/vim-engine/src/state/TextBuffer.ts`
- `packages/vim-engine/src/plugin/AbstractVimPlugin.ts`
- `packages/vim-engine/src/plugin/ExecutionContext.ts`
- `packages/vim-engine/src/plugins/movement/base/MovementPlugin.ts`

### Breaking Changes

**None** - This is a new feature that doesn't modify existing functionality.

### Backward Compatibility

**Fully backward compatible** - All existing plugins and functionality remain unchanged.

---

## File Structure

```
packages/vim-engine/src/
├── state/
│   ├── ViewportState.ts          # NEW
│   ├── VimState.ts               # MODIFIED (add viewport)
│   └── index.ts                  # MODIFIED (export ViewportState)
├── plugin/
│   ├── ExecutionContext.ts       # MODIFIED (add getViewport())
│   └── index.ts                  # MODIFIED (if needed)
└── plugins/
    └── movement/
        ├── base/
        │   ├── ScreenMovementPlugin.ts      # NEW
        │   ├── PageMovementPlugin.ts        # NEW
        │   └── HalfPageMovementPlugin.ts    # NEW
        ├── h-capital/
        │   ├── HCapitalMovementPlugin.ts    # NEW
        │   ├── index.ts                     # NEW
        │   └── HCapitalMovementPlugin.test.ts # NEW
        ├── m/
        │   ├── MMovementPlugin.ts           # NEW
        │   ├── index.ts                     # NEW
        │   └── MMovementPlugin.test.ts      # NEW
        ├── l-capital/
        │   ├── LCapitalMovementPlugin.ts    # NEW
        │   ├── index.ts                     # NEW
        │   └── LCapitalMovementPlugin.test.ts # NEW
        ├── ctrl-f/
        │   ├── CtrlFMovementPlugin.ts      # NEW
        │   ├── index.ts                     # NEW
        │   └── CtrlFMovementPlugin.test.ts  # NEW
        ├── ctrl-b/
        │   ├── CtrlBMovementPlugin.ts      # NEW
        │   ├── index.ts                     # NEW
        │   └── CtrlBMovementPlugin.test.ts  # NEW
        ├── ctrl-d/
        │   ├── CtrlDMovementPlugin.ts      # NEW
        │   ├── index.ts                     # NEW
        │   └── CtrlDMovementPlugin.test.ts  # NEW
        ├── ctrl-u/
        │   ├── CtrlUMovementPlugin.ts      # NEW
        │   ├── index.ts                     # NEW
        │   └── CtrlUMovementPlugin.test.ts  # NEW
        ├── CONTRIBUTING.md                  # MODIFIED
        ├── SCREEN_PAGE_MOVEMENT.md          # NEW
        └── index.ts                         # MODIFIED (add exports)
```

---

## Implementation Checklist

### Phase 1: Infrastructure Setup
- [ ] Create ViewportState class
- [ ] Integrate ViewportState into VimState
- [ ] Extend ExecutionContext for viewport access
- [ ] Write ViewportState unit tests
- [ ] Write VimState integration tests

### Phase 2: Screen Movement Plugins
- [ ] Create ScreenMovementPlugin base class
- [ ] Implement HCapitalMovementPlugin
- [ ] Implement MMovementPlugin
- [ ] Implement LCapitalMovementPlugin
- [ ] Write all screen movement plugin tests
- [ ] Update main index.ts

### Phase 3: Page Movement Plugins
- [ ] Create PageMovementPlugin base class
- [ ] Implement CtrlFMovementPlugin
- [ ] Implement CtrlBMovementPlugin
- [ ] Write all page movement plugin tests
- [ ] Update main index.ts

### Phase 4: Half-Page Movement Plugins
- [ ] Create HalfPageMovementPlugin base class
- [ ] Implement CtrlDMovementPlugin
- [ ] Implement CtrlUMovementPlugin
- [ ] Write all half-page movement plugin tests
- [ ] Update main index.ts

### Phase 5: Integration and Export
- [ ] Update main movement index.ts
- [ ] Update plugin registry (if applicable)
- [ ] Update CONTRIBUTING.md

### Phase 6: Comprehensive Testing
- [ ] Verify all unit tests pass
- [ ] Create integration tests
- [ ] Create performance tests
- [ ] Verify test coverage meets requirements

### Phase 7: Documentation
- [ ] Create SCREEN_PAGE_MOVEMENT.md
- [ ] Update README.md
- [ ] Verify all documentation is complete

---

## Success Criteria

1. **Functional Requirements**
   - All 7 keybindings work correctly in NORMAL and VISUAL modes
   - Viewport state is properly tracked and updated
   - Edge cases are handled gracefully
   - Count prefix support works as expected

2. **Quality Requirements**
   - Unit test coverage ≥ 90% for plugins
   - Unit test coverage = 100% for ViewportState
   - All tests pass
   - Performance meets targets

3. **Documentation Requirements**
   - All plugins have comprehensive JSDoc comments
   - SCREEN_PAGE_MOVEMENT.md is complete
   - CONTRIBUTING.md is updated
   - README.md is updated

4. **Integration Requirements**
   - All plugins are properly exported
   - Plugins are registered in plugin registry
   - No breaking changes to existing code
   - Fully backward compatible

---

## Risk Mitigation

### Risk 1: Viewport State Complexity

**Risk:** Viewport state management may be complex and error-prone.

**Mitigation:**
- Start with simple implementation
- Comprehensive unit tests
- Clear separation of concerns
- Document edge cases thoroughly

### Risk 2: Performance Degradation

**Risk:** Viewport calculations may impact performance.

**Mitigation:**
- Cache viewport calculations
- Early termination for edge cases
- Performance benchmarks
- Optimize hot paths

### Risk 3: Integration Issues

**Risk:** New plugins may not integrate well with existing code.

**Mitigation:**
- Follow existing patterns strictly
- Comprehensive integration tests
- Incremental implementation
- Regular testing during development

### Risk 4: Edge Case Handling

**Risk:** Complex edge cases may be missed.

**Mitigation:**
- Comprehensive test coverage
- Edge case documentation
- Peer review of edge case handling
- Real-world testing scenarios

---

## Next Steps

1. **Review and Approve Plan**
   - Stakeholder review
   - Feedback incorporation
   - Final approval

2. **Begin Implementation**
   - Start with Phase 1 (Infrastructure)
   - Proceed sequentially through phases
   - Regular testing at each phase

3. **Quality Assurance**
   - Code reviews
   - Test coverage verification
   - Performance validation

4. **Documentation**
   - Update all documentation
   - Create usage examples
   - Prepare for release

---

## References

- [`docs/vim-movement-keybindings.md`](../docs/vim-movement-keybindings.md:44-56) - Keybindings specification
- [`packages/vim-engine/src/plugins/movement/CONTRIBUTING.md`](../packages/vim-engine/src/plugins/movement/CONTRIBUTING.md:1) - Development guide
- [`packages/vim-engine/src/plugins/movement/base/MovementPlugin.ts`](../packages/vim-engine/src/plugins/movement/base/MovementPlugin.ts:80) - Base class
- [`packages/vim-engine/src/state/VimState.ts`](../packages/vim-engine/src/state/VimState.ts:68) - State management

---

**Document Version:** 1.0  
**Last Updated:** 2025-01-12  
**Status:** Draft - Pending Review
