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
          state.addRuntimeDependency('__getVueComponentSlot', './runtime-dependencies/get-vue-component-slot.js');

          node.callee.name = '__getVueComponentSlot';
          const newArguments = [
            {
              type: 'ThisExpression',
            },
            {
              type: 'StringLiteral',
              value: node.arguments[1] && node.arguments[1].properties ? node.arguments[1].properties[0].value.properties[0].value.value : 'default',
            },
          ];

          if (node.arguments[2]) newArguments.push(node.arguments[2]);
          node.arguments = newArguments;
        } else if (node.arguments[1]) {
          state.addRuntimeDependency('__transformVueJSXProps', './runtime-dependencies/transform-vue-jsx-props.js');

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
