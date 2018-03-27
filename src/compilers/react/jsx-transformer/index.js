const babel = require('@babel/core');
const traverse = require('@babel/traverse').default;

const transform = (componentString, state) => {
  const transformedJsx = babel.transform(componentString, {
    plugins: ['@babel/plugin-transform-react-jsx'],
  });

  const { ast } = transformedJsx;

  traverse(ast, {
    // eslint-disable-next-line
    CallExpression(path) {
      const { node } = path;

      if (
        node.callee.type === 'MemberExpression' &&
        node.callee.object.name === 'React' &&
        node.callee.property.name === 'createElement' &&
        node.arguments &&
        node.arguments[1]
      ) {
        if (node.arguments[0] && node.arguments[0].type === 'StringLiteral' && node.arguments[0].value === 'slot') {
          state.addRuntimeDependency('__getReactComponentSlot', './runtime-dependencies/get-react-component-slot.js');

          node.callee = {
            type: 'Identifier',
            name: '__getReactComponentSlot',
          };

          const newArguments = [
            {
              type: 'ThisExpression',
            },
            {
              type: 'StringLiteral',
              value: node.arguments[1].properties ? node.arguments[1].properties[0].value.value : 'default',
            },
          ];

          if (node.arguments[2]) newArguments.push(node.arguments[2]);

          node.arguments = newArguments;
        } else if (node.arguments[1]) {
          state.addRuntimeDependency('__transformReactJSXProps', './runtime-dependencies/transform-react-jsx-props.js');

          node.arguments[1] = {
            type: 'CallExpression',
            callee: {
              type: 'Identifier',
              name: '__transformReactJSXProps',
            },
            arguments: [node.arguments[1]],
          };
        }
      }
    },
  });

  return ast;
};

module.exports = transform;
