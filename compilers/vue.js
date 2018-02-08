/* eslint no-param-reassign: "off" */
/* eslint prefer-destructuring: "off" */
/* eslint import/no-extraneous-dependencies: "off" */
const babel = require('@babel/core');
const generate = require('@babel/generator').default;

function transform(code) {
  return babel.transform(code).ast;
}
const getPropsFunctionCode = `
function __getVueComponentProps(component) {
  const props = {};
  const propsKeys = Object.keys(component.$options.propsData) || [];
  propsKeys.forEach((propKey) => {
    props[propKey] = component[propKey];
  })
  return props;
}
`;
const addComputed = `
  const obj = {
    computed: {
      props() {
        return __getVueComponentProps(this);
      },
    }
  }
`;
const addMethods = `
  const obj = {
    methods: {
      forceUpdate() {
        const self = this;
        self.$forceUpdate();
      },
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
function modifyExport(declaration) {
  let computed;
  let methods;
  declaration.properties.forEach((prop) => {
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
}

function compile(componentString, callback) {
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
  const getPropsFunctionNode = transform(getPropsFunctionCode).program.body[0];
  ast.program.body.forEach((node) => {
    if (node.type === 'ExportDefaultDeclaration') {
      modifyExport(node.declaration);
      ast.program.body.splice(ast.program.body.indexOf(node), 0, getPropsFunctionNode);
    }
  });

  const generateResult = generate(ast, {});

  const code = generateResult.code;

  callback(code);
}

module.exports = compile;
