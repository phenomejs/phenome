const babel = require('@babel/core');
const traverse = require('@babel/traverse').default;
const codeToAst = require('../compiler-utils/code-to-ast');

const transformVueJsxFunctionCode = `
function __transformVueJSXProps(data) {
  if (!data) return data;
  if (!data.attrs) return data;
  Object.keys(data.attrs).forEach((key) => {
    if (key === 'className') {
      data.class = data.attrs.className;
      delete data.attrs.className;
      return;
    }
    if (key.indexOf('-') >= 0) return;

    let newKey;
    let value = data.attrs[key];
    if (key === 'maxLength') newKey = 'maxlength';
    else if (key === 'tabIndex') newKey = 'tabindex';
    else {
      newKey = key.replace(/([A-Z])/g, function (v) { return '-' + v.toLowerCase(); });
    }
    if (newKey !== key) {
      data.attrs[newKey] = value;
      delete data.attrs[key];
    }
  });
  return data;
}
`;

const getSlotFunctionCode = `
function __getVueComponentSlot(self, name, defaultChildren) {
  if (self.$slots[name] && self.$slots[name].length) {
    return self.$slots[name];
  }
  return defaultChildren;
}
`;

const transform = (componentString, state) => {
  const transformedJsx = babel.transform(componentString, {
    plugins: [
      '@babel/plugin-syntax-jsx',
      'transform-vue-jsx',
    ],
  });

  const { ast } = transformedJsx;

  const transformVueJsxFunctionNode = codeToAst(transformVueJsxFunctionCode).program.body[0];  
  state.declarations.transformVueJsxFunction = transformVueJsxFunctionNode;

  traverse(ast, {
    // eslint-disable-next-line
    CallExpression(path) {
      const { node } = path;

      if (node.callee && node.callee.name === 'h') {
        if (node.arguments[0] && node.arguments[0].type === 'StringLiteral' && node.arguments[0].value === 'slot') {
          node.callee.name = '__getVueComponentSlot';
          const newArguments = [
            {
              type: 'ThisExpression',
            },
            {
              type: 'StringLiteral',
              value: node.arguments[1].properties ? node.arguments[1].properties[0].value.properties[0].value.value : 'default',
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
              name: '__transformVueJSXProps',
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
