const babel = require('@babel/core');

let config = { plugins: ['@babel/plugin-proposal-object-rest-spread'] };

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

// module.exports = (code, options) => babel.transform(code, options).ast;
