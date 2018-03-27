const babel = require('@babel/core');

module.exports = (code, options) => babel.transform(code, options).ast;
