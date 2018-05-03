const fs = require('fs-extra');
const path = require('path');
const vm = require('vm');

const getBasePath = require('../utils/get-base-path');

module.exports = async () => {
  const configPath = path.join(getBasePath(), 'phenome.config.js');

  const exists = await fs.exists(configPath);

  if (exists) {
    const configCode = await fs.readFile(configPath, 'utf8');
    const sandbox = { module: {} };

    vm.createContext(sandbox);
    vm.runInContext(configCode, sandbox);

    return sandbox.module.exports;
  }

  return null;
};
