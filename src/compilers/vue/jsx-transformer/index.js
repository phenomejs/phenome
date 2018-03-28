const traverse = require('@babel/traverse').default;
const codeToAst = require('../../compiler-utils/code-to-ast');

const transform = (componentString, state) => {
  const transformedJsxAst = codeToAst(componentString, {
    plugins: [
      '@babel/plugin-syntax-jsx',
      'transform-vue-jsx',
    ],
  });

  traverse(transformedJsxAst, {
    // eslint-disable-next-line
    CallExpression(path) {
      const { node } = path;

      if (node.callee && node.callee.name === 'h') {
        if (node.arguments[0] && node.arguments[0].type === 'StringLiteral' && node.arguments[0].value === 'slot') {

          const slotName = node.arguments[1] && node.arguments[1].properties ?
            node.arguments[1].properties[0].value.properties[0].value.value :
            'default';

          let slotChildren;
          if (node.arguments[1] && node.arguments[1].type === 'ArrayExpression') {
            slotChildren = node.arguments[1];
          } else if (node.arguments[1] && node.arguments[1].type === 'ArrayExpression') {
            slotChildren = node.arguments[2];
          }

          const slotNode = slotChildren ?
            codeToAst(`this.slots.${slotName} || []`).program.body[0].expression :
            codeToAst(`this.slots.${slotName}`).program.body[0].expression;

          if (slotChildren) {
            slotNode.right = slotChildren;
          }

          if (path.parent && path.parent.type === 'ArrayExpression') {
            path.parent.elements[path.parent.elements.indexOf(node)] = slotNode;
          } else if (path.parent.arguments) {
            path.parent.arguments[path.parent.arguments.indexOf(node)] = slotNode;
          } else if (path.parent.type === 'ConditionalExpression') {
            if (path.parent.alternate === node) path.parent.alternate = slotNode;
            if (path.parent.consequent === node) path.parent.consequent = slotNode;
          }
        } else if (node.arguments[1]) {
          state.addRuntimeHelper('__transformVueJSXProps', './runtime-helpers/transform-vue-jsx-props.js');

          node.arguments[1] = {
            type: 'CallExpression',
            callee: {
              type: 'Identifier',
              name: '__transformVueJSXProps',
            },
            arguments: [node.arguments[1]],
          };
        }
      }
    },
  });

  return transformedJsxAst;
};

module.exports = transform;
