/**
 * Integration test for di{ (delete inside curly braces) keybinding
 */
import { VimExecutor } from '@vim-engine/core';
import { DeleteOperatorPlugin } from '@vim-engine/core';
import { InsideCurlyBraceTextObject } from '@vim-engine/core';
import { InsertModePlugin } from '@vim-engine/core';
import { TextBuffer } from '@vim-engine/core';
import { CursorPosition } from '@vim-engine/core';
import { VIM_MODE } from '@vim-engine/core';

describe('di{ keybinding integration', () => {
  let executor: VimExecutor;
  let buffer: TextBuffer;

  beforeEach(() => {
    executor = new VimExecutor();
    buffer = new TextBuffer();

    // Register required plugins
    executor.registerPlugin(new DeleteOperatorPlugin());
    executor.registerPlugin(new InsideCurlyBraceTextObject());
    executor.registerPlugin(new InsertModePlugin());

    executor.initialize();
    executor.start();
  });

  afterEach(() => {
    executor.stop();
    executor.destroy();
  });

  it('should delete content inside curly braces', () => {
    buffer.insertLine(0, 'function() { return true; }');
    executor.getExecutionContext().setBuffer(buffer);
    executor.getExecutionContext().setCursor(new CursorPosition(0, 12)); // On open brace
    executor.getExecutionContext().setMode(VIM_MODE.NORMAL);

    // Execute di{ sequence
    executor.handleKeystroke('d');
    executor.handleKeystroke('i{');

    // Check that content inside braces was deleted
    const line = buffer.getLine(0);
    expect(line).toBe('function() {}');
  });

  it('should delete content inside curly braces multiline', () => {
    buffer.insertLine(0, 'function() {');
    buffer.insertLine(1, '  return true;');
    buffer.insertLine(2, '}');
    executor.getExecutionContext().setBuffer(buffer);
    executor.getExecutionContext().setCursor(new CursorPosition(1, 2)); // Inside function
    executor.getExecutionContext().setMode(VIM_MODE.NORMAL);

    // Execute di{ sequence
    executor.handleKeystroke('d');
    executor.handleKeystroke('i{');

    // Expected behavior: function() {}
    // The implementation might keep matching braces on the same line or collapse.
    // Let's verify what happens.
    const line0 = buffer.getLine(0);
    // Vim usually collapses if it becomes empty.
    // If the internal logic just deletes range, it should fuse line 0 and line 2.
    // "function() {" + "}" -> "function() {}"
    expect(line0).toBe('function() {}');
    expect(buffer.getLineCount()).toBe(1);
  });
});
