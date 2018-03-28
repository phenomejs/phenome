const compilerGenerator = require('../compiler-utils/compiler-generator');
const reactJsxTransformer = require('./jsx-transformer');
const reactComponentTransformer = require('./component-transformer');

module.exports = compilerGenerator(reactJsxTransformer, reactComponentTransformer);
