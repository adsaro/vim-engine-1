# vim-engine-1

A TypeScript library ready for npm publishing.

## Setup

```bash
# Install dependencies
pnpm install

# Development
pnpm dev

# Build for production
pnpm build

# Preview build
pnpm preview
```

## Publishing to npm

1. Update the version in `package.json`
2. Build the library:
   ```bash
   pnpm build
   ```
3. Publish to npm:
   ```bash
   npm publish
   ```

Or using pnpm:

```bash
pnpm publish
```

## Directory Structure

```
├── src/
│   └── index.ts      # Library entry point (replace with your code)
├── dist/             # Built files (generated on build)
├── package.json      # NPM package configuration
├── tsconfig.json     # TypeScript configuration
└── vite.config.ts    # Vite build configuration
```

## Modifying the Library

1. Replace the contents of `src/index.ts` with your library code
2. Add additional source files in `src/` as needed
3. Re-export everything from `src/index.ts`
4. Run `pnpm build` to generate the distributable files
