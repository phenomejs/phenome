const compilerGenerator = require('../../compiler-generator/generator');
const reactJsxTransformer = require('./jsx-transformer');
const reactComponentTransformer = require('./component-transformer');

module.exports = compilerGenerator(reactJsxTransformer, reactComponentTransformer);
