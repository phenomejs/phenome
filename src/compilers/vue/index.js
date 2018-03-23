/* eslint no-param-reassign: "off" */
/* eslint prefer-destructuring: "off" */
/* eslint import/no-extraneous-dependencies: "off" */
const babel = require('@babel/core');
const generate = require('@babel/generator').default;
const walk = require('babylon-walk');
const path = require('path');

function transform(code) {
  return babel.transform(code).ast;
}

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
const getPropsFunctionCode = `
let __vueComponentPropKeys;
function __getVueComponentPropKeys(props) {
  __vueComponentPropKeys = Object.keys(props);
  return props;
}
function __getVueComponentProps(component) {
  const props = {};
  __vueComponentPropKeys.forEach((propKey) => {
    if (typeof component[propKey] !== 'undefined') props[propKey] = component[propKey];
  });

  const children = [];
  Object.keys(component.$slots).forEach((slotName) => {
    children.push(...component.$slots[slotName]);
  });
  props.children = children;

  return props;
}
`;
const addComputed = `
  const obj = {
    computed: {
      refs() {
        return this.$refs;
      },
      props() {
        return __getVueComponentProps(this);
      },
      children() {
        return this.$children;
      },
      parent() {
        return this.$parent;
      },
      el() {
        return this.$el;
      },
    }
  }
`;
const addMethods = `
  const obj = {
    methods: {
      dispatchEvent(event, ...args) {
        const self = this;
        self.$emit(event, ...args);
      },
      setState(updater, callback) {
        const self = this;
        let newState;
        if (typeof updater === 'function') {
          newState = updater(self.state, self.props);
        } else {
          newState = updater;
        }
        Object.keys(newState).forEach((key) => {
          self.$set(self.state, key, newState[key])
        });
        if (typeof callback === 'function') callback();
      },
    }
  }
`;
const stateFunctionCode = `
function state() {
  const props = __getVueComponentProps(this);
  const state = (() => {})();
  return { state };
}
`;
function wrapComponentProps(declaration) {
  // Collect Props
  declaration.properties.forEach((prop) => {
    if (prop.key && prop.key.name === 'props') {
      const newValue = {
        type: 'CallExpression',
        callee: {
          type: 'Identifier',
          name: '__getVueComponentPropKeys',
        },
        arguments: [prop.value],
      };
      prop.value = newValue;
    }
  });
}
function modifyVueComponent(declaration) {
  let computed;
  let methods;

  let hasProps;

  declaration.properties.forEach((prop) => {
    if (prop.key && prop.key.name === 'props') {
      hasProps = true;
    }
    // Rename/Modify State
    if (prop.key && prop.key.name === 'state') {
      prop.key.name = 'data';
      if (prop.params && prop.params.length > 0) {
        prop.params.splice(0, 1);
      }
      const stateFunctionNode = transform(stateFunctionCode).program.body[0];
      stateFunctionNode.body.body[1].declarations[0].init.callee.body.body.push(...prop.body.body);
      prop.body.body = stateFunctionNode.body.body;
    }
    if (prop.key && prop.key.name === 'computed') computed = prop;
    if (prop.key && prop.key.name === 'methods') methods = prop;

    // Lifecycle
    if (prop.key && prop.key.name === 'componentWillCreate') {
      prop.key.name = 'beforeCreate';
    }
    if (prop.key && prop.key.name === 'componentDidCreate') {
      prop.key.name = 'created';
    }
    if (prop.key && prop.key.name === 'componentWillMount') {
      prop.key.name = 'beforeMount';
    }
    if (prop.key && prop.key.name === 'componentDidMount') {
      prop.key.name = 'mounted';
    }
    if (prop.key && prop.key.name === 'componentWillUpdate') {
      prop.key.name = 'beforeUpdate';
    }
    if (prop.key && prop.key.name === 'componentDidUpdate') {
      prop.key.name = 'updated';
    }
    if (prop.key && prop.key.name === 'componentWillUnmount') {
      prop.key.name = 'beforeDestroy';
    }
  });

  // Add/Modify Computed Props
  const computedObjToAdd = transform(addComputed).program.body[0].declarations[0].init.properties[0];
  if (computed) {
    const computedPropsToAdd = computedObjToAdd.value.properties;
    computed.value.properties.push(...computedPropsToAdd);
  } else {
    declaration.properties.push(computedObjToAdd);
  }

  // Add/Modify Methods Props
  const methodsObjToAdd = transform(addMethods).program.body[0].declarations[0].init.properties[0];
  if (methods) {
    const methodPropsToAdd = methodsObjToAdd.value.properties;
    methods.value.properties.push(...methodPropsToAdd);
  } else {
    declaration.properties.push(methodsObjToAdd);
  }

  return {
    hasProps,
  };
}

function compile(componentString, options) {
  const transformResult = babel.transform(
    componentString,
    {
      sourceType: 'module',
      code: false,
      plugins: [
        '@babel/plugin-syntax-jsx',
        'transform-vue-jsx',
      ],
    },
  );

  const ast = transformResult.ast;

  // Comment flags
  const keepImportsLines = [];
  if (ast.comments.length) {
    ast.comments.forEach((comment) => {
      if (comment.type === 'CommentLine' && comment.value.indexOf('@keep-import-path') >= 0) {
        keepImportsLines.push(comment.loc.start.line);
      }
    });
  }

  ast.program.body.forEach((node) => {
    if (node.type === 'ImportDeclaration') {
      // Fix import paths
      if (keepImportsLines.length && keepImportsLines.indexOf(node.loc.end.line) >= 0) {
        return;
      }
      if (node.source.value.indexOf('.') === 0) {
        node.source.value = path.relative(
          options.outPath,
          path.resolve(options.relativePath, path.dirname(options.filePath), node.source.value),
        );
      }
    }

    if (node.type === 'ExportDefaultDeclaration') {
      // Modify Export
      const { hasProps } = modifyVueComponent(node.declaration);

      // Add props
      if (hasProps) {
        wrapComponentProps(node.declaration);
        const getPropsFunctionNode = transform(getPropsFunctionCode).program.body;
        getPropsFunctionNode.forEach((getPropsNode) => {
          ast.program.body.splice(ast.program.body.indexOf(node), 0, getPropsNode);
        });
      }

      // Add JSX Transforms
      let hasSlots;
      const transformVueJsxFunctionNode = transform(transformVueJsxFunctionCode).program.body[0];
      ast.program.body.splice(ast.program.body.indexOf(node), 0, transformVueJsxFunctionNode);

      walk.simple(node, {
        // eslint-disable-next-line
        CallExpression(node) {
          if (node.callee && node.callee.name === 'h') {
            if (node.arguments[0] && node.arguments[0].type === 'StringLiteral' && node.arguments[0].value === 'slot') {
              hasSlots = true;
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
      if (hasSlots) {
        const getSlotsFunctionNode = transform(getSlotFunctionCode).program.body;
        getSlotsFunctionNode.forEach((getSlotsNode) => {
          ast.program.body.splice(ast.program.body.indexOf(node), 0, getSlotsNode);
        });
      }
    }
  });


  const generateResult = generate(ast, {});

  const code = generateResult.code;

  code.replace(/process.env.COMPILER/g, 'vue');

  return code;
}

module.exports = compile;
