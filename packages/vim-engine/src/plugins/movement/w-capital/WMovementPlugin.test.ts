/**
 * WMovementPlugin Tests (Capital W)
 */
import { WMovementPlugin } from '../.././plugins/movement/w-capital';
import { ExecutionContext } from '../../plugin/ExecutionContext';
import { VimState } from '../../state/VimState';
import { TextBuffer } from '../../state/TextBuffer';
import { CursorPosition } from '../../state/CursorPosition';
import { VIM_MODE } from '../../state/VimMode';

describe('WMovementPlugin (Capital W)', () => {
  let plugin: WMovementPlugin;
  let state: VimState;
  let context: ExecutionContext;

  beforeEach(() => {
    plugin = new WMovementPlugin();
  });

  describe('Metadata', () => {
    it('should have correct name', () => {
      expect(plugin.name).toBe('movement-W');
    });

    it('should have correct pattern', () => {
      expect(plugin.patterns).toEqual(['W']);
    });
  });

  describe('WORD movement on single line', () => {
    it('should move to next WORD treating punctuation as part of WORD', () => {
      const buffer = new TextBuffer(['capital-w only uses white-spaces']);
      state = new VimState(buffer);
      state.cursor = new CursorPosition(0, 0); // At 'c' in 'capital-w'
      state.mode = VIM_MODE.NORMAL;
      context = new ExecutionContext(state);

      plugin.execute(context);

      // Should move to 'o' in 'only' (column 10), treating 'capital-w' as one WORD
      expect(context.getCursor().line).toBe(0);
      expect(context.getCursor().column).toBe(10);
    });

    it('should move through multiple WORDs', () => {
      const buffer = new TextBuffer(['hello-world test-case example']);
      state = new VimState(buffer);
      state.cursor = new CursorPosition(0, 0); // At 'h' in 'hello-world'
      state.mode = VIM_MODE.NORMAL;
      context = new ExecutionContext(state);

      plugin.execute(context);

      // Should move to 't' in 'test-case' (column 12)
      expect(context.getCursor().line).toBe(0);
      expect(context.getCursor().column).toBe(12);
    });

    it('should handle multiple spaces between WORDs', () => {
      const buffer = new TextBuffer(['hello   world']);
      state = new VimState(buffer);
      state.cursor = new CursorPosition(0, 0); // At 'h' in 'hello'
      state.mode = VIM_MODE.NORMAL;
      context = new ExecutionContext(state);

      plugin.execute(context);

      // Should move to 'w' in 'world' (column 8)
      expect(context.getCursor().line).toBe(0);
      expect(context.getCursor().column).toBe(8);
    });
  });

  describe('Multi-line movement', () => {
    it('should move to first WORD of next line when at end of line', () => {
      const buffer = new TextBuffer(['hello-world test', 'next-word here']);
      state = new VimState(buffer);
      state.cursor = new CursorPosition(0, 15); // At 't' in 'test'
      state.mode = VIM_MODE.NORMAL;
      context = new ExecutionContext(state);

      plugin.execute(context);

      // Should move to 'n' in 'next-word' on next line
      expect(context.getCursor().line).toBe(1);
      expect(context.getCursor().column).toBe(0);
    });

    it('should move to first WORD when next line starts with punctuation', () => {
      const buffer = new TextBuffer(['last-word here', '- test-word']);
      state = new VimState(buffer);
      state.cursor = new CursorPosition(0, 13); // At 'e' in 'here'
      state.mode = VIM_MODE.NORMAL;
      context = new ExecutionContext(state);

      plugin.execute(context);

      // Should move to '-' on next line
      expect(context.getCursor().line).toBe(1);
      expect(context.getCursor().column).toBe(0);
    });

    it('should skip empty lines and move to first WORD', () => {
      const buffer = new TextBuffer(['last-word', '', 'first-word here']);
      state = new VimState(buffer);
      state.cursor = new CursorPosition(0, 8); // At 'd' in 'last-word'
      state.mode = VIM_MODE.NORMAL;
      context = new ExecutionContext(state);

      plugin.execute(context);

      // Should move to 'f' in 'first-word' on line 2
      expect(context.getCursor().line).toBe(2);
      expect(context.getCursor().column).toBe(0);
    });

    it('should handle lines with leading whitespace', () => {
      const buffer = new TextBuffer(['last-word', '  first-word']);
      state = new VimState(buffer);
      state.cursor = new CursorPosition(0, 8); // At 'd' in 'last-word'
      state.mode = VIM_MODE.NORMAL;
      context = new ExecutionContext(state);

      plugin.execute(context);

      // Should move to 'f' in 'first-word', skipping leading whitespace
      expect(context.getCursor().line).toBe(1);
      expect(context.getCursor().column).toBe(2);
    });

    it('should stay at same position when no more WORDs found', () => {
      const buffer = new TextBuffer(['last-word']);
      state = new VimState(buffer);
      state.cursor = new CursorPosition(0, 8); // At 'd' in 'last-word'
      state.mode = VIM_MODE.NORMAL;
      context = new ExecutionContext(state);

      plugin.execute(context);

      // Should stay at same position
      expect(context.getCursor().line).toBe(0);
      expect(context.getCursor().column).toBe(8);
    });
  });

  describe('Comparison with lowercase w', () => {
    it('should treat punctuation differently than lowercase w', () => {
      const buffer = new TextBuffer(['hello.world test']);
      state = new VimState(buffer);
      state.cursor = new CursorPosition(0, 0); // At 'h' in 'hello'
      state.mode = VIM_MODE.NORMAL;
      context = new ExecutionContext(state);

      plugin.execute(context);

      // Capital W treats 'hello.world' as one WORD, so it moves to 't' in 'test'
      expect(context.getCursor().line).toBe(0);
      expect(context.getCursor().column).toBe(12);
    });
  });
});
