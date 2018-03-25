const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const CompilerState = require('./compiler-state');

const checkIfObjectIsUniversalComponent = (objectExpressionPath) => {
  let hasNameProp = false;
  let hasRenderFunction = false;

  objectExpressionPath.properties.forEach((prop) => {
    if (prop.type === 'ObjectProperty' && prop.key.name === 'name') {
      hasNameProp = true;
    }

    if (prop.type === 'ObjectMethod' && prop.key.name === 'render') {
      hasRenderFunction = true;
    }
  });

  return hasNameProp && hasRenderFunction;
};

const getLastImportIndex = (moduleAst) => {
  let lastImportNodeIndex = 0;

  while (moduleAst.program.body.length && moduleAst.program.body[lastImportNodeIndex].type === 'ImportDeclaration') {
    lastImportNodeIndex += 1;
  }

  return lastImportNodeIndex;
};

const addDeclarations = (moduleAst, declarations) => {
  const declarationList = Object.keys(declarations)
    .reduce((currentList, nextKey) => {
      const declarationsForKey = declarations[nextKey];

      if (Array.isArray(declarationsForKey)) {
        return [...currentList, ...declarationsForKey];
      }

      return [...currentList, declarationsForKey];
    }, []);

  moduleAst.program.body.splice(getLastImportIndex(moduleAst), 0, ...declarationList);
};

const addImports = (moduleAst, imports) => {
  const importsList = Object.keys(imports).map(key => imports[key]);

  moduleAst.program.body.splice(getLastImportIndex(moduleAst), 0, ...importsList);
};

const getComponentVisitor = (componentTransformer) => {
  return {
    ObjectExpression(path, state) {
      if (checkIfObjectIsUniversalComponent(path.node)) {
        let name;
  
        path.node.properties.forEach((prop) => {
          if (prop.key && prop.key.name === 'name') {
            name = prop.value.value;
          }
        });
  
        const result = componentTransformer(name, path.node, state);
  
        path.replaceWith(result);
      }
    },  
  }
};

module.exports = (jsxTransformer, componentTransformer) => (componentString) => {
  const state = new CompilerState();
  const ast = jsxTransformer(componentString, state);

  traverse(ast, getComponentVisitor(componentTransformer), undefined, state);

  addDeclarations(ast, state.declarations);
  addImports(ast, state.imports);

  return {
    componentCode: generate(ast, {}).code,
    runtimeDependencies: state.runtimeDependencies
  }
};
