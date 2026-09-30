import { defineConfig } from 'vite';
import { globSync } from 'node:fs';
export default defineConfig({
 build:{outDir:'dist',rollupOptions:{input:['index.html',...globSync('tools/*/index.html'),...globSync('guides/**/index.html'),...globSync('{privacy,terms,disclaimer}/index.html')]}},
});
