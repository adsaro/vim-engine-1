import { useCallback, useEffect, useRef, useState } from 'react';
import {
  VimExecutor as VimEngine,
  VimState,
  VimMode,
  HMovementPlugin,
  JMovementPlugin,
  KMovementPlugin,
  LMovementPlugin,
  ZeroMovementPlugin,
  CaretMovementPlugin,
  DollarMovementPlugin,
  PercentMovementPlugin,
  GUnderscoreMovementPlugin,
  GMovementPlugin,
  GGMovementPlugin,
  SearchPlugin,
  NMovementPlugin,
} from '@vim-engine/core';

interface UseVimEngineOptions {
  initialContent?: string;
  onStateChange?: (state: VimState) => void;
  onContentChange?: (content: string) => void;
}

interface UseVimEngineReturn {
  vimEngine: VimEngine | null;
  vimState: VimState;
  content: string;
  setContent: (content: string) => void;
  handleKeyDown: (event: KeyboardEvent) => void;
  handleKeystroke: (keystroke: string) => void;
  setMode: (mode: VimMode) => void;
  reset: () => void;
  focus: () => void;
  isFocused: boolean;
}

export function useVimEngine(options: UseVimEngineOptions = {}): UseVimEngineReturn {
  const { initialContent = '', onStateChange, onContentChange } = options;

  const [vimEngine, setVimEngine] = useState<VimEngine | null>(null);
  const [vimState, setVimState] = useState<VimState>(() => {
    const state = new VimState();
    if (initialContent) {
      state.buffer.setContent(initialContent);
    }
    return state;
  });
  const [content, setContent] = useState(initialContent);
  const [isFocused, setIsFocused] = useState(false);
  const engineRef = useRef<VimEngine | null>(null);

  // Initialize vim-engine
  useEffect(() => {
    const engine = new VimEngine();
    engine.initialize();

    // Register movement plugins
    engine.registerPlugin(new HMovementPlugin());
    engine.registerPlugin(new JMovementPlugin());
    engine.registerPlugin(new KMovementPlugin());
    engine.registerPlugin(new LMovementPlugin());
    engine.registerPlugin(new ZeroMovementPlugin());
    engine.registerPlugin(new CaretMovementPlugin());
    engine.registerPlugin(new DollarMovementPlugin());
    engine.registerPlugin(new PercentMovementPlugin());
    engine.registerPlugin(new GUnderscoreMovementPlugin());
    // Document navigation plugins
    engine.registerPlugin(new GMovementPlugin());
    engine.registerPlugin(new GGMovementPlugin());

    // Register search plugin
    engine.registerPlugin(new SearchPlugin());
    // Register n movement plugin for navigating search results
    engine.registerPlugin(new NMovementPlugin());

    engine.start();
    engineRef.current = engine;

    // Set initial state
    const state = engine.getState();
    if (initialContent) {
      state.buffer.setContent(initialContent);
    }
    setVimState(state);
    onStateChange?.(state);

    setVimEngine(engine);

    return () => {
      engine.stop();
      engine.destroy();
    };
  }, [initialContent, onStateChange]);

  const updateState = useCallback(() => {
    if (!engineRef.current) return;

    const state = engineRef.current.getState();
    setVimState(state);
    onStateChange?.(state);

    const newContent = state.buffer.getContent();
    if (newContent !== content) {
      setContent(newContent);
      onContentChange?.(newContent);
    }
  }, [content, onStateChange, onContentChange]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!engineRef.current) return;

      engineRef.current.handleKeyboardEvent(event);
      updateState();

      // Prevent default for common vim keys
      const vimKeys = [
        'h',
        'j',
        'k',
        'l',
        'w',
        'b',
        'e',
        '0',
        '$',
        'gg',
        'G',
        'i',
        'a',
        'o',
        'O',
        'I',
        'A',
        'v',
        'V',
        ':',
        '/',
        '?',
        'y',
        'd',
        'c',
        'p',
        'P',
        'x',
        'X',
        'u',
      ];

      const key = event.key.toLowerCase();
      const ctrlKey = event.ctrlKey || event.metaKey;

      if (vimKeys.includes(key) || ctrlKey || event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
      }
    },
    [updateState]
  );

  const handleKeystroke = useCallback(
    (keystroke: string) => {
      if (!engineRef.current) return;

      engineRef.current.handleKeystroke(keystroke);
      updateState();
    },
    [updateState]
  );

  const setMode = useCallback(
    (mode: VimMode) => {
      if (!engineRef.current) return;

      engineRef.current.setCurrentMode(mode);
      updateState();
    },
    [updateState]
  );

  const reset = useCallback(() => {
    if (!engineRef.current) return;

    const state = engineRef.current.getState();
    state.reset();
    if (initialContent) {
      state.buffer.setContent(initialContent);
    }
    updateState();
  }, [initialContent, updateState]);

  const focus = useCallback(() => {
    setIsFocused(true);
  }, []);

  return {
    vimEngine,
    vimState,
    content,
    setContent,
    handleKeyDown,
    handleKeystroke,
    setMode,
    reset,
    focus,
    isFocused,
  };
}
