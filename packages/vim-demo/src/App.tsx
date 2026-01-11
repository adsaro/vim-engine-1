import { VimProvider } from './contexts/VimContext';
import { Editor } from './components/Editor';
import { StatusBar } from './components/StatusBar';
import { CommandPalette } from './components/CommandPalette';

function App() {
  return (
    <VimProvider>
      <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
        <header className="bg-gray-800 px-4 py-2 border-b border-gray-700">
          <h1 className="text-xl font-bold">VIM Engine Demo</h1>
          <p className="text-sm text-gray-400">
            A React demo showcasing the vim-engine core functionality
          </p>
        </header>
        
        <main className="flex-1 flex flex-col overflow-hidden">
          <Editor />
          <CommandPalette />
        </main>
        
        <StatusBar />
      </div>
    </VimProvider>
  );
}

export default App;
