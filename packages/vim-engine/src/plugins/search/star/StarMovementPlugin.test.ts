/**
 * Tests for StarMovementPlugin
 */

import { describe, it, expect } from 'vitest';
import { StarMovementPlugin } from '../../plugins/search';
import { VimState } from '../../state/VimState';
import { CursorPosition } from '../../state/CursorPosition';
import { TextBuffer } from '../../state/TextBuffer';
import { ExecutionContext } from '../../plugin/ExecutionContext';

describe('StarMovementPlugin', () => {
  it('should search for the word under cursor', () => {
    const state = new VimState();
    state.buffer = new TextBuffer();
    const plugin = new StarMovementPlugin();

    // Set up content with repeated words
    const content = 'hello world hello again';
    state.buffer.setContent(content);

    // Move cursor to first 'hello' (position 0,0)
    state.cursor.line = 0;
    state.cursor.column = 0;

    // Create execution context
    const context = {
      getState: () => state,
      getBuffer: () => state.buffer,
      getCursor: () => state.cursor,
      setCursor: (pos: CursorPosition) => {
        state.cursor.line = pos.line;
        state.cursor.column = pos.column;
      },
      setMode: () => {},
    } as ExecutionContext;

    // Perform the star action
    plugin.performAction(context);

    // Should have moved to the second 'hello' at column 12
    expect(state.cursor.column).toBe(12);
    expect(state.cursor.line).toBe(0);

    // Should have set the search pattern
    expect(state.getLastSearchPattern()).toBe('hello');
  });

  it('should not move if cursor is not on a word', () => {
    const state = new VimState();
    state.buffer = new TextBuffer();
    const plugin = new StarMovementPlugin();

    const content = 'hello world';
    state.buffer.setContent(content);
    state.cursor.line = 0;
    state.cursor.column = 5; // Position on space

    const originalColumn = state.cursor.column;

    const context = {
      getState: () => state,
      getBuffer: () => state.buffer,
      getCursor: () => state.cursor,
      setCursor: () => {},
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
    state.cursor.line = 0;
    state.cursor.column = 5; // Position in middle of 'test_variable'

    const context = {
      getState: () => state,
      getBuffer: () => state.buffer,
      getCursor: () => state.cursor,
      setCursor: (pos: CursorPosition) => {
        state.cursor.line = pos.line;
        state.cursor.column = pos.column;
      },
      setMode: () => {},
    } as ExecutionContext;

    plugin.performAction(context);

    // Should search for the complete word including underscore
    expect(state.getLastSearchPattern()).toBe('test_variable');

    // Should have moved to the second occurrence
    expect(state.cursor.column).toBe(19);
  });

  it('should wrap around to find next occurrence', () => {
    const state = new VimState();
    state.buffer = new TextBuffer();
    const plugin = new StarMovementPlugin();

    const content = 'hello world';
    state.buffer.setContent(content);
    state.cursor.line = 0;
    state.cursor.column = 0; // On the first and only 'hello'

    const context = {
      getState: () => state,
      getBuffer: () => state.buffer,
      getCursor: () => state.cursor,
      setCursor: (pos: CursorPosition) => {
        state.cursor.line = pos.line;
        state.cursor.column = pos.column;
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
    state.cursor.line = 0;
    state.cursor.column = 12; // On last 'hello'

    const context = {
      getState: () => state,
      getBuffer: () => state.buffer,
      getCursor: () => state.cursor,
      setCursor: (pos: CursorPosition) => {
        state.cursor.line = pos.line;
        state.cursor.column = pos.column;
      },
      setMode: () => {},
    } as ExecutionContext;

    plugin.performAction(context);

    // Should wrap to first 'hello'
    expect(state.cursor.column).toBe(0);
    expect(state.getLastSearchPattern()).toBe('hello');
  });
});
