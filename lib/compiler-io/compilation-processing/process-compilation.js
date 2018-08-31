const path = require('path');

const getBasePath = require('../utils/get-base-path');
const writeCompiledFiles = require('../file-io/write-compiled-files');
const readRuntimeHelpers = require('../file-io/read-runtime-helpers');

const compileAllFiles = (compilerName, filesToProcess, config, compiler) => {
  const { out: outPath } = config;
  return filesToProcess.map((file) => {
    const outputBase = path.join(getBasePath(), outPath);
    let outputPath = path.join(getBasePath(), outPath, file.path);
    const output = {
      basePath: outputBase,
      filePath: outputPath,
    };
    const compilerOutput = compiler(file.contents, config, file, output);

    if (compilerOutput.transformed && path.extname(output.filePath) === '.jsx') {
      outputPath = `${outputPath.substr(0, outputPath.lastIndexOf('.'))}.js`;
    }

    return {
      componentCode: compilerOutput.componentCode,
      runtimeHelpers: compilerOutput.runtimeHelpers,
      typeScriptDefinition: compilerOutput.typeScriptDefinition,
      outputPath,
    };
  });
};

function processCompilation(compilerName = '', filesToProcess, config, compiler) {
  const { out: outPath } = config;
  const compiledFileOutputs = compileAllFiles(compilerName, filesToProcess, config, compiler);
  // eslint-disable-next-line
  const compiledFilesToWrite = compiledFileOutputs.map((compilerOutput) => {
    return {
      contents: compilerOutput.componentCode,
      outputPath: compilerOutput.outputPath,
    };
  });

  const typeScriptDefinitionsToWrite = compiledFileOutputs
    .filter(compilerOutput => compilerOutput.typeScriptDefinition)
    // eslint-disable-next-line
    .map((compilerOutput) => {
      return {
        contents: compilerOutput.typeScriptDefinition,
        outputPath: `${compilerOutput.outputPath.split('.').slice(0, -1).join('.')}.d.ts`,
      };
    });

  const helperFilesToWrite = readRuntimeHelpers(compiledFileOutputs, outPath);

  return writeCompiledFiles([...compiledFilesToWrite, ...helperFilesToWrite, ...typeScriptDefinitionsToWrite]);
}

module.exports = processCompilation;
