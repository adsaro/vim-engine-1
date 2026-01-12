import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      rollupTypes: true,
      tsconfigPath: './tsconfig.json',
    }),
  ],
  test: {
    globals: true,
    environment: 'node',
    setupFiles: [],
    include: ['**/*.test.ts'],
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'VimEngine',
      fileName: (format) => `vim-engine-core.${format}.js`,
      formats: ['es', 'umd'],
    },
    rollupOptions: {
      // Externalize dependencies that should not be bundled
      external: ['rxjs'],
      output: {
        globals: {
          rxjs: 'rxjs',
        },
      },
    },
    sourcemap: true,
    minify: false, // Keep readable for debugging
  },
});
