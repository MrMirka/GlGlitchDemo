import { defineConfig } from 'vite';
import string from 'vite-plugin-string';

export default defineConfig({
  base: '/WEbGlDemo/',
  plugins: [
    string({ include: ['**/*.frag', '**/*.vert'] }),
  ],
});
