const babel = require('@babel/core');

module.exports = code => babel.transform(code).ast;
