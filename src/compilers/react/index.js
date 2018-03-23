const compilerGenerator = require('../compiler-utils/compiler-generator');
const reactJsxTransformer = require('./jsx-transformer');
const reactUniversalComponentTransformer = require('./component-transformer');

module.exports = compilerGenerator(reactJsxTransformer, reactUniversalComponentTransformer);
