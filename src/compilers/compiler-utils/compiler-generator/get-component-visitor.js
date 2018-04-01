const toCamelCase = require('../to-camel-case');
const codeToAst = require('../code-to-ast');
const objectIsPhenomeComponent = require('./object-is-phenome-component');

const declareAndExportCode = `
const {{componentName}} = 1;
export default {{componentName}};
`;

const separateExportDefaultIntoVarAndExport = (name, path, transformedComponent) => {
  const componentName = toCamelCase(name);

  const declarationAndExportNodes = codeToAst(declareAndExportCode.replace(/{{componentName}}/g, componentName)).program.body;

  path.parentPath.replaceWithMultiple(declarationAndExportNodes);

  path.parentPath.parentPath.node.body.forEach((node) => {
    if (node.type === 'VariableDeclaration') {
      if (node.declarations[0].id.name === componentName) {
        node.declarations[0].init = transformedComponent;
      }
    }
  });
};

module.exports = (componentTransformer) => {
  return {
    ObjectExpression(path, state) {
      if (objectIsPhenomeComponent(path.node)) {
        let name;

        path.node.properties.forEach((prop) => {
          if (prop.key && prop.key.name === 'name') {
            name = prop.value.value;
          }
        });

        const transformedComponent = componentTransformer(name, path.node, state);

        if (path.parent.type === 'ExportDefaultDeclaration') {
          separateExportDefaultIntoVarAndExport(name, path, transformedComponent);
        } else {
          path.replaceWith(transformedComponent);
        }
      }
    },
  };
};
