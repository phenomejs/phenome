const rollup = require('rollup');
const rollupBuble = require('rollup-plugin-buble');
const rollupResolve = require('rollup-plugin-node-resolve');
const rollupCommonJs = require('rollup-plugin-commonjs');
const rollupReplace = require('rollup-plugin-replace');
const rollupVue = require('rollup-plugin-vue');

const phenomeCompiler = require('../src/compiler-io/');

const buildComponentLibrary = async () => {
  await phenomeCompiler();
};

let cache;

const buildApp = async (library) => {
  const plugins = [
    rollupResolve({ jsnext: true, browser: true }),
    rollupBuble({
      objectAssign: 'Object.assign',
    }),
    rollupCommonJs(),
    rollupReplace({
      delimiters: ['', ''],
      'process.env.NODE_ENV': JSON.stringify('development'), // or 'production'
    }),
  ];
  if (library === 'vue') {
    plugins.splice(1, 0, rollupVue());
  }

  const inputOptions = {
    input: `./test/app/${library}/src/app.js`,
    cache,
    plugins,
  };

  const outputOptions = {
    format: 'iife',
    file: `./test/app/${library}/dist/app.js`,
    name: 'app',
    strict: true,
    sourcemap: false,
  };

  const buildBundle = async () => {
    // create a bundle
    const bundle = await rollup.rollup(inputOptions).catch((error) => {
      console.log(error);
    });

    // generate code and a sourcemap
    await bundle.generate(outputOptions);

    // or write the bundle to disk
    await bundle.write(outputOptions);
  };

  await buildBundle();
};

const buildAll = async () => {
  try {
    await buildComponentLibrary();
    await [
      await buildApp('vue'),
      await buildApp('react'),
    ];
  } catch (err) {
    console.error(err);
  }
};

buildAll();
