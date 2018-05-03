const fs = require('fs-extra');
const path = require('path');

module.exports = (filesToWrite) => {
  const writeFilePromises = filesToWrite
    .map(fileInfo => fs.ensureDir(path.dirname(fileInfo.outputPath))
      .then(() => fs.writeFile(fileInfo.outputPath, fileInfo.contents)));

  return Promise.all(writeFilePromises);
};
