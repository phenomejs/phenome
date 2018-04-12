const readSrcFiles = require('./file-io/read-src-files');
const processVue = require('./compilation-processing/process-vue');
const processReact = require('./compilation-processing/process-react');
const getConfig = require('./config/get-config');

const phenomeCompiler = async (overrideConfig) => {
  const config = await getConfig(overrideConfig);

  const files = await readSrcFiles(config.paths);
  const compilerPromises = [];

  if (config.vue) {
    const vueConfig = {
      env: config.env || {},
      compiler: 'vue',
      ...config.vue,
    };
    compilerPromises.push(processVue(vueConfig, files));
  }

  if (config.react) {
    const reactConfig = {
      env: config.env || {},
      compiler: 'react',
      ...config.react,
    };
    compilerPromises.push(processReact(reactConfig, files));
  }

  await Promise.all(compilerPromises);
};

module.exports = phenomeCompiler;
