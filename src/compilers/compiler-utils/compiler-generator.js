const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const CompilerState = require('./compiler-state');
const codeToAst = require('./code-to-ast');
const toCamelCase = require('./to-camel-case');

const checkIfObjectIsPhenomeComponent = (objectExpressionPath) => {
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
  const allFlattenedDeclarations = Object.keys(declarations)
    .reduce((currentList, nextKey) => {
      const declarationsForKey = declarations[nextKey];

      if (Array.isArray(declarationsForKey)) {
        return [...currentList, ...declarationsForKey];
      }

      return [...currentList, declarationsForKey];
    }, []);

  const beforeComponentDeclarations = allFlattenedDeclarations
    .filter(declaration => !declaration.afterComponent)
    .map(declaration => declaration.node);

  moduleAst.program.body.splice(getLastImportIndex(moduleAst), 0, ...beforeComponentDeclarations);

  const afterComponentDeclarations = allFlattenedDeclarations
    .filter(declaration => declaration.afterComponent)
    .map(declaration => declaration.node);

  moduleAst.program.body.push(...afterComponentDeclarations);
};

const addImports = (moduleAst, imports) => {
  const importsList = Object.keys(imports).map(key => imports[key]);

  moduleAst.program.body.splice(getLastImportIndex(moduleAst), 0, ...importsList);
};

const getComponentVisitor = (componentTransformer) => {
  return {
    ObjectExpression(path, state) {
      if (checkIfObjectIsPhenomeComponent(path.node)) {
        let name;

        path.node.properties.forEach((prop) => {
          if (prop.key && prop.key.name === 'name') {
            name = prop.value.value;
          }
        });

        const result = componentTransformer(name, path.node, state);

        if (path.parent.type === 'ExportDefaultDeclaration') {
          const componentName = toCamelCase(name);

          path.parentPath.replaceWithMultiple(codeToAst(`const ${componentName} = 1; export default ${componentName};`).program.body);

          path.parentPath.parentPath.node.body.forEach((node) => {
            if (node.type === 'VariableDeclaration') {
              if (node.declarations[0].id.name === componentName) {
                node.declarations[0].init = result;
              }
            }
          });
        } else {
          path.replaceWith(result);
        }
      }
    },
  };
};

module.exports = (jsxTransformer, componentTransformer) => (componentString) => {
  const state = new CompilerState();
  const ast = jsxTransformer(componentString, state);

  traverse(ast, getComponentVisitor(componentTransformer), undefined, state);

  addDeclarations(ast, state.declarations);
  addImports(ast, state.imports);

  return {
    componentCode: generate(ast, {}).code,
    runtimeHelpers: state.runtimeHelpers,
  };
};
