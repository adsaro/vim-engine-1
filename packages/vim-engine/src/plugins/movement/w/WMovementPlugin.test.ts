/**
 * WMovementPlugin Tests
 */
import { WMovementPlugin } from '../../plugins/movement';
import { ExecutionContext } from '../../plugin/ExecutionContext';
import { VimState } from '../../state/VimState';
import { TextBuffer } from '../../state/TextBuffer';
import { CursorPosition } from '../../state/CursorPosition';
import { VIM_MODE } from '../../state/VimMode';

describe('WMovementPlugin', () => {
  let plugin: WMovementPlugin;
  let state: VimState;
  let context: ExecutionContext;

  beforeEach(() => {
    plugin = new WMovementPlugin();
  });

  describe('Multi-line movement', () => {
    it('should move to first word of next line when at end of line', () => {
      const buffer = new TextBuffer(['hello world', 'foo bar']);
      state = new VimState(buffer);
      state.cursor = new CursorPosition(0, 10); // At 'd' in 'world'
      state.mode = VIM_MODE.NORMAL;
      context = new ExecutionContext(state);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(1);
      expect(context.getCursor().column).toBe(0); // At 'f' in 'foo'
    });

    it('should move to first word of next line when at last word', () => {
      const buffer = new TextBuffer(['hello world test', 'foo bar baz']);
      state = new VimState(buffer);
      state.cursor = new CursorPosition(0, 12); // At 't' in 'test'
      state.mode = VIM_MODE.NORMAL;
      context = new ExecutionContext(state);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(1);
      expect(context.getCursor().column).toBe(0); // At 'f' in 'foo'
    });

    it('should move to first word when next line starts with word character', () => {
      const buffer = new TextBuffer(['last word here', 'firstword secondword']);
      state = new VimState(buffer);
      state.cursor = new CursorPosition(0, 14); // At 'e' in 'here'
      state.mode = VIM_MODE.NORMAL;
      context = new ExecutionContext(state);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(1);
      expect(context.getCursor().column).toBe(0); // At 'f' in 'firstword'
    });

    it('should skip empty lines and move to first word', () => {
      const buffer = new TextBuffer(['last word', '', 'first word']);
      state = new VimState(buffer);
      state.cursor = new CursorPosition(0, 9); // At 'd' in 'word'
      state.mode = VIM_MODE.NORMAL;
      context = new ExecutionContext(state);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(2);
      expect(context.getCursor().column).toBe(0); // At 'f' in 'first'
    });

    it('should handle lines with leading whitespace', () => {
      const buffer = new TextBuffer(['last word', '  first word']);
      state = new VimState(buffer);
      state.cursor = new CursorPosition(0, 9); // At 'd' in 'word'
      state.mode = VIM_MODE.NORMAL;
      context = new ExecutionContext(state);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(1);
      expect(context.getCursor().column).toBe(2); // At 'f' in 'first'
    });

    it('should stay at same position when no more words found', () => {
      const buffer = new TextBuffer(['last word']);
      state = new VimState(buffer);
      state.cursor = new CursorPosition(0, 9); // At 'd' in 'word'
      state.mode = VIM_MODE.NORMAL;
      context = new ExecutionContext(state);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(0);
      expect(context.getCursor().column).toBe(9); // Stayed at same position
    });
  });

  describe('Single line movement', () => {
    it('should move to next word on same line', () => {
      const buffer = new TextBuffer(['hello world foo']);
      state = new VimState(buffer);
      state.cursor = new CursorPosition(0, 0); // At 'h' in 'hello'
      state.mode = VIM_MODE.NORMAL;
      context = new ExecutionContext(state);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(0);
      expect(context.getCursor().column).toBe(6); // At 'w' in 'world'
    });

    it('should move through multiple words', () => {
      const buffer = new TextBuffer(['hello world foo']);
      state = new VimState(buffer);
      state.cursor = new CursorPosition(0, 6); // At 'w' in 'world'
      state.mode = VIM_MODE.NORMAL;
      context = new ExecutionContext(state);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(0);
      expect(context.getCursor().column).toBe(12); // At 'f' in 'foo'
    });

    it('should handle punctuation as word boundary', () => {
      const buffer = new TextBuffer(['hello.world foo']);
      state = new VimState(buffer);
      state.cursor = new CursorPosition(0, 0); // At 'h' in 'hello'
      state.mode = VIM_MODE.NORMAL;
      context = new ExecutionContext(state);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(0);
      expect(context.getCursor().column).toBe(5); // At '.' punctuation
    });
  });

  describe('desiredColumn preservation', () => {
    it('should update desiredColumn when moving to a new position', () => {
      const buffer = new TextBuffer(['hello world foo']);
      state = new VimState(buffer);
      state.cursor = new CursorPosition(0, 0);
      state.mode = VIM_MODE.NORMAL;
      context = new ExecutionContext(state);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(6);
      expect(context.getCursor().desiredColumn).toBe(6);
    });

    it('should update desiredColumn when moving to next line', () => {
      const buffer = new TextBuffer(['hello world', 'foo bar']);
      state = new VimState(buffer);
      state.cursor = new CursorPosition(0, 10); // At end of first line
      state.mode = VIM_MODE.NORMAL;
      context = new ExecutionContext(state);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(1);
      expect(context.getCursor().column).toBe(0);
      expect(context.getCursor().desiredColumn).toBe(0);
    });
  });
});
