const compilerGenerator = require('../compiler-utils/compiler-generator');
const vueJsxTransformer = require('./jsx-transformer');
const vueUniversalComponentTransformer = require('./component-transformer');

module.exports = compilerGenerator(vueJsxTransformer, vueUniversalComponentTransformer);
