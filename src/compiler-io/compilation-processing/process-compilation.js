const path = require('path');

const getBasePath = require('../utils/get-base-path');
const writeCompiledFiles = require('../file-io/write-compiled-files');
const readRuntimeHelpers = require('../file-io/read-runtime-helpers');

const compileAllFiles = (compilerName = '', filesToProcess, config, compiler) => {
  const { out: outPath } = config;
  return filesToProcess.map((file) => {
    const compilerOutput = compiler(file.contents, config);

    compilerOutput.componentCode.replace(/process.env.COMPILER/g, compilerName);
    const outputPath = path.join(getBasePath(), outPath, file.path);

    return {
      componentCode: compilerOutput.componentCode,
      runtimeHelpers: compilerOutput.runtimeHelpers,
      outputPath,
    };
  });
};

function processCompilation(compilerName = '', filesToProcess, config, compiler) {
  const { out: outPath } = config;
  const compiledFileOutputs = compileAllFiles(compilerName, filesToProcess, config, compiler);
  const compiledFilesToWrite = compiledFileOutputs.map((compilerOutput) => {
    return {
      contents: compilerOutput.componentCode,
      outputPath: compilerOutput.outputPath,
    };
  });

  const helperFilesToWrite = readRuntimeHelpers(compiledFileOutputs, outPath);

  return writeCompiledFiles([...compiledFilesToWrite, ...helperFilesToWrite]);
}

module.exports = processCompilation;
