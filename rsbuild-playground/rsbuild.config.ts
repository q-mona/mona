import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginBabel } from '@rsbuild/plugin-babel';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const codeCoveragePlugin = path.resolve(__dirname, 'plugins/codeCoverage.js');

const isDev = process.env.NODE_ENV === 'development';

export default defineConfig({
  performance: {
    buildCache: false,
  },
  plugins: [
    pluginReact(),
    pluginBabel({
      babelLoaderOptions: {
        plugins: isDev ? [] : [codeCoveragePlugin]
      }
    })
  ],
});

