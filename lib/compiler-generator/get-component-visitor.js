const walk = require('../compiler-utils/walk');

module.exports = (ast) => {
  let name;
  let functional;
  let componentNode;
  let componentExportNode;
  walk(ast, {
    ExportDefaultDeclaration(node) {
      componentExportNode = node;
      componentNode = node.declaration;
      componentNode.properties.forEach((prop) => {
        if (prop.type === 'Property' && prop.key.name === 'name' && !prop.method) {
          name = prop.value.value;
        }
        if (prop.type === 'Property' && prop.key.name === 'functional' && !prop.method) {
          functional = prop.value && prop.value.value === true;
        }
      });
    },
  });
  return { name, functional, componentExportNode, componentNode };
};
