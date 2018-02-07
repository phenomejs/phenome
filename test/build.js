const rollup = require('rollup');
const rollupBuble = require('rollup-plugin-buble');
const rollupResolve = require('rollup-plugin-node-resolve');
const rollupCommonJs = require('rollup-plugin-commonjs');
const rollupReplace = require('rollup-plugin-replace');

let cache;

function buildFile(suffix) {
  const inputOptions = {
    input: `./src/app-${suffix}.js`,
    cache,
    plugins: [
      rollupResolve({ jsnext: true, browser: true }),
      rollupCommonJs(),
      rollupReplace({
        delimiters: ['', ''],
        'process.env.NODE_ENV': JSON.stringify('development'), // or 'production'
      }),
      rollupBuble(),
    ],
  };
  const outputOptions = {
    format: 'iife',
    file: `app-${suffix}.js`,
    dir: './',
    name: 'app',
    strict: true,
    sourcemap: false,
  };

  async function build() {
    // create a bundle
    const bundle = await rollup.rollup(inputOptions);

    // generate code and a sourcemap
    const { code, map } = await bundle.generate(outputOptions);

    // or write the bundle to disk
    await bundle.write(outputOptions);
  }

  build();
}

buildFile('vue');
buildFile('react');
