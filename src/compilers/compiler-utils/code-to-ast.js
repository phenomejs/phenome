const ts = require('typescript');

let config = { };

module.exports = (code, options) => {
  options = options || { };
  config = config || { };

  const settings = {
    ...options,
    ...config,
    plugins: [...(options.plugins || []), ...(config.plugins || [])],
    presets: [...(options.presets || []), ...(config.presets || [])],
  };

  const sourceFile = ts.createSourceFile(
    'test.ts', code, ts.ScriptTarget.ES2018, true, ts.ScriptKind.JSX
  );

  // Options may be passed to transform
  const result = ts.transform(
    sourceFile, []
  );

  const transformedSourceFile = result.transformed[0];

  // Options may be passed to createPrinter
  const printer = ts.createPrinter();

  const generated = printer.printFile(transformedSourceFile);

  result.dispose();

  return generated;
};

module.exports.setBabelConfig = (babelConfig) => {
  config = babelConfig;
};
