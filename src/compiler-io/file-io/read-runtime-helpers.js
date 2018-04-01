const fs = require('fs-extra');
const path = require('path');

const getBasePath = require('../utils/get-base-path');

const runtimeHelperCache = {};

module.exports = (compiledFileOutputs, outPath) => {
  const helperFileMap = compiledFileOutputs.reduce((allAccumulatedFiles, nextCompilerOutput) => {
    const newFilesToWrite = [...nextCompilerOutput.runtimeHelpers].reduce((accumulatedNewFiles, helperPath) => {
      let contents = runtimeHelperCache[helperPath];

      if (!contents) {
        contents = fs.readFileSync(helperPath, 'utf8');
      }

      const outputPath = path.join(getBasePath(), outPath, 'runtime-helpers', path.basename(helperPath));

      return {
        ...accumulatedNewFiles,
        [outputPath]: contents,
      };
    }, {});

    return { ...allAccumulatedFiles, ...newFilesToWrite };
  }, {});

  return Object.keys(helperFileMap).map((outputPath) => {
    return {
      outputPath,
      contents: helperFileMap[outputPath],
    };
  });
};
