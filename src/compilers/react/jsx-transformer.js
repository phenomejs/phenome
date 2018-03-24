const babel = require('@babel/core');
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

const getSlotFunctionCode = `
function __getReactComponentSlot(self, name, defaultChildren) {
  if (!self.props.children) {
    return defaultChildren;
  }

  if (Array.isArray(self.props.children)) {
    const slotChildren = [];
    self.props.children.forEach((child) => {
      const slotName = child.props && child.props.slot || 'default';
      if (slotName === name) {
        slotChildren.push(child);
      }
    });

    if (slotChildren.length === 1) return slotChildren[0];
    if (slotChildren.length > 1) return slotChildren;

  } else if (self.props.children.props && self.props.children.props.slot === name) {
    return self.props.children;
  } else if (self.props.children.props && !self.props.children.props.slot && name === 'default') {
    return self.props.children;
  } else if (typeof self.props.children === 'string' && name === 'default') {
    return self.props.children;
  }

  return defaultChildren;
}
`;

const transform = (componentString, state) => {
  const transformedJsx = babel.transform(componentString, {
    plugins: ['@babel/plugin-transform-react-jsx'],
  });

  const { ast } = transformedJsx;

  const transformReactJsxFunctionNode = codeToAst(transformReactJsxFunctionCode).program.body[0];
  state.declarations.transformReactJsxFunctionNode = transformReactJsxFunctionNode;

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

          if (!state.declarations.getSlotsFunction) {
            const getSlotsFunctionNode = codeToAst(getSlotFunctionCode).program.body;
            state.declarations.getSlotsFunction = getSlotsFunctionNode;
          }
        } else if (node.arguments[1]) {
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
