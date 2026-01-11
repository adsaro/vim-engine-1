import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import {
  VimExecutor as VimEngine,
  VimState,
  VimMode,
  HMovementPlugin,
  JMovementPlugin,
  KMovementPlugin,
  LMovementPlugin,
  WordMovementPlugin,
  CapitalWordMovementPlugin,
  BackwardMovementPlugin,
  CapitalBackwardMovementPlugin,
  EMovementPlugin,
  GeMovementPlugin,
} from '@vim-engine/core';

interface VimContextType {
  vimEngine: VimEngine | null;
  vimState: VimState;
  content: string;
  setContent: (content: string) => void;
  handleKeyDown: (event: React.KeyboardEvent) => void;
  handleKeystroke: (keystroke: string) => void;
  setMode: (mode: VimMode) => void;
  reset: () => void;
}

const VimContext = createContext<VimContextType | null>(null);

export function useVim(): VimContextType {
  const context = useContext(VimContext);
  if (!context) {
    throw new Error('useVim must be used within a VimProvider');
  }
  return context;
}

interface VimProviderProps {
  children: ReactNode;
  initialContent?: string;
}

export function VimProvider({ children, initialContent = '' }: VimProviderProps) {
  const [vimEngine, setVimEngine] = useState<VimEngine | null>(null);
  const [vimState, setVimState] = useState<VimState>(() => {
    const state = new VimState();
    if (initialContent) {
      state.buffer.setContent(initialContent);
    }
    return state;
  });
  const [content, setContent] = useState(initialContent);

  // Initialize vim-engine
  useEffect(() => {
    const engine = new VimEngine();
    engine.initialize();

    // Register movement plugins
    engine.registerPlugin(new HMovementPlugin());
    engine.registerPlugin(new JMovementPlugin());
    engine.registerPlugin(new KMovementPlugin());
    engine.registerPlugin(new LMovementPlugin());
    engine.registerPlugin(new WordMovementPlugin());
    engine.registerPlugin(new CapitalWordMovementPlugin());
    engine.registerPlugin(new BackwardMovementPlugin());
    engine.registerPlugin(new CapitalBackwardMovementPlugin());
    engine.registerPlugin(new EMovementPlugin());
    engine.registerPlugin(new GeMovementPlugin());

    engine.start();

    // Set initial state
    const state = engine.getState();
    if (initialContent) {
      state.buffer.setContent(initialContent);
    }
    setVimState(state);

    setVimEngine(engine);

    return () => {
      engine.stop();
      engine.destroy();
    };
  }, [initialContent]);

  const updateState = useCallback(() => {
    if (!vimEngine) return;

    const state = vimEngine.getState();
    setVimState(state);
    setContent(state.buffer.getContent());
  }, [vimEngine]);

  const handleKeystroke = useCallback(
    (keystroke: string) => {
      if (!vimEngine) return;

      vimEngine.handleKeystroke(keystroke);
      updateState();
    },
    [vimEngine, updateState]
  );

  const setMode = useCallback(
    (mode: VimMode) => {
      if (!vimEngine) return;

      vimEngine.setCurrentMode(mode);
      updateState();
    },
    [vimEngine, updateState]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!vimEngine) return;

      // Prevent default browser behavior for vim-like keybindings
      const ctrlKey = event.ctrlKey || event.metaKey;

      // Build keystroke representation
      let keystroke = '';
      if (event.altKey) keystroke += 'A-';
      if (ctrlKey) keystroke += 'C-';
      keystroke += event.key;

      // Process the keystroke
      vimEngine.handleKeyboardEvent(event.nativeEvent as unknown as KeyboardEvent);
      updateState();

      // Prevent default for vim keys
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
        'Escape',
      ];

      if (vimKeys.some((vk) => keystroke.includes(vk)) || ctrlKey || event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
      }
    },
    [vimEngine, updateState]
  );

  const reset = useCallback(() => {
    if (!vimEngine) return;

    const state = vimEngine.getState();
    state.reset();
    if (initialContent) {
      state.buffer.setContent(initialContent);
    }
    updateState();
  }, [vimEngine, initialContent, updateState]);

  const value: VimContextType = {
    vimEngine,
    vimState,
    content,
    setContent,
    handleKeyDown,
    handleKeystroke,
    setMode,
    reset,
  };

  return <VimContext.Provider value={value}>{children}</VimContext.Provider>;
}
