/**
 * Integration test for di[ (delete inside square brackets) keybinding
 */
import { VimExecutor } from '@vim-engine/core';
import { DeleteOperatorPlugin } from '@vim-engine/core';
import { InsideSquareBracketTextObject } from '@vim-engine/core';
import { InsertModePlugin } from '@vim-engine/core';
import { TextBuffer } from '@vim-engine/core';
import { CursorPosition } from '@vim-engine/core';
import { VIM_MODE } from '@vim-engine/core';

describe('di[ keybinding integration', () => {
  let executor: VimExecutor;
  let buffer: TextBuffer;

  beforeEach(() => {
    executor = new VimExecutor();
    buffer = new TextBuffer();

    // Register required plugins
    executor.registerPlugin(new DeleteOperatorPlugin());
    executor.registerPlugin(new InsideSquareBracketTextObject());
    executor.registerPlugin(new InsertModePlugin());

    executor.initialize();
    executor.start();
  });

  afterEach(() => {
    executor.stop();
    executor.destroy();
  });

  it('should delete content inside square brackets', () => {
    buffer.insertLine(0, 'const arr = [1, 2, 3];');
    executor.getExecutionContext().setBuffer(buffer);
    executor.getExecutionContext().setCursor(new CursorPosition(0, 13)); // Inside brackets (after '[')
    executor.getExecutionContext().setMode(VIM_MODE.NORMAL);

    // Execute di[ sequence
    executor.handleKeystroke('d');
    executor.handleKeystroke('i[');

    // Check that content inside brackets was deleted
    const line = buffer.getLine(0);
    expect(line).toBe('const arr = [];');
  });

  it('should delete content inside square brackets multiline', () => {
    buffer.insertLine(0, 'const arr = [');
    buffer.insertLine(1, '  1, 2, 3,');
    buffer.insertLine(2, '];');
    executor.getExecutionContext().setBuffer(buffer);
    executor.getExecutionContext().setCursor(new CursorPosition(1, 2)); // Inside array
    executor.getExecutionContext().setMode(VIM_MODE.NORMAL);

    // Execute di[ sequence
    executor.handleKeystroke('d');
    executor.handleKeystroke('i[');

    // Expected behavior: const arr = [];
    // The implementation should collapse the multiline array
    const line0 = buffer.getLine(0);
    expect(line0).toBe('const arr = [];');
    expect(buffer.getLineCount()).toBe(1);
  });

  it('should handle nested square brackets', () => {
    buffer.insertLine(0, 'const arr = [[1, 2], [3, 4]];');
    executor.getExecutionContext().setBuffer(buffer);
    executor.getExecutionContext().setCursor(new CursorPosition(0, 14)); // Inside inner brackets
    executor.getExecutionContext().setMode(VIM_MODE.NORMAL);

    // Execute di[ sequence
    executor.handleKeystroke('d');
    executor.handleKeystroke('i[');

    // Should delete content inside inner brackets
    const line = buffer.getLine(0);
    expect(line).toBe('const arr = [[], [3, 4]];');
  });

  it('should handle cursor on opening bracket', () => {
    buffer.insertLine(0, 'const arr = [1, 2, 3];');
    executor.getExecutionContext().setBuffer(buffer);
    executor.getExecutionContext().setCursor(new CursorPosition(0, 13)); // After opening bracket
    executor.getExecutionContext().setMode(VIM_MODE.NORMAL);

    // Execute di[ sequence
    executor.handleKeystroke('d');
    executor.handleKeystroke('i[');

    // Check that content inside brackets was deleted
    const line = buffer.getLine(0);
    expect(line).toBe('const arr = [];');
  });

  it('should handle empty square brackets', () => {
    buffer.insertLine(0, 'const arr = [];');
    executor.getExecutionContext().setBuffer(buffer);
    executor.getExecutionContext().setCursor(new CursorPosition(0, 13)); // After opening bracket
    executor.getExecutionContext().setMode(VIM_MODE.NORMAL);

    // Execute di[ sequence
    executor.handleKeystroke('d');
    executor.handleKeystroke('i[');

    // Should remain unchanged (nothing to delete)
    const line = buffer.getLine(0);
    expect(line).toBe('const arr = [];');
  });

  it('should handle string with square brackets', () => {
    buffer.insertLine(0, 'const str = "hello [world]";');
    executor.getExecutionContext().setBuffer(buffer);
    executor.getExecutionContext().setCursor(new CursorPosition(0, 20)); // Inside string brackets
    executor.getExecutionContext().setMode(VIM_MODE.NORMAL);

    // Execute di[ sequence
    executor.handleKeystroke('d');
    executor.handleKeystroke('i[');

    // Should delete content inside brackets in string
    const line = buffer.getLine(0);
    expect(line).toBe('const str = "hello []";');
  });

  it('should handle multiple square bracket pairs', () => {
    buffer.insertLine(0, 'const arr1 = [1]; const arr2 = [2];');
    executor.getExecutionContext().setBuffer(buffer);
    executor.getExecutionContext().setCursor(new CursorPosition(0, 14)); // Inside first brackets
    executor.getExecutionContext().setMode(VIM_MODE.NORMAL);

    // Execute di[ sequence
    executor.handleKeystroke('d');
    executor.handleKeystroke('i[');

    // Should delete content inside first brackets only
    const line = buffer.getLine(0);
    expect(line).toBe('const arr1 = []; const arr2 = [2];');
  });
});
