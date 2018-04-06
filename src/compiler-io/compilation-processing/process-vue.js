const vueCompiler = require('../../compilers/vue');
const processCompilation = require('./process-compilation');

module.exports = (vueConfig, filesToProcess) => {
  return processCompilation('vue', filesToProcess, vueConfig, vueCompiler);
};
