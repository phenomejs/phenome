const walk = require('../walk');

module.exports = (ast) => {
  let hasNameProp = false;
  let hasRenderFunction = false;
  walk(ast, {
    ObjectExpression(node) {
      if (!node.properties) {
        return;
      }
      node.properties.forEach((prop) => {
        if (prop.type === 'Property' && prop.key.name === 'name' && !prop.method) {
          hasNameProp = true;
        }
        if (prop.type === 'Property' && prop.key.name === 'render' && prop.method) {
          hasRenderFunction = true;
        }
      });
    },
  });
  return hasNameProp && hasRenderFunction;
};
