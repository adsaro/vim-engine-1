/**
 * Integration test for di" (delete inside quotes) keybinding
 */
import { VimExecutor } from '@vim-engine/core';
import { DeleteOperatorPlugin } from '@vim-engine/core';
import { InsideQuoteTextObject } from '@vim-engine/core';
import { InsertModePlugin } from '@vim-engine/core';
import { TextBuffer } from '@vim-engine/core';
import { CursorPosition } from '@vim-engine/core';
import { VIM_MODE } from '@vim-engine/core';

describe('di" keybinding integration', () => {
  let executor: VimExecutor;
  let buffer: TextBuffer;

  beforeEach(() => {
    executor = new VimExecutor();
    buffer = new TextBuffer();

    // Register required plugins
    executor.registerPlugin(new DeleteOperatorPlugin());
    executor.registerPlugin(new InsideQuoteTextObject());
    executor.registerPlugin(new InsertModePlugin());

    executor.initialize();
    executor.start();
  });

  afterEach(() => {
    executor.stop();
    executor.destroy();
  });

  it('should delete content inside double quotes', () => {
    buffer.insertLine(0, 'say "hello" world');
    executor.getExecutionContext().setBuffer(buffer);
    executor.getExecutionContext().setCursor(new CursorPosition(0, 7));
    executor.getExecutionContext().setMode(VIM_MODE.NORMAL);

    // Execute di" sequence
    executor.handleKeystroke('d');
    executor.handleKeystroke('i"');

    // Check that content inside quotes was deleted
    const line = buffer.getLine(0);
    expect(line).toBe('say "" world');
  });

  it('should delete content inside single quotes', () => {
    buffer.insertLine(0, "say 'hello' world");
    executor.getExecutionContext().setBuffer(buffer);
    executor.getExecutionContext().setCursor(new CursorPosition(0, 7));
    executor.getExecutionContext().setMode(VIM_MODE.NORMAL);

    // Execute di' sequence
    executor.handleKeystroke('d');
    executor.handleKeystroke("i'");

    // Check that content inside quotes was deleted
    const line = buffer.getLine(0);
    expect(line).toBe("say '' world");
  });

  it('should delete content inside backticks', () => {
    buffer.insertLine(0, 'say `hello` world');
    executor.getExecutionContext().setBuffer(buffer);
    executor.getExecutionContext().setCursor(new CursorPosition(0, 7));
    executor.getExecutionContext().setMode(VIM_MODE.NORMAL);

    // Execute di` sequence
    executor.handleKeystroke('d');
    executor.handleKeystroke('i`');

    // Check that content inside quotes was deleted
    const line = buffer.getLine(0);
    expect(line).toBe('say `` world');
  });

  it('should leave quotes in place', () => {
    buffer.insertLine(0, 'echo "test"');
    executor.getExecutionContext().setBuffer(buffer);
    executor.getExecutionContext().setCursor(new CursorPosition(0, 7));
    executor.getExecutionContext().setMode(VIM_MODE.NORMAL);

    executor.handleKeystroke('d');
    executor.handleKeystroke('i"');

    const line = buffer.getLine(0);
    expect(line).toBe('echo ""');
  });

  it('should work with cursor on opening quote', () => {
    buffer.insertLine(0, 'text "example" here');
    executor.getExecutionContext().setBuffer(buffer);
    executor.getExecutionContext().setCursor(new CursorPosition(0, 5)); // On opening quote
    executor.getExecutionContext().setMode(VIM_MODE.NORMAL);

    executor.handleKeystroke('d');
    executor.handleKeystroke('i"');

    const line = buffer.getLine(0);
    expect(line).toBe('text "" here');
  });

  it('should work with empty quotes', () => {
    buffer.insertLine(0, 'value "" end');
    executor.getExecutionContext().setBuffer(buffer);
    executor.getExecutionContext().setCursor(new CursorPosition(0, 7));
    executor.getExecutionContext().setMode(VIM_MODE.NORMAL);

    executor.handleKeystroke('d');
    executor.handleKeystroke('i"');

    const line = buffer.getLine(0);
    expect(line).toBe('value "" end');
  });

  it('should wait for quote character when typing d then i separately (regression test)', () => {
    buffer.insertLine(0, 'say "hello" world');
    executor.getExecutionContext().setBuffer(buffer);
    executor.getExecutionContext().setCursor(new CursorPosition(0, 7));
    executor.getExecutionContext().setMode(VIM_MODE.NORMAL);

    // Execute di" sequence separately
    executor.handleKeystroke('d');
    expect(executor.getCurrentMode()).toBe(VIM_MODE.OPERATOR_PENDING);

    executor.handleKeystroke('i');
    expect(executor.getCurrentMode()).toBe(VIM_MODE.OPERATOR_PENDING);

    executor.handleKeystroke('"');
    expect(executor.getCurrentMode()).toBe(VIM_MODE.NORMAL);

    // Check that content inside quotes was deleted
    const line = buffer.getLine(0);
    expect(line).toBe('say "" world');
  });
});
