const walk = require('../compiler-utils/walk');

module.exports = (ast) => {
  let name;
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
      });
    },
  });
  return { name, componentExportNode, componentNode };
};
