/**
 * Tests for StarMovementPlugin
 */

import { describe, it, expect } from 'vitest';
import { StarMovementPlugin } from './StarMovementPlugin';
import { VimState } from '../../../state/VimState';
import { CursorPosition } from '../../../state/CursorPosition';
import { TextBuffer } from '../../../state/TextBuffer';
import { ExecutionContext } from '../../../plugin/ExecutionContext';

describe('StarMovementPlugin', () => {
  it('should search for the word under cursor', () => {
    const state = new VimState();
    state.buffer = new TextBuffer();
    const plugin = new StarMovementPlugin();

    // Set up content with repeated words
    const content = 'hello world hello again';
    state.buffer.setContent(content);

    // Move cursor to first 'hello' (position 0,0)
    state.cursor = new CursorPosition(0, 0);

    // Create execution context
    const context = {
      getState: () => state,
      getBuffer: () => state.buffer,
      getCursor: () => state.cursor,
      setCursor: (pos: CursorPosition) => {
        state.cursor = pos;
      },
      setMode: () => {},
    } as ExecutionContext;

    // Perform the star action
    plugin.performAction(context);

    // Should have moved to the second 'hello' at column 12
    expect(state.cursor.column).toBe(12);
    expect(state.cursor.line).toBe(0);

    // Should have set the search pattern as a regexp for whole-word matching
    const pattern = state.getLastSearchPattern();
    expect(pattern).toContain('hello');
    expect(pattern).toContain('\\b'); // Should contain word boundary
  });

  it('should not move if cursor is not on a word', () => {
    const state = new VimState();
    state.buffer = new TextBuffer();
    const plugin = new StarMovementPlugin();

    const content = 'hello world';
    state.buffer.setContent(content);
    state.cursor = new CursorPosition(0, 5); // Position on space

    const originalColumn = state.cursor.column;

    const context = {
      getState: () => state,
      getBuffer: () => state.buffer,
      getCursor: () => state.cursor,
      setCursor: (pos: CursorPosition) => {
        state.cursor = pos;
      },
      setMode: () => {},
    } as ExecutionContext;

    plugin.performAction(context);

    // Should not have moved
    expect(state.cursor.column).toBe(originalColumn);
  });

  it('should extract complete word with underscores', () => {
    const state = new VimState();
    state.buffer = new TextBuffer();
    const plugin = new StarMovementPlugin();

    const content = 'test_variable hello test_variable';
    state.buffer.setContent(content);
    state.cursor = new CursorPosition(0, 5); // Position in middle of 'test_variable'

    const context = {
      getState: () => state,
      getBuffer: () => state.buffer,
      getCursor: () => state.cursor,
      setCursor: (pos: CursorPosition) => {
        state.cursor = pos;
      },
      setMode: () => {},
    } as ExecutionContext;

    plugin.performAction(context);

    // Should search for the complete word including underscore
    const pattern = state.getLastSearchPattern();
    expect(pattern).toContain('test_variable');
    expect(pattern).toContain('\\b'); // Should contain word boundary for whole-word matching

    // Should have moved to the second occurrence
    expect(state.cursor.column).toBe(20);
  });

  it('should wrap around to find next occurrence', () => {
    const state = new VimState();
    state.buffer = new TextBuffer();
    const plugin = new StarMovementPlugin();

    const content = 'hello world';
    state.buffer.setContent(content);
    state.cursor = new CursorPosition(0, 0); // On the first and only 'hello'

    const context = {
      getState: () => state,
      getBuffer: () => state.buffer,
      getCursor: () => state.cursor,
      setCursor: (pos: CursorPosition) => {
        state.cursor = pos;
      },
      setMode: () => {},
    } as ExecutionContext;

    plugin.performAction(context);

    // Should wrap around and find 'hello' again at the beginning
    expect(state.cursor.column).toBe(0);
  });

  it('should handle word at end of line', () => {
    const state = new VimState();
    state.buffer = new TextBuffer();
    const plugin = new StarMovementPlugin();

    const content = 'hello world hello';
    state.buffer.setContent(content);
    state.cursor = new CursorPosition(0, 12); // On last 'hello'

    const context = {
      getState: () => state,
      getBuffer: () => state.buffer,
      getCursor: () => state.cursor,
      setCursor: (pos: CursorPosition) => {
        state.cursor = pos;
      },
      setMode: () => {},
    } as ExecutionContext;

    plugin.performAction(context);

    // Should wrap to first 'hello'
    expect(state.cursor.column).toBe(0);
    expect(state.getLastSearchPattern()).toContain('hello');
  });

  it('should match whole words only', () => {
    const state = new VimState();
    state.buffer = new TextBuffer();
    const plugin = new StarMovementPlugin();

    // Set up content where 'hello' appears as part of other words
    const content = 'hello hello_world helloworld hello';
    state.buffer.setContent(content);
    state.cursor = new CursorPosition(0, 0); // On first 'hello'

    const context = {
      getState: () => state,
      getBuffer: () => state.buffer,
      getCursor: () => state.cursor,
      setCursor: (pos: CursorPosition) => {
        state.cursor = pos;
      },
      setMode: () => {},
    } as ExecutionContext;

    plugin.performAction(context);

    // Should skip 'hello_world' and 'helloworld' and match only standalone 'hello'
    // hello (0-4) + space (5) + hello_world (6-16) + space (17) + helloworld (18-27) + space (28) + hello (29-33)
    expect(state.cursor.column).toBe(29);
  });

  it('should match whole words at beginning and end of line', () => {
    const state = new VimState();
    state.buffer = new TextBuffer();
    const plugin = new StarMovementPlugin();

    // Word at beginning of line
    const content = 'hello world';
    state.buffer.setContent(content);
    state.cursor = new CursorPosition(0, 0);

    const context = {
      getState: () => state,
      getBuffer: () => state.buffer,
      getCursor: () => state.cursor,
      setCursor: (pos: CursorPosition) => {
        state.cursor = pos;
      },
      setMode: () => {},
    } as ExecutionContext;

    plugin.performAction(context);

    // Should wrap around and find the same 'hello' at the beginning
    expect(state.cursor.column).toBe(0);
  });
});
