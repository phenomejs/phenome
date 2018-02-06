/* eslint no-param-reassign: "off" */
const acorn = require('acorn');
const walk = require('acorn/dist/walk');
const escodegen = require('escodegen');

const addComputed = `
  const obj = {
    computed: {
      props() {
        return this;
      },
      state() {
        return this;
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
          self.$set(self, key, newState[key])
        });
        if (typeof callback === 'function') callback();
      },
    }
  }
`;

function modifyExport(declaration) {
  let computed;
  let methods;
  declaration.properties.forEach((prop) => {
    // Rename/Modify State
    if (prop.key && prop.key.name === 'state') {
      prop.key.name = 'data';
      if (prop.value.params && prop.value.params.length > 0) {
        prop.value.params.splice(0, 1);
      }
      prop.value.body.body.unshift(acorn.parse('const props = this;').body[0]);
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

  const computedObjToAdd = acorn.parse(addComputed).body[0].declarations[0].init.properties[0];
  if (computed) {
    const computedPropsToAdd = computedObjToAdd.value.properties;
    computed.value.properties.push(...computedPropsToAdd);
  } else {
    declaration.properties.push(computedObjToAdd);
  }

  // Add/Modify Methods Props
  const methodsObjToAdd = acorn.parse(addMethods).body[0].declarations[0].init.properties[0];
  if (methods) {
    const methodPropsToAdd = methodsObjToAdd.value.properties;
    methods.value.properties.push(...methodPropsToAdd);
  } else {
    declaration.properties.push(methodsObjToAdd);
  }
}

function compile(componentString) {
  const ast = acorn.parse(componentString, {
    sourceType: 'module',
    allowReserved: false,
    allowReturnOutsideFunction: false,
    allowImportExportEverywhere: false,
    allowHashBang: false,
    locations: false,
    preserveParens: true,
  });
  walk.simple(ast, {
    ExportDefaultDeclaration(node) {
      modifyExport(node.declaration);
    },
  });
  return escodegen.generate(ast, {
    format: {
      indent: {
        style: '  ',
      },
      quotes: 'single',
    },
  });
}

module.exports = compile;
