const path = require('path');

const getBasePath = require('../utils/get-base-path');
const writeCompiledFiles = require('../file-io/write-compiled-files');
const readRuntimeHelpers = require('../file-io/read-runtime-helpers');

const compileAllFiles = (compilerName = '', filesToProcess, outPath, compiler) => {
  return filesToProcess.map((file) => {
    const compilerOutput = compiler(file.contents);

    compilerOutput.componentCode.replace(/process.env.COMPILER/g, compilerName);

    const outputPath = path.join(getBasePath(), outPath, file.path);

    return {
      componentCode: compilerOutput.componentCode,
      runtimeHelpers: compilerOutput.runtimeHelpers,
      outputPath,
    };
  });
};

module.exports = (compilerName = '', filesToProcess, outPath, compiler) => {
  const compiledFileOutputs = compileAllFiles(compilerName, filesToProcess, outPath, compiler);

  const compiledFilesToWrite = compiledFileOutputs.map((compilerOutput) => {
    return {
      contents: compilerOutput.componentCode,
      outputPath: compilerOutput.outputPath,
    };
  });

  const helperFilesToWrite = readRuntimeHelpers(compiledFileOutputs, outPath);

  return writeCompiledFiles([...compiledFilesToWrite, ...helperFilesToWrite]);
};
