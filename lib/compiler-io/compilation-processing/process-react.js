const reactCompiler = require('../../compilers/react');
const processCompilation = require('./process-compilation');

// eslint-disable-next-line
module.exports = (reactConfig, filesToProcess) => {
  return processCompilation('react', filesToProcess, reactConfig, reactCompiler);
};
