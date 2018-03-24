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
      })
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
    }, [])

    return Promise.all(filePromises);
  });

const processCompilation = (compilerName = '', filesToProcess, outPath, compiler) => {
  const compiledFilesToWrite = filesToProcess.map((file) => {
    const compiledCode = compiler(file.contents, {
      filePath: file.path,
      outPath,
      relativePath: file.relativePath,
    });

    compiledCode.replace(/process.env.COMPILER/g, compilerName);

    const outputPath = path.join(getBasePath(), outPath, file.path);

    return {
      code: compiledCode,
      outputPath,
    };
  });

  const writeFilePromises = compiledFilesToWrite
    .map(compiledFileInfo => fs.ensureDir(path.dirname(compiledFileInfo.outputPath))
      .then(() => fs.writeFile(compiledFileInfo.outputPath, compiledFileInfo.code)));

  return Promise.all(writeFilePromises);
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
