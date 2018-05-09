const readConfigFromFile = require('../file-io/read-config-file');

const defaultConfig = {
  paths: ['./src/**/*.js', './src/**/*.jsx'],
  react: {
    out: './dist/react/',
    helpers: {
      el: 'auto',
      slots: 'auto',
      props: 'auto',
      children: 'auto',
      parent: 'auto',
      refs: 'auto',
      dispatchEvent: 'auto',
      watch: 'auto',
      forceUpdate: 'auto',
    },
  },
  vue: {
    out: './dist/vue/',
    helpers: {
      el: 'auto',
      slots: 'auto',
      props: 'auto',
      children: 'auto',
      parent: 'auto',
      refs: 'auto',
      dispatchEvent: 'auto',
      state: 'auto',
      setState: 'auto',
      forceUpdate: 'auto',
    },
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
  return config;
};

