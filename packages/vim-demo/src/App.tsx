import { VimProvider } from './contexts/VimContext';
import { Editor } from './components/Editor';
import { StatusBar } from './components/StatusBar';
import { CommandPalette } from './components/CommandPalette';

// Sample text for testing vim movements
const SAMPLE_TEXT = `const calculateSum = (numbers: number[]): number => {
  return numbers.reduce((accumulator, currentValue) => {
    return accumulator + currentValue;
  }, 0);
};

// This is a longer line to test horizontal cursor movements.
// It has multiple sentences and various words for testing w, b, e movements.
// Words like camelCase, snake_case, and CONSTANTS should work differently.

function multiply(a: number, b: number): number {
  return a * b;
}

class Calculator {
  private value: number = 0;
  
  add(amount: number): void {
    this.value += amount;
  }
  
  subtract(amount: number): void {
    this.value -= amount;
  }
  
  getValue(): number {
    return this.value;
  }
}

// Test special characters: @#$%^&*()_+-=[]{}|;':",./<>?
// Numbers: 123 456 789 0
// Mixed: test123, 456test, test-456-test`;

function App() {
  return (
    <VimProvider initialContent={SAMPLE_TEXT}>
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
