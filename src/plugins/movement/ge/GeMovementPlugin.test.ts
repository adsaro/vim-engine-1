/**
 * GeMovementPlugin Tests
 */
import { GeMovementPlugin } from '../.././plugins/movement/ge/GeMovementPlugin';
import { ExecutionContext } from '../../plugin/ExecutionContext';
import { VimState } from '../../state/VimState';
import { TextBuffer } from '../../state/TextBuffer';
import { CursorPosition } from '../../state/CursorPosition';
import { VIM_MODE } from '../../state/VimMode';

describe('GeMovementPlugin', () => {
  let plugin: GeMovementPlugin;
  let state: VimState;
  let context: ExecutionContext;

  beforeEach(() => {
    plugin = new GeMovementPlugin();
  });

  describe('Metadata', () => {
    it('should have correct name', () => {
      expect(plugin.name).toBe('movement-ge');
    });

    it('should have correct pattern', () => {
      expect(plugin.patterns).toEqual(['ge']);
    });

    it('should have correct modes', () => {
      expect(plugin.modes).toEqual([VIM_MODE.NORMAL, VIM_MODE.VISUAL]);
    });
  });

  describe('Movement on single line', () => {
    it('should move to end of previous word', () => {
      const buffer = new TextBuffer(['hello world test']);
      state = new VimState(buffer);
      state.cursor = new CursorPosition(0, 11); // After 'd' in 'world'
      state.mode = VIM_MODE.NORMAL;
      context = new ExecutionContext(state);

      plugin.execute(context);

      // Should move to 'd' in 'world' (column 10)
      expect(context.getCursor().line).toBe(0);
      expect(context.getCursor().column).toBe(10);
    });

    it('should move to end of previous word when in middle of word', () => {
      const buffer = new TextBuffer(['hello world test']);
      state = new VimState(buffer);
      state.cursor = new CursorPosition(0, 13); // In middle of 'test'
      state.mode = VIM_MODE.NORMAL;
      context = new ExecutionContext(state);

      plugin.execute(context);

      // Should move to 'd' in 'world' (column 10)
      expect(context.getCursor().line).toBe(0);
      expect(context.getCursor().column).toBe(10);
    });

    it('should move to end of previous word when at end of line', () => {
      const buffer = new TextBuffer(['one two three four']);
      state = new VimState(buffer);
      state.cursor = new CursorPosition(0, 17); // At 'r' in 'four'
      state.mode = VIM_MODE.NORMAL;
      context = new ExecutionContext(state);

      plugin.execute(context);

      // Should move to last 'e' in 'three' (column 12)
      expect(context.getCursor().line).toBe(0);
      expect(context.getCursor().column).toBe(12);
    });

    it('should stay at same position when at start of line', () => {
      const buffer = new TextBuffer(['hello world']);
      state = new VimState(buffer);
      state.cursor = new CursorPosition(0, 0); // At 'h' in 'hello'
      state.mode = VIM_MODE.NORMAL;
      context = new ExecutionContext(state);

      plugin.execute(context);

      // Should stay at column 0
      expect(context.getCursor().line).toBe(0);
      expect(context.getCursor().column).toBe(0);
    });

    it('should handle multiple spaces between words', () => {
      const buffer = new TextBuffer(['hello   world']);
      state = new VimState(buffer);
      state.cursor = new CursorPosition(0, 10); // After 'd' in 'world'
      state.mode = VIM_MODE.NORMAL;
      context = new ExecutionContext(state);

      plugin.execute(context);

      // Should move to 'o' in 'hello' (column 4)
      expect(context.getCursor().line).toBe(0);
      expect(context.getCursor().column).toBe(4);
    });
  });

  describe('Multi-line movement', () => {
    it('should move to end of last word on previous line', () => {
      const buffer = new TextBuffer(['hello world', 'this is a test']);
      state = new VimState(buffer);
      state.cursor = new CursorPosition(1, 0); // At start of line 1
      state.mode = VIM_MODE.NORMAL;
      context = new ExecutionContext(state);

      plugin.execute(context);

      // Should move to 'd' in 'world' on line 0 (column 10)
      expect(context.getCursor().line).toBe(0);
      expect(context.getCursor().column).toBe(10);
    });

    it('should skip empty lines when moving backward', () => {
      const buffer = new TextBuffer(['hello world', '', 'test']);
      state = new VimState(buffer);
      state.cursor = new CursorPosition(2, 0); // At start of 'test'
      state.mode = VIM_MODE.NORMAL;
      context = new ExecutionContext(state);

      plugin.execute(context);

      // Should move to 'd' in 'world' on line 0 (column 10)
      expect(context.getCursor().line).toBe(0);
      expect(context.getCursor().column).toBe(10);
    });

    it('should handle lines with leading whitespace', () => {
      const buffer = new TextBuffer(['  hello world', 'test']);
      state = new VimState(buffer);
      state.cursor = new CursorPosition(1, 0); // At start of 'test'
      state.mode = VIM_MODE.NORMAL;
      context = new ExecutionContext(state);

      plugin.execute(context);

      // Should move to 'd' in 'world' on line 0 (column 12, accounting for leading spaces)
      expect(context.getCursor().line).toBe(0);
      expect(context.getCursor().column).toBe(12);
    });

    it('should stay at same position when no more words found', () => {
      const buffer = new TextBuffer(['hello world']);
      state = new VimState(buffer);
      state.cursor = new CursorPosition(0, 0); // At start of line
      state.mode = VIM_MODE.NORMAL;
      context = new ExecutionContext(state);

      plugin.execute(context);

      // Should stay at column 0
      expect(context.getCursor().line).toBe(0);
      expect(context.getCursor().column).toBe(0);
    });
  });

  describe('Multiple ge presses', () => {
    it('should move through multiple words with repeated ge', () => {
      const buffer = new TextBuffer(['one two three four']);
      state = new VimState(buffer);
      state.cursor = new CursorPosition(0, 17); // At 'r' in 'four'
      state.mode = VIM_MODE.NORMAL;
      context = new ExecutionContext(state);

      // First ge
      plugin.execute(context);
      expect(context.getCursor().column).toBe(12); // last 'e' in 'three'

      // Second ge
      plugin.execute(context);
      expect(context.getCursor().column).toBe(6); // 'e' in 'two'

      // Third ge
      plugin.execute(context);
      expect(context.getCursor().column).toBe(2); // 'e' in 'one'
    });
  });

  describe('Punctuation handling', () => {
    it('should treat punctuation as word characters', () => {
      const buffer = new TextBuffer(['hello.world test']);
      state = new VimState(buffer);
      state.cursor = new CursorPosition(0, 12); // After 'e' in 'test'
      state.mode = VIM_MODE.NORMAL;
      context = new ExecutionContext(state);

      plugin.execute(context);

      // Should move to 'd' in 'hello.world' (column 10)
      expect(context.getCursor().line).toBe(0);
      expect(context.getCursor().column).toBe(10);
    });

    it('should handle multiple punctuation characters', () => {
      const buffer = new TextBuffer(['hello...world test']);
      state = new VimState(buffer);
      state.cursor = new CursorPosition(0, 16); // After 'e' in 'test'
      state.mode = VIM_MODE.NORMAL;
      context = new ExecutionContext(state);

      plugin.execute(context);

      // Should move to 'd' in 'hello...world' (column 12)
      expect(context.getCursor().line).toBe(0);
      expect(context.getCursor().column).toBe(12);
    });
  });
});
