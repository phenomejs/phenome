const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;

const CompilerState = require('../compiler-state');
const getComponentVisitor = require('./get-component-visitor');
const processDeclarations = require('./process-declarations');
const processImports = require('./process-imports');

module.exports = (jsxTransformer, componentTransformer) => (componentString) => {
  const state = new CompilerState();
  const ast = jsxTransformer(componentString, state);

  traverse(ast, getComponentVisitor(componentTransformer), undefined, state);

  processDeclarations(ast, state.declarations);
  processImports(ast, state.imports);

  return {
    componentCode: generate(ast, {}).code,
    runtimeHelpers: state.runtimeHelpers,
  };
};
