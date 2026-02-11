/**
 * End-to-end test for di{ keybinding
 * 
 * This test verifies that the di{ keybinding works correctly from start to finish.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { VimExecutor } from '../../src/core/VimExecutor';
import { DeleteOperatorPlugin } from '../../src/plugins/operators/delete/DeleteOperatorPlugin';
import { InsideCurlyBraceTextObject } from '../../src/plugins/textobjects/i-curly/InsideCurlyBraceTextObject';
import { TextBuffer } from '../../src/state/TextBuffer';
import { CursorPosition } from '../../src/state/CursorPosition';
import { VIM_MODE } from '../../src/state/VimMode';

describe('di{ keybinding end-to-end', () => {
  let executor: VimExecutor;
  let buffer: TextBuffer;

  beforeEach(() => {
    executor = new VimExecutor();
    buffer = new TextBuffer();

    // Register required plugins
    executor.registerPlugin(new DeleteOperatorPlugin());
    executor.registerPlugin(new InsideCurlyBraceTextObject());

    executor.initialize();
    executor.start();
  });

  afterEach(() => {
    executor.stop();
    executor.destroy();
  });

  it('should delete content inside curly braces', () => {
    buffer.setContent('{hello world}');
    executor.getExecutionContext().setBuffer(buffer);
    executor.getExecutionContext().setCursor(new CursorPosition(0, 7));
    executor.getExecutionContext().setMode(VIM_MODE.NORMAL);

    // Execute di{ sequence
    executor.handleKeystroke('d');
    executor.handleKeystroke('i{');

    // Check that content inside braces was deleted
    const line = buffer.getLine(0);
    expect(line).toBe('{}');
  });

  it('should delete content inside curly braces with separate keystrokes', () => {
    buffer.setContent('{hello world}');
    executor.getExecutionContext().setBuffer(buffer);
    executor.getExecutionContext().setCursor(new CursorPosition(0, 7));
    executor.getExecutionContext().setMode(VIM_MODE.NORMAL);

    // Execute di{ sequence with separate keystrokes
    executor.handleKeystroke('d');
    expect(executor.getCurrentMode()).toBe(VIM_MODE.OPERATOR_PENDING);
    
    executor.handleKeystroke('i');
    // Buffer 'i' is now part of 'di', should stay in operator-pending
    expect(executor.getCurrentMode()).toBe(VIM_MODE.OPERATOR_PENDING);
    
    executor.handleKeystroke('{');
    // Now the full 'di{' should match and execute
    
    expect(executor.getCurrentMode()).toBe(VIM_MODE.NORMAL);

    // Check that content inside braces was deleted
    const line = buffer.getLine(0);
    expect(line).toBe('{}');
  });

  it('should handle nested braces correctly', () => {
    buffer.setContent('{outer {inner}}');
    executor.getExecutionContext().setBuffer(buffer);
    executor.getExecutionContext().setCursor(new CursorPosition(0, 10)); // On 'n' in "inner"
    executor.getExecutionContext().setMode(VIM_MODE.NORMAL);

    // Execute di{
    executor.handleKeystroke('d');
    executor.handleKeystroke('i{');

    // Should delete inner content only
    const line = buffer.getLine(0);
    expect(line).toBe('{outer {}}');
  });

  it('should handle multi-line braces', () => {
    buffer.setContent([
      'function() {',
      '  return 42;',
      '}',
    ].join('\n'));
    executor.getExecutionContext().setBuffer(buffer);
    executor.getExecutionContext().setCursor(new CursorPosition(1, 5)); // On 'return'
    executor.getExecutionContext().setMode(VIM_MODE.NORMAL);

    // Execute di{
    executor.handleKeystroke('d');
    executor.handleKeystroke('i{');

    // Should delete content inside braces, leaving empty braces
    const line0 = buffer.getLine(0);
    expect(line0).toBe('function() {}');
  });

  it('should leave curly braces in place', () => {
    buffer.setContent('const obj = { name: "test" };');
    executor.getExecutionContext().setBuffer(buffer);
    executor.getExecutionContext().setCursor(new CursorPosition(0, 20));
    executor.getExecutionContext().setMode(VIM_MODE.NORMAL);

    executor.handleKeystroke('d');
    executor.handleKeystroke('i{');

    const line = buffer.getLine(0);
    expect(line).toBe('const obj = {};');
  });
});
