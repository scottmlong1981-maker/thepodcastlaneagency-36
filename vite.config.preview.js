// Builds the whole site into ONE self-contained .html file for review.
// Not used for production; netlify.toml still runs the normal `npm run build`.
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';
import fs from 'node:fs';

const logoDataUri = `data:image/png;base64,${fs.readFileSync('public/logo.png').toString('base64')}`;

/** Public-folder assets can't be fetched from a single file, so inline the logo. */
const inlineLogo = {
  name: 'inline-logo',
  transform(code, id) {
    if (!/\.(jsx?|css)$/.test(id) || !code.includes('/logo.png')) return null;
    return { code: code.split('"/logo.png"').join(JSON.stringify(logoDataUri)), map: null };
  },
};

export default defineConfig({
  plugins: [react(), inlineLogo, viteSingleFile()],
  define: {
    'import.meta.env.VITE_PREVIEW': 'true',
    'import.meta.env.VITE_PREVIEW_ROUTE': JSON.stringify(process.env.PREVIEW_ROUTE || '/'),
  },
  build: {
    outDir: process.env.PREVIEW_OUT || 'dist-preview',
    assetsInlineLimit: 100000000,
    cssCodeSplit: false,
  },
});
