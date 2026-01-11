/**
 * BMovementPlugin Tests (Capital B)
 */
import { BMovementPlugin } from '../.././plugins/movement/b-capital';
import { ExecutionContext } from '../../plugin/ExecutionContext';
import { VimState } from '../../state/VimState';
import { TextBuffer } from '../../state/TextBuffer';
import { CursorPosition } from '../../state/CursorPosition';
import { VIM_MODE } from '../../state/VimMode';

describe('BMovementPlugin (Capital B)', () => {
  let plugin: BMovementPlugin;
  let state: VimState;
  let context: ExecutionContext;

  beforeEach(() => {
    plugin = new BMovementPlugin();
  });

  describe('Metadata', () => {
    it('should have correct name', () => {
      expect(plugin.name).toBe('movement-B');
    });

    it('should have correct pattern', () => {
      expect(plugin.patterns).toEqual(['B']);
    });
  });

  describe('WORD movement on single line', () => {
    it('should move to previous WORD treating punctuation as part of WORD', () => {
      const buffer = new TextBuffer(['hello-world test-case']);
      state = new VimState(buffer);
      state.cursor = new CursorPosition(0, 12); // At 't' in 'test-case'
      state.mode = VIM_MODE.NORMAL;
      context = new ExecutionContext(state);

      plugin.execute(context);

      // Should move to 'h' in 'hello-world' (column 0), treating 'hello-world' as one WORD
      expect(context.getCursor().line).toBe(0);
      expect(context.getCursor().column).toBe(0);
    });

    it('should move through multiple WORDs backward', () => {
      const buffer = new TextBuffer(['one-word two-word three-word']);
      state = new VimState(buffer);
      state.cursor = new CursorPosition(0, 18); // At 't' in 'three-word' (start of WORD)
      state.mode = VIM_MODE.NORMAL;
      context = new ExecutionContext(state);

      plugin.execute(context);

      // Should move to 't' in 'two-word' (column 9)
      expect(context.getCursor().line).toBe(0);
      expect(context.getCursor().column).toBe(9);
    });

    it('should handle multiple spaces between WORDs', () => {
      const buffer = new TextBuffer(['hello   world']);
      state = new VimState(buffer);
      state.cursor = new CursorPosition(0, 8); // At 'w' in 'world'
      state.mode = VIM_MODE.NORMAL;
      context = new ExecutionContext(state);

      plugin.execute(context);

      // Should move to 'h' in 'hello' (column 0)
      expect(context.getCursor().line).toBe(0);
      expect(context.getCursor().column).toBe(0);
    });
  });

  describe('Multi-line movement', () => {
    it('should move to last WORD of previous line when at start of line', () => {
      const buffer = new TextBuffer(['first-word here', 'last-word']);
      state = new VimState(buffer);
      state.cursor = new CursorPosition(1, 0); // At 'l' in 'last-word'
      state.mode = VIM_MODE.NORMAL;
      context = new ExecutionContext(state);

      plugin.execute(context);

      // Should move to 'h' in 'here' on previous line (column 11)
      expect(context.getCursor().line).toBe(0);
      expect(context.getCursor().column).toBe(11);
    });

    it('should move to WORD when previous line ends with punctuation', () => {
      const buffer = new TextBuffer(['test-word.', 'next-word']);
      state = new VimState(buffer);
      state.cursor = new CursorPosition(1, 0); // At 'n' in 'next-word'
      state.mode = VIM_MODE.NORMAL;
      context = new ExecutionContext(state);

      plugin.execute(context);

      // Should move to 't' in 'test-word.' (column 0), treating 'test-word.' as one WORD
      expect(context.getCursor().line).toBe(0);
      expect(context.getCursor().column).toBe(0);
    });

    it('should skip empty lines and move to previous WORD', () => {
      const buffer = new TextBuffer(['first-word', '', 'middle-word']);
      state = new VimState(buffer);
      state.cursor = new CursorPosition(2, 0); // At 'm' in 'middle-word'
      state.mode = VIM_MODE.NORMAL;
      context = new ExecutionContext(state);

      plugin.execute(context);

      // Should move to 'f' in 'first-word' on line 0
      expect(context.getCursor().line).toBe(0);
      expect(context.getCursor().column).toBe(0);
    });

    it('should handle lines with trailing whitespace', () => {
      const buffer = new TextBuffer(['test-word   ', 'next-word']);
      state = new VimState(buffer);
      state.cursor = new CursorPosition(1, 0); // At 'n' in 'next-word'
      state.mode = VIM_MODE.NORMAL;
      context = new ExecutionContext(state);

      plugin.execute(context);

      // Should move to 't' in 'test-word' on previous line
      expect(context.getCursor().line).toBe(0);
      expect(context.getCursor().column).toBe(0);
    });

    it('should stay at same position when no more WORDs found', () => {
      const buffer = new TextBuffer(['first-word']);
      state = new VimState(buffer);
      state.cursor = new CursorPosition(0, 0); // At 'f' in 'first-word'
      state.mode = VIM_MODE.NORMAL;
      context = new ExecutionContext(state);

      plugin.execute(context);

      // Should stay at same position
      expect(context.getCursor().line).toBe(0);
      expect(context.getCursor().column).toBe(0);
    });
  });

  describe('Comparison with lowercase b', () => {
    it('should treat punctuation differently than lowercase b', () => {
      const buffer = new TextBuffer(['hello.world test']);
      state = new VimState(buffer);
      state.cursor = new CursorPosition(0, 12); // At 't' in 'test'
      state.mode = VIM_MODE.NORMAL;
      context = new ExecutionContext(state);

      plugin.execute(context);

      // Capital B treats 'hello.world' as one WORD, so it moves to 'h' at position 0
      expect(context.getCursor().line).toBe(0);
      expect(context.getCursor().column).toBe(0);
    });
  });

  describe('Edge cases', () => {
    it('should handle cursor in the middle of a WORD', () => {
      const buffer = new TextBuffer(['test-word']);
      state = new VimState(buffer);
      state.cursor = new CursorPosition(0, 5); // At '-' in 'test-word'
      state.mode = VIM_MODE.NORMAL;
      context = new ExecutionContext(state);

      plugin.execute(context);

      // Should move to start of current WORD 'test-word'
      expect(context.getCursor().line).toBe(0);
      expect(context.getCursor().column).toBe(0);
    });

    it('should handle single WORD on line', () => {
      const buffer = new TextBuffer(['only-word']);
      state = new VimState(buffer);
      state.cursor = new CursorPosition(0, 8); // At 'd' in 'only-word'
      state.mode = VIM_MODE.NORMAL;
      context = new ExecutionContext(state);

      plugin.execute(context);

      // Should move to start of the only WORD
      expect(context.getCursor().line).toBe(0);
      expect(context.getCursor().column).toBe(0);
    });
  });
});
