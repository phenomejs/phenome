const readConfigFromFile = require('../file-io/read-config-file');
const { setBabelConfig } = require('../../compilers/compiler-utils/code-to-ast');

const defaultConfig = {
  paths: ['./src/**/*.js', './src/**/*.jsx'],
  react: {
    out: './dist/react/',
  },
  vue: {
    out: './dist/vue/',
  },
};

module.exports = async (overrideConfig = null) => {
  let config = overrideConfig;

  if (!config) {
    config = await readConfigFromFile();
  }

  if (!config) {
    config = defaultConfig;
  }

  if (config.babelConfig) {
    setBabelConfig(config.babelConfig);
  }

  return config;
};

