const escodegen = require('escodegen');

module.exports = function generate(ast, options = {}) {
  return escodegen.generate(ast, {
    format: {
      indent: {
        style: '  ',
      },
      compact: false,
    },
    ...options,
  });
};
