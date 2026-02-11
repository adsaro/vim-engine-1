import { describe, it, expect } from 'vitest';
import { InsideCurlyBraceTextObject } from '../../src/plugins/textobjects/i-curly/InsideCurlyBraceTextObject';
import { InsideQuoteTextObject } from '../../src/plugins/textobjects/iquote/InsideQuoteTextObject';
import { VimExecutor } from '../../src/core/VimExecutor';
import { DeleteOperatorPlugin } from '../../src/plugins/operators/delete/DeleteOperatorPlugin';
import { TextBuffer } from '../../src/state/TextBuffer';
import { CursorPosition } from '../../src/state/CursorPosition';
import { VIM_MODE } from '../../src/state/VimMode';

describe('Debug pattern matching', () => {
  it('should compare patterns', () => {
    const curlyPlugin = new InsideCurlyBraceTextObject();
    const quotePlugin = new InsideQuoteTextObject();

    console.log('Curly plugin patterns:', curlyPlugin.patterns);
    console.log('Quote plugin patterns:', quotePlugin.patterns);

    // Check if i{ starts with i
    console.log('i{.startsWith("i"):', 'i{'.startsWith('i'));
    console.log('i".startsWith("i"):', 'i"'.startsWith('i'));

    expect(curlyPlugin.patterns).toContain('i{');
    expect(quotePlugin.patterns).toContain('i"');
  });

  it('should debug router patterns', () => {
    const executor = new VimExecutor();
    executor.registerPlugin(new DeleteOperatorPlugin());
    executor.registerPlugin(new InsideCurlyBraceTextObject());
    executor.registerPlugin(new InsideQuoteTextObject());

    const context = executor.getExecutionContext();
    const router = (executor as unknown as { commandRouter: { getAllPatterns: () => string[] } }).commandRouter;
    
    console.log('All registered patterns:', router.getAllPatterns());
    
    // Check pattern matching
    const curlyPlugin = router.getAllPatterns().find(p => p === 'i{');
    const quotePlugin = router.getAllPatterns().find(p => p === 'i"');
    
    console.log('Found i{ pattern:', curlyPlugin);
    console.log('Found i" pattern:', quotePlugin);
  });
});
