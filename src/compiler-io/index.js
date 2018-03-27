const path = require('path');
const glob = require('glob');
const fs = require('fs-extra');
const process = require('process');

const reactCompiler = require('../compilers/react');
const vueCompiler = require('../compilers/vue');

const defaultConfig = {
  paths: ['./src/**/*.js', './src/**/*.jsx'],
  react: {
    out: './dist/react/',
  },
  vue: {
    out: './dist/vue/',
  },
};

const runtimeDependencyCache = {};

const getBasePath = () => path.dirname(process.mainModule.filename);

const getFilePathsFromGlobPatterns = (globPatterns) => {
  const globPatternPromises = globPatterns
    .map(globPattern => new Promise((resolve, reject) => {
      glob(path.join(getBasePath(), globPattern), null, (err, filePaths) => {
        if (err) {
          reject(err);
        } else {
          resolve({
            globPattern,
            filePaths,
          });
        }
      });
    }));

  return Promise.all(globPatternPromises);
};

const getFiles = globPatterns => getFilePathsFromGlobPatterns(globPatterns)
  .then((globResults) => {
    const filePromises = globResults.reduce((allFilePromises, nextGlobResult) => {
      const { filePaths, globPattern } = nextGlobResult;
      const globPatternRelativePath = path.dirname(globPattern.replace(/[*.]/g, ''));
      const basePath = getBasePath().replace(/\\/g, '/');
      const fileReadPromises = filePaths.map((filePath) => {
        return fs.readFile(filePath, 'utf8').then((contents) => {
          return {
            contents,
            path: filePath.replace(basePath, '').replace(globPatternRelativePath, ''),
            fullPath: filePath,
            relativePath: `.${globPatternRelativePath}`,
          };
        });
      });

      return [...allFilePromises, ...fileReadPromises];
    }, []);

    return Promise.all(filePromises);
  });

const compileAllFiles = (compilerName = '', filesToProcess, outPath, compiler) => {
  return filesToProcess.map((file) => {
    const compilerOutput = compiler(file.contents);

    compilerOutput.componentCode.replace(/process.env.COMPILER/g, compilerName);

    const outputPath = path.join(getBasePath(), outPath, file.path);

    return {
      componentCode: compilerOutput.componentCode,
      runtimeDependencies: compilerOutput.runtimeDependencies,
      outputPath,
    };
  });
};

const writeCompiledFiles = (filesToWrite) => {
  const writeFilePromises = filesToWrite
    .map(fileInfo => fs.ensureDir(path.dirname(fileInfo.outputPath))
      .then(() => fs.writeFile(fileInfo.outputPath, fileInfo.contents)));

  return Promise.all(writeFilePromises);
};

const getDependencyFilesToWrite = (compiledFileOutputs, outPath) => {
  const dependencyFileMap = compiledFileOutputs.reduce((allAccumulatedFiles, nextCompilerOutput) => {
    const newFilesToWrite = [...nextCompilerOutput.runtimeDependencies].reduce((accumulatedNewFiles, dependencyPath) => {
      let contents = runtimeDependencyCache[dependencyPath];

      if (!contents) {
        contents = fs.readFileSync(dependencyPath, 'utf8');
      }

      const outputPath = path.join(getBasePath(), outPath, 'runtime-dependencies', path.basename(dependencyPath));

      return {
        ...accumulatedNewFiles,
        [outputPath]: contents,
      };
    }, {});

    return { ...allAccumulatedFiles, ...newFilesToWrite };
  }, {});

  return Object.keys(dependencyFileMap).map((outputPath) => {
    return {
      outputPath,
      contents: dependencyFileMap[outputPath]
    };
  });
};

const processCompilation = (compilerName = '', filesToProcess, outPath, compiler) => {
  const compiledFileOutputs = compileAllFiles(compilerName, filesToProcess, outPath, compiler);

  const compiledFilesToWrite = compiledFileOutputs.map((compilerOutput) => {
    return {
      contents: compilerOutput.componentCode,
      outputPath: compilerOutput.outputPath,
    };
  });

  const dependencyFilesToWrite = getDependencyFilesToWrite(compiledFileOutputs, outPath);

  return writeCompiledFiles([...compiledFilesToWrite, ...dependencyFilesToWrite]);
};

const processReact = (reactConfig, filesToProcess) => processCompilation('react', filesToProcess, reactConfig.out, reactCompiler);

const processVue = (vueConfig, filesToProcess) => processCompilation('vue', filesToProcess, vueConfig.out, vueCompiler);

const compile = (config) => {
  if (!config) {
    config = defaultConfig;
  }

  return getFiles(config.paths)
    .then((files) => {
      const compilerPromises = [];

      if (config.vue) {
        compilerPromises.push(processVue(config.vue, files));
      }

      if (config.react) {
        compilerPromises.push(processReact(config.react, files));
      }

      return Promise.all(compilerPromises);
    })
    .then(() => {});
};

module.exports = compile;
