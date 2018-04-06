const walk = require('../walk');

module.exports = (ast) => {
  let name;
  let componentNode;
  walk(ast, {
    ExportDefaultDeclaration(node) {
      componentNode = node.declaration;
      componentNode.properties.forEach((prop) => {
        if (prop.type === 'Property' && prop.key.name === 'name' && !prop.method) {
          name = prop.value.value;
        }
      });
    },
  });
  return { name, componentNode };
};
