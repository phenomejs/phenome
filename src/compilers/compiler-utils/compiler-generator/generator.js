const codeToAst = require('../code-to-ast');
const astToCode = require('../ast-to-code');
const objectIsPhenomeComponent = require('./object-is-phenome-component');

const CompilerState = require('../compiler-state');
const getComponentVisitor = require('./get-component-visitor');
const parseComments = require('./parse-comments');
const processDeclarations = require('./process-declarations');
const processImports = require('./process-imports');
const porcessReplaceComponentNode = require('./process-replace-component-node');
const processExports = require('./process-exports');

function generator(jsxTransformer, componentTransformer) {
  function generate(componentString, config) {
    const state = new CompilerState();

    let modifiedComponentString;
    modifiedComponentString = parseComments(componentString, config);

    const ast = codeToAst(modifiedComponentString);

    if (!objectIsPhenomeComponent(ast)) {
      return {
        componentCode: componentString,
        runtimeHelpers: [],
      };
    }

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
    };
  }
  return generate;
}
module.exports = generator;
