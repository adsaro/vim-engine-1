/**
 * Integration test for di< (delete inside angle brackets) keybinding
 */
import { VimExecutor } from '@vim-engine/core';
import { DeleteOperatorPlugin } from '@vim-engine/core';
import { InsideAngleBracketTextObject } from '@vim-engine/core';
import { InsertModePlugin } from '@vim-engine/core';
import { TextBuffer } from '@vim-engine/core';
import { CursorPosition } from '@vim-engine/core';
import { VIM_MODE } from '@vim-engine/core';

describe('di< keybinding integration', () => {
  let executor: VimExecutor;
  let buffer: TextBuffer;

  beforeEach(() => {
    executor = new VimExecutor();
    buffer = new TextBuffer();

    // Register required plugins
    executor.registerPlugin(new DeleteOperatorPlugin());
    executor.registerPlugin(new InsideAngleBracketTextObject());
    executor.registerPlugin(new InsertModePlugin());

    executor.initialize();
    executor.start();
  });

  afterEach(() => {
    executor.stop();
    executor.destroy();
  });

  it('should delete content inside angle brackets', () => {
    buffer.insertLine(0, 'const tag = <hello>world</hello>;');
    executor.getExecutionContext().setBuffer(buffer);
    executor.getExecutionContext().setCursor(new CursorPosition(0, 14)); // Inside brackets (after '<')
    executor.getExecutionContext().setMode(VIM_MODE.NORMAL);

    // Execute di< sequence
    executor.handleKeystroke('d');
    executor.handleKeystroke('i<');

    // Check that content inside brackets was deleted
    const line = buffer.getLine(0);
    expect(line).toBe('const tag = <>world</hello>;');
  });

  it('should delete content inside angle brackets multiline', () => {
    buffer.insertLine(0, 'const tag = <');
    buffer.insertLine(1, '  hello');
    buffer.insertLine(2, '>;');
    executor.getExecutionContext().setBuffer(buffer);
    executor.getExecutionContext().setCursor(new CursorPosition(1, 2)); // Inside tag
    executor.getExecutionContext().setMode(VIM_MODE.NORMAL);

    // Execute di< sequence
    executor.handleKeystroke('d');
    executor.handleKeystroke('i<');

    // Expected behavior: const tag = <>;
    // The implementation should collapse the multiline tag
    const line0 = buffer.getLine(0);
    expect(line0).toBe('const tag = <>;');
    expect(buffer.getLineCount()).toBe(1);
  });

  it('should handle nested angle brackets', () => {
    buffer.insertLine(0, 'const tag = <<inner>>;');
    executor.getExecutionContext().setBuffer(buffer);
    executor.getExecutionContext().setCursor(new CursorPosition(0, 15)); // Inside inner brackets
    executor.getExecutionContext().setMode(VIM_MODE.NORMAL);

    // Execute di< sequence
    executor.handleKeystroke('d');
    executor.handleKeystroke('i<');

    // Should delete content inside inner brackets
    const line = buffer.getLine(0);
    expect(line).toBe('const tag = <<>>;');
  });

  it('should handle cursor on opening bracket', () => {
    buffer.insertLine(0, 'const tag = <hello>world</hello>;');
    executor.getExecutionContext().setBuffer(buffer);
    executor.getExecutionContext().setCursor(new CursorPosition(0, 13)); // After opening bracket
    executor.getExecutionContext().setMode(VIM_MODE.NORMAL);

    // Execute di< sequence
    executor.handleKeystroke('d');
    executor.handleKeystroke('i<');

    // Check that content inside brackets was deleted
    const line = buffer.getLine(0);
    expect(line).toBe('const tag = <>world</hello>;');
  });

  it('should handle empty angle brackets', () => {
    buffer.insertLine(0, 'const tag = <>;');
    executor.getExecutionContext().setBuffer(buffer);
    executor.getExecutionContext().setCursor(new CursorPosition(0, 13)); // After opening bracket
    executor.getExecutionContext().setMode(VIM_MODE.NORMAL);

    // Execute di< sequence
    executor.handleKeystroke('d');
    executor.handleKeystroke('i<');

    // Should remain unchanged (nothing to delete)
    const line = buffer.getLine(0);
    expect(line).toBe('const tag = <>;');
  });

  it('should handle string with angle brackets', () => {
    buffer.insertLine(0, 'const str = "hello <world>";');
    executor.getExecutionContext().setBuffer(buffer);
    executor.getExecutionContext().setCursor(new CursorPosition(0, 20)); // Inside string brackets
    executor.getExecutionContext().setMode(VIM_MODE.NORMAL);

    // Execute di< sequence
    executor.handleKeystroke('d');
    executor.handleKeystroke('i<');

    // Should delete content inside brackets in string
    const line = buffer.getLine(0);
    expect(line).toBe('const str = "hello <>";');
  });

  it('should handle multiple angle bracket pairs', () => {
    buffer.insertLine(0, 'const tag1 = <hello>; const tag2 = <world>;');
    executor.getExecutionContext().setBuffer(buffer);
    executor.getExecutionContext().setCursor(new CursorPosition(0, 16)); // Inside first brackets
    executor.getExecutionContext().setMode(VIM_MODE.NORMAL);

    // Execute di< sequence
    executor.handleKeystroke('d');
    executor.handleKeystroke('i<');

    // Should delete content inside first brackets only
    const line = buffer.getLine(0);
    expect(line).toBe('const tag1 = <>; const tag2 = <world>;');
  });

  it('should handle HTML-like content', () => {
    buffer.insertLine(0, '<p>Hello World</p>');
    executor.getExecutionContext().setBuffer(buffer);
    executor.getExecutionContext().setCursor(new CursorPosition(0, 1)); // Inside first tag
    executor.getExecutionContext().setMode(VIM_MODE.NORMAL);

    // Execute di< sequence
    executor.handleKeystroke('d');
    executor.handleKeystroke('i<');

    // Should delete content inside first tag (the 'p' in '<p>')
    const line = buffer.getLine(0);
    expect(line).toBe('<>Hello World</p>');
  });

  it('should handle self-closing tags (no closing bracket)', () => {
    buffer.insertLine(0, 'const tag = <img src="test.jpg" />;');
    executor.getExecutionContext().setBuffer(buffer);
    executor.getExecutionContext().setCursor(new CursorPosition(0, 14)); // Inside tag
    executor.getExecutionContext().setMode(VIM_MODE.NORMAL);

    // Execute di< sequence
    executor.handleKeystroke('d');
    executor.handleKeystroke('i<');

    // Should delete content inside angle brackets (the 'img src="test.jpg"')
    const line = buffer.getLine(0);
    expect(line).toBe('const tag = <>;');
  });

  it('should handle cursor at the end of line', () => {
    buffer.insertLine(0, 'const tag = <hello>world</hello>');
    executor.getExecutionContext().setBuffer(buffer);
    executor.getExecutionContext().setCursor(new CursorPosition(0, 28)); // At end of line
    executor.getExecutionContext().setMode(VIM_MODE.NORMAL);

    // Execute di< sequence
    executor.handleKeystroke('d');
    executor.handleKeystroke('i<');

    // Cursor is at end of line, so it finds the last < and matches it with last >
    // This is </hello>, so it deletes /hello, leaving <hello>world<>
    const line = buffer.getLine(0);
    expect(line).toBe('const tag = <hello>world<>');
  });
});
