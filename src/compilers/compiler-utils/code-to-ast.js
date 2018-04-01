const babel = require('@babel/core');

let config = { };

module.exports = (code, options) => {
  options = options || { };
  config = config || { };

  const settings = {
    ...options,
    ...config,
    plugins: [...(options.plugins || []), ...(config.plugins || [])],
    presets: [...(options.presets || []), ...(config.presets || [])],
  };

  return babel.transform(code, settings).ast;
};

module.exports.setBabelConfig = (babelConfig) => {
  config = babelConfig;
};
