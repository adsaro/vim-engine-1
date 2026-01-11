#!/usr/bin/env ts-node
/**
 * CLI tool to run browser-based tests for vim executor
 */

import { runComprehensiveTests, runBrowserTest, PuppeteerTestRunner } from './puppeteer-runner';

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Running comprehensive browser test suite...\n');
    await runComprehensiveSuite();
    return;
  }

  // Handle specific commands
  const command = args[0];

  switch (command) {
    case 'help':
    case '--help':
    case '-h':
      printHelp();
      break;

    case 'suite':
    case 'all':
      await runComprehensiveSuite();
      break;

    case 'single':
      await runSingleTest(args);
      break;

    case 'interactive':
      await runInteractive();
      break;

    default:
      console.log(`Unknown command: ${command}`);
      printHelp();
  }
}

async function runComprehensiveSuite() {
  console.log('🚀 Starting comprehensive browser test suite...\n');

  const startTime = Date.now();
  const results = await runComprehensiveTests({ headless: true, debug: false });
  const duration = Date.now() - startTime;

  console.log('\n📊 Test Results:');
  console.log('='.repeat(60));

  let passed = 0;
  let failed = 0;

  results.forEach((result, index) => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    const time = result.duration.toString().padStart(4, ' ');
    console.log(`${index + 1}. ${status} ${result.name} (${time}ms)`);

    if (!result.passed) {
      console.log(`   Expected: ${JSON.stringify(result.details?.expected)}`);
      console.log(`   Actual:   ${JSON.stringify(result.details?.actual)}`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
      failed++;
    } else {
      passed++;
    }
  });

  console.log('='.repeat(60));
  console.log(`\n📈 Summary: ${passed} passed, ${failed} failed, ${results.length} total`);
  console.log(`⏱️  Total time: ${duration}ms`);

  if (failed > 0) {
    process.exit(1);
  }
}

async function runSingleTest(args: string[]) {
  if (args.length < 4) {
    console.log('Usage: run-browser-tests.ts single <content> <key1> <key2> ...');
    console.log('Example: run-browser-tests.ts single "Hello\\nWorld" l l j');
    process.exit(1);
  }

  const content = args[1].replace(/\\n/g, '\n');
  const keys = args.slice(2);

  console.log('Running single test:');
  console.log(`  Content: ${JSON.stringify(content)}`);
  console.log(`  Keys: ${keys.join(', ')}`);
  console.log('');

  const startTime = Date.now();
  const result = await runBrowserTest(content, keys, { headless: true });
  const duration = Date.now() - startTime;

  console.log(`Result: ${result.success ? '✅ SUCCESS' : '❌ FAILED'}`);
  console.log(`Final position: Line ${result.line}, Column ${result.column}`);
  console.log(`Duration: ${duration}ms`);
}

async function runInteractive() {
  console.log('🧪 Interactive Browser Test Mode');
  console.log('This will open a browser window where you can test manually.');
  console.log('Press Ctrl+C to exit.\n');

  const runner = new PuppeteerTestRunner({ headless: false, debug: true });

  try {
    await runner.initialize();

    // Load a test page with sample content
    const page = (runner as any).page;
    await page.evaluate(() => {
      const { executor, state } = (window as any).vimSystem.createExecutor(
        'Welcome to Vim Game!\n\nThis is line 3.\nTry pressing h, j, k, l keys.\n\nThe cursor will move around.\nCheck the browser console for logs.'
      );
      (window as any).executor = executor;
      (window as any).state = state;
      (window as any).updateUI(state);

      // Add keyboard listener
      document.addEventListener('keydown', e => {
        if (['h', 'j', 'k', 'l'].includes(e.key)) {
          e.preventDefault();
          (window as any).executor.handleKeystroke(e.key);
          (window as any).updateUI((window as any).state);
          console.log(
            `Key: ${e.key}, Position: (${(window as any).state.cursor.line}, ${(window as any).state.cursor.column})`
          );
        }
      });

      console.log('Interactive mode ready! Press h, j, k, l to move cursor.');
    });

    console.log('\nBrowser is open. Interact with it and press Ctrl+C when done.');

    // Keep the process running
    await new Promise(() => {}); // Never resolves, waits for Ctrl+C
  } catch (error) {
    console.error('Error in interactive mode:', error);
  } finally {
    await runner.close();
  }
}

function printHelp() {
  console.log(`
Vim Game Browser Test Runner
============================

Usage:
  npm run test:browser [command] [options]

Commands:
  suite, all          Run the comprehensive test suite (default)
  single              Run a single test with custom content and keys
  interactive         Open browser for manual testing
  help, --help, -h    Show this help message

Examples:
  npm run test:browser
  npm run test:browser suite
  npm run test:browser single "Hello\\nWorld" l l j
  npm run test:browser interactive

Test Scenarios Covered:
  ✓ Basic movement (h, j, k, l)
  ✓ Boundary conditions (edges of buffer)
  ✓ Varying line lengths
  ✓ Empty lines
  ✓ Complex movement sequences
  ✓ Mode restrictions

Browser Options:
  - Headless mode by default for CI/CD
  - Interactive mode opens real browser window
  - Screenshots available for debugging

Debugging:
  - Use interactive mode to see visual feedback
  - Check browser console for detailed logs
  - Screenshots saved with --screenshot flag
  `);
}

// Handle uncaught errors
process.on('unhandledRejection', error => {
  console.error('Unhandled rejection:', error);
  process.exit(1);
});

process.on('uncaughtException', error => {
  console.error('Uncaught exception:', error);
  process.exit(1);
});

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { main, runComprehensiveSuite, runSingleTest, runInteractive };
