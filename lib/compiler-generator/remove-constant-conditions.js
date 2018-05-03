const walk = require('../compiler-utils/walk');

function removeConstantConditions(ast) {
  walk(ast, {
    IfStatement(node, path) {
      const parentNode = path[path.length - 2];
      if (!(parentNode.body || parentNode.alternate || parentNode.consequent)) {
        return;
      }
      const { consequent, alternate, test } = node;
      const { left, right, operator, type } = test;
      if (
        type === 'BinaryExpression' &&
        (operator === '===' || operator === '==') &&
        (left.type === 'Literal' && right.type === 'Literal')
      ) {
        let equal;
        if (operator === '===') equal = left.value === right.value;
        if (operator === '==') equal = left.value == right.value; // eslint-disable-line
        if (equal) {
          // keep it and unwrap
          if (parentNode.body) {
            parentNode.body[parentNode.body.indexOf(node)] = consequent;
          }
          if (parentNode.alternate === node) {
            parentNode.alternate = node.consequent;
          }
        } else if (alternate) {
          // replace with alternate
          if (parentNode.body) {
            parentNode.body[parentNode.body.indexOf(node)] = alternate;
          }
          if (parentNode.alternate === node) {
            parentNode.alternate = node.alternate;
          }
        } else {
          // remove it
          if (parentNode.body) {
            parentNode.body[parentNode.body.indexOf(node)] = {
              type: 'BlockStatement',
              body: [],
            };
          }
          if (parentNode.alternate === node) {
            parentNode.alternate = {
              type: 'BlockStatement',
              body: [],
            };
          }
        }
      }
    },
  });
  walk(ast, {
    BlockStatement(node, path) {
      const parentNode = path[path.length - 2];
      if (parentNode && parentNode.type === 'BlockStatement' && parentNode.body && node.body.length === 0) {
        parentNode.body.splice(parentNode.body.indexOf(node), 1);
      }
    },
  });
}

module.exports = removeConstantConditions;
