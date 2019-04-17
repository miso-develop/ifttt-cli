import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import { uglify } from 'rollup-plugin-uglify';

const libraryName = 'index';

export default {
  input: `src/${libraryName}.ts`,
  output: [
    { file: `${libraryName}.js`, name: libraryName, format: 'cjs', },
  ],
  external: [
    'puppeteer',
    'rimraf',
    'table',
    'validator',
    'yargs',
  ],
  watch: {
    include: 'src/**'
  },
  plugins: [
    typescript(),
    commonjs(),
    resolve(),
    uglify(),
  ]
};
