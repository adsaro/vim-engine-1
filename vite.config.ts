import { defineConfig } from "vite";
import { resolve } from "path";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "vimEngine1",
      fileName: (format) => `vim-engine-1.${format}.js`,
    },
    rollupOptions: {
      // Make sure to externalize deps that shouldn't be bundled
      // external: ["react", "react-dom"],
      // output: {
      //   globals: {
      //     react: "React",
      //     "react-dom": "ReactDOM",
      //   },
      // },
    },
  },
});
