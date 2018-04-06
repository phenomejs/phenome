const compilerGenerator = require('../compiler-utils/compiler-generator/generator');
const vueJsxTransformer = require('./jsx-transformer');
const vueComponentTransformer = require('./component-transformer');

module.exports = compilerGenerator(vueJsxTransformer, vueComponentTransformer);
