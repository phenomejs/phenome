const codeToAst = require('../compiler-utils/code-to-ast');
const astToCode = require('../compiler-utils/ast-to-code');
const objectIsPhenomeComponent = require('./object-is-phenome-component');

const CompilerState = require('../compiler-utils/compiler-state');
const getComponentVisitor = require('./get-component-visitor');
const parseCommentCommands = require('./parse-comment-commands');
const replaceEnvironmentVars = require('./replace-environment-vars');
const removeConstantConditions = require('./remove-constant-conditions');
const processDeclarations = require('./process-declarations');
const processImports = require('./process-imports');
const porcessReplaceComponentNode = require('./process-replace-component-node');
const processExports = require('./process-exports');

function generator(jsxTransformer, componentTransformer) {
  function generate(componentString, config, output) {
    const state = new CompilerState(config, output);

    let modifiedComponentString = componentString;
    modifiedComponentString = parseCommentCommands(modifiedComponentString, config);
    modifiedComponentString = replaceEnvironmentVars(modifiedComponentString, config);

    const ast = codeToAst(modifiedComponentString);

    if (!objectIsPhenomeComponent(ast)) {
      return {
        componentCode: componentString,
        runtimeHelpers: [],
        transformed: false,
      };
    }

    removeConstantConditions(ast);

    const { name, componentNode, componentExportNode } = getComponentVisitor(ast);
    const { helpers: jsxHelpers } = jsxTransformer(ast, name, componentNode, state, config);
    componentTransformer(ast, name, componentNode, state, config, jsxHelpers);

    processDeclarations(ast, state.declarations);
    processImports(ast, state.imports);
    porcessReplaceComponentNode(ast, componentExportNode, state.newComponentNode);
    processExports(ast, state.exports);

    return {
      componentCode: astToCode(ast),
      runtimeHelpers: state.runtimeHelpers,
      transformed: true,
    };
  }
  return generate;
}
module.exports = generator;
