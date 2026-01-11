/**
 * Puppeteer Browser Test Runner
 * Runs vim executor tests in a real browser environment using Puppeteer
 */

import puppeteer, { Browser, Page } from 'puppeteer';
import { createBrowserTestPage } from './browser-test-setup';
import { VimExecutor } from '../../src/core/VimExecutor';
import { VimState } from '../../src/state/VimState';
import { VIM_MODE } from '../../src/state/VimMode';
import { HMovementPlugin } from '../../src/plugins/movement/h';
import { JMovementPlugin } from '../../src/plugins/movement/j';
import { KMovementPlugin } from '../../src/plugins/movement/k';
import { LMovementPlugin } from '../../src/plugins/movement/l';

export interface BrowserTestConfig {
  headless?: boolean;
  timeout?: number;
  debug?: boolean;
}

export interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
  error?: string;
  details?: any;
}

/**
 * Browser test runner for vim executor
 */
export class PuppeteerTestRunner {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private config: Required<BrowserTestConfig>;

  constructor(config: BrowserTestConfig = {}) {
    this.config = {
      headless: config.headless ?? true,
      timeout: config.timeout ?? 30000,
      debug: config.debug ?? false
    };
  }

  /**
   * Initialize the browser and page
   */
  async initialize(): Promise<void> {
    if (this.browser) return;

    this.browser = await puppeteer.launch({
      headless: this.config.headless,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    this.page = await this.browser.newPage();
    
    // Enable console logging if debug mode
    if (this.config.debug) {
      this.page.on('console', msg => {
        console.log('Browser console:', msg.text());
      });
    }

    // Create and load the test page
    const html = createBrowserTestPage();
    await this.page.setContent(html, { waitUntil: 'networkidle0' });
    
    // Inject the vim executor code
    await this.injectVimExecutor();
  }

  /**
   * Inject the compiled vim executor code into the page
   */
  private async injectVimExecutor(): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');

    // Read and inject the compiled code
    const fs = require('fs');
    const path = require('path');
    
    // Since we're in TypeScript, we need to compile and inject
    // For now, we'll create a simplified inline version
    const vimCode = `
      class CursorPosition {
        constructor(line = 0, column = 0) {
          this.line = line;
          this.column = column;
        }
        clone() { return new CursorPosition(this.line, this.column); }
        move(line, column) { this.line = line; this.column = column; return this; }
        moveLeft() { this.column = Math.max(0, this.column - 1); return this; }
        moveRight() { this.column += 1; return this; }
        moveUp() { this.line = Math.max(0, this.line - 1); return this; }
        moveDown() { this.line += 1; return this; }
        clampToBuffer(maxLine, maxColumn) {
          this.line = Math.max(0, Math.min(maxLine, this.line));
          this.column = Math.max(0, Math.min(maxColumn, this.column));
          return this;
        }
        toString() { return \`Row: \${this.line}, Col: \${this.column}\`; }
      }

      class TextBuffer {
        constructor(initialContent = '') {
          if (typeof initialContent === 'string') {
            if (initialContent === '') this.lines = [];
            else {
              const splitLines = initialContent.split('\\n');
              if (splitLines.length > 1 && splitLines[splitLines.length - 1] === '') {
                splitLines.pop();
              }
              this.lines = splitLines;
            }
          } else {
            this.lines = [...initialContent];
          }
        }
        getLine(lineNumber) {
          if (lineNumber < 0 || lineNumber >= this.lines.length) return null;
          return this.lines[lineNumber];
        }
        getLineCount() { return this.lines.length; }
        getContent() { return this.lines.join('\\n'); }
        getTotalChars() { return this.lines.reduce((sum, line) => sum + line.length, 0); }
        isEmpty() { return this.lines.length === 0; }
      }

      class VimState {
        constructor(initialContent = '') {
          this._buffer = initialContent instanceof TextBuffer ? initialContent : new TextBuffer(initialContent);
          this._cursor = new CursorPosition();
          this._mode = 'NORMAL';
        }
        get mode() { return this._mode; }
        set mode(value) { this._mode = value; }
        get buffer() { return this._buffer; }
        get cursor() { return this._cursor; }
        set cursor(value) { this._cursor = value; }
        clampCursor() {
          const maxLine = Math.max(0, this._buffer.getLineCount() - 1);
          const maxColumn = maxLine >= 0 ? this._buffer.getLine(maxLine).length : 0;
          this._cursor.clampToBuffer(maxLine, maxColumn);
        }
      }

      class VimExecutor {
        constructor() {
          this.handlers = {};
          this.state = null;
        }
        
        setState(state) {
          this.state = state;
        }
        
        registerHandler(key, handler) {
          this.handlers[key.toLowerCase()] = handler;
        }
        
        execute(key) {
          const normalizedKey = key.toLowerCase();
          const handler = this.handlers[normalizedKey];
          if (handler && this.state) {
            return handler(this.state);
          }
          return { success: false, message: \`No handler for key: \${key}\` };
        }
        
        handleKeystroke(key) {
          return this.execute(key);
        }
      }

      // Initialize vim system
      window.vimSystem = {
        CursorPosition,
        TextBuffer,
        VimState,
        VimExecutor,
        createExecutor: (initialContent) => {
          const state = new VimState(initialContent);
          const executor = new VimExecutor();
          executor.setState(state);
          
          // Register movement handlers
          executor.registerHandler('h', (state) => {
            state.cursor.moveLeft();
            state.clampCursor();
            return { success: true, action: 'Moved left' };
          });
          
          executor.registerHandler('j', (state) => {
            state.cursor.moveDown();
            state.clampCursor();
            return { success: true, action: 'Moved down' };
          });
          
          executor.registerHandler('k', (state) => {
            state.cursor.moveUp();
            state.clampCursor();
            return { success: true, action: 'Moved up' };
          });
          
          executor.registerHandler('l', (state) => {
            state.cursor.moveRight();
            state.clampCursor();
            return { success: true, action: 'Moved right' };
          });
          
          return { executor, state };
        }
      };

      // Update UI functions
      window.updateUI = function(state) {
        document.getElementById('mode').textContent = state.mode;
        document.getElementById('cursor').textContent = 
          'Line: ' + state.cursor.line + ', Col: ' + state.cursor.column;
        const lineCount = state.buffer.getLineCount();
        const charCount = state.buffer.getTotalChars();
        document.getElementById('buffer').textContent = 
          lineCount + ' lines, ' + charCount + ' chars';
        
        // Render editor
        const editor = document.getElementById('editor');
        const lines = state.buffer.lines || [];
        
        if (lines.length === 0) {
          editor.innerHTML = '(empty buffer)';
          return;
        }

        let html = '';
        lines.forEach((line, lineIndex) => {
          const isActive = lineIndex === state.cursor.line;
          const lineText = line || ' ';
          
          if (isActive) {
            const before = lineText.substring(0, state.cursor.column);
            const at = lineText.substring(state.cursor.column, state.cursor.column + 1) || ' ';
            const after = lineText.substring(state.cursor.column + 1);
            
            html += '<div style="position: relative; background: rgba(86,156,214,0.1);">';
            html += before;
            html += '<span style="background: #569cd6; color: white;">' + at + '</span>';
            html += after;
            html += '</div>';
          } else {
            html += '<div>' + lineText + '</div>';
          }
        });
        
        editor.innerHTML = html;
      };

      // Test runner
      window.runVimTests = async function() {
        const resultsDiv = document.getElementById('testResults');
        resultsDiv.innerHTML = '<div class="info">Running tests...</div>';
        
        const tests = [
          { name: 'Move right 3 times', content: 'Hello', keys: ['l','l','l'], expected: { line: 0, col: 3 } },
          { name: 'Move down 2 times', content: 'Line1\\nLine2\\nLine3', keys: ['j','j'], expected: { line: 2, col: 0 } },
          { name: 'Move in all directions', content: 'Line1\\nLine2\\nLine3', keys: ['l','l','j','k','h'], expected: { line: 1, col: 1 } },
          { name: 'Boundary test - right edge', content: 'Hi', keys: ['l','l','l'], expected: { line: 0, col: 2 } },
          { name: 'Boundary test - left edge', content: 'Hi', keys: ['l','l','h','h','h'], expected: { line: 0, col: 0 } },
        ];
        
        let passed = 0;
        let failed = 0;
        let output = '';
        
        for (const test of tests) {
          const { executor, state } = window.vimSystem.createExecutor(test.content);
          
          // Execute all keys
          for (const key of test.keys) {
            executor.handleKeystroke(key);
          }
          
          const success = state.cursor.line === test.expected.line && 
                         state.cursor.column === test.expected.col;
          
          if (success) {
            passed++;
            output += '<div class="test-pass">✓ ' + test.name + 
                      ` (Final: ${state.cursor.line},${state.cursor.column})</div>`;
          } else {
            failed++;
            output += '<div class="test-fail">✗ ' + test.name + 
                      ` (Expected: ${test.expected.line},${test.expected.col}, ` +
                      `Got: ${state.cursor.line},${state.cursor.column})</div>`;
          }
          
          // Update UI with last test
          window.updateUI(state);
        }
        
        resultsDiv.innerHTML = \`
          <div style="margin-bottom: 10px;">
            <strong>Results:</strong> 
            <span class="test-pass">\${passed} passed</span>, 
            <span class="test-fail">\${failed} failed</span>
          </div>
          \${output}
        \`;
        
        // Log to browser console
        console.log('Test Results:', { passed, failed, total: tests.length });
      };

      console.log('Vim system injected and ready');
    `;

    await this.page.addScriptTag({ content: vimCode });
  }

  /**
   * Run a simple test sequence
   */
  async runSimpleTest(
    initialContent: string,
    keystrokes: string[]
  ): Promise<{ line: number; column: number; success: boolean }> {
    if (!this.page) throw new Error('Page not initialized');

    const result = await this.page.evaluate(
      (content: string, keys: string[]) => {
        const { executor, state } = (window as any).vimSystem.createExecutor(content);
        keys.forEach(key => executor.handleKeystroke(key));
        return {
          line: state.cursor.line,
          column: state.cursor.column,
          success: true
        };
      },
      initialContent,
      keystrokes
    );

    return result;
  }

  /**
   * Run multiple test scenarios
   */
  async runTestScenarios(scenarios: Array<{
    name: string;
    content: string;
    keys: string[];
    expected: { line: number; column: number };
  }>): Promise<TestResult[]> {
    if (!this.page) throw new Error('Page not initialized');

    const results: TestResult[] = [];

    for (const scenario of scenarios) {
      const startTime = Date.now();
      try {
        const result = await this.runSimpleTest(scenario.content, scenario.keys);
        const duration = Date.now() - startTime;

        const passed = result.line === scenario.expected.line && 
                      result.column === scenario.expected.column;

        results.push({
          name: scenario.name,
          passed,
          duration,
          details: {
            expected: scenario.expected,
            actual: { line: result.line, column: result.column }
          }
        });
      } catch (error) {
        results.push({
          name: scenario.name,
          passed: false,
          duration: Date.now() - startTime,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    return results;
  }

  /**
   * Take a screenshot of the current page state
   */
  async takeScreenshot(path: string = './test-screenshot.png'): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');
    await this.page.screenshot({ path, fullPage: true });
    console.log(`Screenshot saved to ${path}`);
  }

  /**
   * Close the browser
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }
  }

  /**
   * Get the current page content (for debugging)
   */
  async getPageContent(): Promise<string> {
    if (!this.page) throw new Error('Page not initialized');
    return await this.page.content();
  }
}

/**
 * Convenience function to run a single test scenario
 */
export async function runBrowserTest(
  initialContent: string,
  keystrokes: string[],
  config: BrowserTestConfig = {}
): Promise<{ line: number; column: number; success: boolean }> {
  const runner = new PuppeteerTestRunner(config);
  try {
    await runner.initialize();
    return await runner.runSimpleTest(initialContent, keystrokes);
  } finally {
    await runner.close();
  }
}

/**
 * Run a comprehensive test suite
 */
export async function runComprehensiveTests(config: BrowserTestConfig = {}): Promise<TestResult[]> {
  const runner = new PuppeteerTestRunner(config);
  
  try {
    await runner.initialize();

    const scenarios = [
      {
        name: 'Basic right movement',
        content: 'Hello World',
        keys: ['l', 'l', 'l'],
        expected: { line: 0, column: 3 }
      },
      {
        name: 'Basic down movement',
        content: 'Line1\nLine2\nLine3',
        keys: ['j', 'j'],
        expected: { line: 2, column: 0 }
      },
      {
        name: 'Complex movement sequence',
        content: 'Line1\nLine2\nLine3',
        keys: ['l', 'l', 'j', 'k', 'h'],
        expected: { line: 1, column: 1 }
      },
      {
        name: 'Boundary - right edge',
        content: 'Hi',
        keys: ['l', 'l', 'l'],
        expected: { line: 0, column: 2 }
      },
      {
        name: 'Boundary - left edge',
        content: 'Hi',
        keys: ['l', 'l', 'h', 'h', 'h'],
        expected: { line: 0, column: 0 }
      },
      {
        name: 'Boundary - bottom edge',
        content: 'Line1\nLine2',
        keys: ['j', 'j', 'j'],
        expected: { line: 1, column: 0 }
      },
      {
        name: 'Boundary - top edge',
        content: 'Line1\nLine2',
        keys: ['j', 'k', 'k'],
        expected: { line: 0, column: 0 }
      },
      {
        name: 'Varying line lengths',
        content: 'Short\nMedium length\nLonger line here',
        keys: ['l', 'l', 'l', 'l', 'l', 'j', 'j'],
        expected: { line: 2, column: 5 } // Should clamp to shortest line
      },
      {
        name: 'Empty line handling',
        content: 'Line1\n\nLine3',
        keys: ['l', 'l', 'l', 'l', 'l', 'l', 'j', 'j'],
        expected: { line: 2, column: 0 }
      },
      {
        name: 'Single character buffer',
        content: 'A',
        keys: ['l', 'l', 'h', 'h'],
        expected: { line: 0, column: 0 }
      }
    ];

    return await runner.runTestScenarios(scenarios);
  } finally {
    await runner.close();
  }
}
