const readSrcFiles = require('./file-io/read-src-files');
const processVue = require('./compilation-processing/process-vue');
const processReact = require('./compilation-processing/process-react');
const getConfig = require('./config/get-config');

const phenomeCompiler = async (overrideConfig) => {
  const config = await getConfig(overrideConfig);

  const files = await readSrcFiles(config.paths);
  const compilerPromises = [];

  if (config.vue) {
    compilerPromises.push(processVue(config.vue, files));
  }

  if (config.react) {
    compilerPromises.push(processReact(config.react, files));
  }

  await Promise.all(compilerPromises);
};

module.exports = phenomeCompiler;
