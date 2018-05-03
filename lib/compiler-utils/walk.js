const walk = require('acorn/dist/walk');

const base = {
  JSXElement(node, st, c) {
    node.children.forEach((n) => {
      c(n, st);
    });
  },
  JSXExpressionContainer(node, st, c) {
    c(node.expression, st);
  },
  JSXText() {},
  ...walk.base,
};

// eslint-disable-next-line
module.exports = (ast, visitors, extendBase = {}) => {
  return walk.ancestor(ast, visitors, {
    ...base,
    ...extendBase,
  });
};
