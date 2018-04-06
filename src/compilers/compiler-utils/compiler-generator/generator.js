const codeToAst = require('../code-to-ast');
const astToCode = require('../ast-to-code');
const objectIsPhenomeComponent = require('./object-is-phenome-component');

const CompilerState = require('../compiler-state');
const getComponentVisitor = require('./get-component-visitor');
const processDeclarations = require('./process-declarations');
const processImports = require('./process-imports');

function generator(jsxTransformer, componentTransformer) {
  function generate(componentString, config) {
    const state = new CompilerState();
    const ast = codeToAst(componentString);

    if (!objectIsPhenomeComponent(ast)) {
      return {
        componentCode: componentString,
        runtimeHelpers: [],
      };
    }
    const { name, componentNode } = getComponentVisitor(ast);
    const { helpers: jsxHelpers } = jsxTransformer(ast, name, componentNode, state, config);
    componentTransformer(ast, name, componentNode, state, config, jsxHelpers);

    processDeclarations(ast, state.declarations);
    processImports(ast, state.imports);

    return {
      componentCode: astToCode(ast),
      runtimeHelpers: state.runtimeHelpers,
    };
  }
  return generate;
}
module.exports = generator;
