export function buildViteConfig(sliceName, options) {
  return `import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: 'index.js',
        actions: 'actions.js',
        selectors: 'selectors.js',
        constants: 'constants.js',
      },
      formats: ['es'],
    },

    rollupOptions: {
      external: ['react', 'react-redux', 'redux', '@reduxjs/toolkit'],
    },
  },
});
`;
}
