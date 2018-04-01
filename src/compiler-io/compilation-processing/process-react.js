const reactCompiler = require('../../compilers/react');
const processCompilation = require('./process-compilation');

module.exports = (reactConfig, filesToProcess) => {
  return processCompilation('react', filesToProcess, reactConfig.out, reactCompiler);
};
