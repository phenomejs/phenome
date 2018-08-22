const compilerGenerator = require('../../compiler-generator/generator');
const reactJsxTransformer = require('./jsx-transformer');
const reactComponentTransformer = require('./component-transformer');
const reactTypescriptGenerator = require('./typescript-generator');

module.exports = compilerGenerator(reactJsxTransformer, reactComponentTransformer, reactTypescriptGenerator);
