const path = require('path');
const fs = require('fs-extra');
const glob = require('glob');

const getBasePath = require('../utils/get-base-path');

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

module.exports = globPatterns => getFilePathsFromGlobPatterns(globPatterns)
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
