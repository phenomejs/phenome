const compilerGenerator = require('../../compiler-generator/generator');
const vueJsxTransformer = require('./jsx-transformer');
const vueComponentTransformer = require('./component-transformer');

module.exports = compilerGenerator(vueJsxTransformer, vueComponentTransformer);
