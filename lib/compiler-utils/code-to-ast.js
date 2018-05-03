const acorn = require('acorn-jsx');

module.exports = function parse(code, options = {}) {
  return acorn.parse(code, {
    sourceType: 'module',
    ecmaVersion: '9',
    plugins: { jsx: true },
    ...options,
  });
};
