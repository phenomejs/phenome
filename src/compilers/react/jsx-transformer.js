const traverse = require('@babel/traverse').default;
const codeToAst = require('../compiler-utils/code-to-ast');

const transformReactJsxFunctionCode = `
function __transformReactJSXProps (props) {
  if (!props) return props;

  Object.keys(props).forEach(propName => {
    let newPropName;

    if (propName === 'class') {
      newPropName = 'className';
    } else {
      newPropName = propName;
    }

    if (propName !== newPropName) {
        props[newPropName] = props[propName];
        delete props[propName];
    }
  });

  return props;
};
`;

const transform = (componentString, state) => {
  const transformedJsxAst = codeToAst(componentString, {
    plugins: ['@babel/plugin-transform-react-jsx'],
  });

  const transformReactJsxFunctionNode = codeToAst(transformReactJsxFunctionCode).program.body[0];
  state.declarations.transformReactJsxFunctionNode = transformReactJsxFunctionNode;

  traverse(transformedJsxAst, {
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
          const slotName = node.arguments[1].properties ? node.arguments[1].properties[0].value.value : 'default';
          const slotNode = codeToAst(`this.slots.${slotName}`).program.body[0].expression;

          if (path.parent.arguments) {
            path.parent.arguments[path.parent.arguments.indexOf(node)] = slotNode;
          } else if (path.parent.type === 'ConditionalExpression') {
            if (path.parent.alternate === node) path.parent.alternate = slotNode;
            if (path.parent.consequent === node) path.parent.consequent = slotNode;
          }

          if (node.arguments.length > 2) {
            // Pass slot default content
            const slotChildren = node.arguments.slice(2);
            slotChildren.forEach((slotChild, index) => {
              const slotChildAst = codeToAst(`!this.slots.${slotName} && child`).program.body[0].expression;
              slotChildAst.right = slotChild;
              if (path.parent.arguments) {
                path.parent.arguments.splice(path.parent.arguments.indexOf(slotNode) + index + 1, 0, slotChildAst);
              }
            });
          }
        } else if (node.arguments[1] && node.arguments[1].type !== 'NullLiteral') {
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

  return transformedJsxAst;
};

module.exports = transform;
