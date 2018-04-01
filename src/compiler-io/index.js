const readSrcFiles = require('./file-io/read-src-files');
const processVue = require('./compilation-processing/process-vue');
const processReact = require('./compilation-processing/process-react');

const defaultConfig = {
  paths: ['./src/**/*.js', './src/**/*.jsx'],
  react: {
    out: './dist/react/',
  },
  vue: {
    out: './dist/vue/',
  },
};

const phenomeCompiler = (config) => {
  if (!config) {
    config = defaultConfig;
  }

  return readSrcFiles(config.paths)
    .then((files) => {
      const compilerPromises = [];

      if (config.vue) {
        compilerPromises.push(processVue(config.vue, files));
      }

      if (config.react) {
        compilerPromises.push(processReact(config.react, files));
      }

      return Promise.all(compilerPromises);
    })
    .then(() => {});
};

module.exports = phenomeCompiler;
