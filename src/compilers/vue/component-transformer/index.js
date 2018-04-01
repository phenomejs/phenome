/* eslint no-param-reassign: "off" */
/* eslint prefer-destructuring: "off" */
/* eslint import/no-extraneous-dependencies: "off" */
const codeToAst = require('../../compiler-utils/code-to-ast');
const traversePhenomeComponent = require('../../compiler-utils/traverse-phenome-component');

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
      slots() {
        return this.$slots;
      },
    }
  }
`;
const addMethods = `
  const obj = {
    methods: {
      dispatchEvent(events, ...args) {
        const self = this;
        events.split(' ').forEach((event) => {
          self.$emit(event, ...args);
        });
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

  traversePhenomeComponent(declaration, {
    props() {
      hasProps = true;
    },
    state(node) {
      node.key.name = 'data';

      if (node.params && node.params.length > 0) {
        node.params.splice(0, 1);
      }

      const stateFunctionNode = codeToAst(stateFunctionCode).program.body[0];
      stateFunctionNode.body.body[1].declarations[0].init.callee.body.body.push(...node.body.body);
      node.body.body = stateFunctionNode.body.body;
    },
    computed(node) {
      computed = node;
    },
    methods(node) {
      methods = node;
    },
    componentWillCreate(node) {
      node.key.name = 'beforeCreate';
    },
    componentDidCreate(node) {
      node.key.name = 'created';
    },
    componentWillMount(node) {
      node.key.name = 'beforeMount';
    },
    componentDidMount(node) {
      node.key.name = 'mounted';
    },
    componentWillUpdate(node) {
      node.key.name = 'beforeUpdate';
    },
    componentDidUpdate(node) {
      node.key.name = 'updated';
    },
    componentWillUnmount(node) {
      node.key.name = 'beforeDestroy';
    },
  });

  // Add/Modify Computed Props
  const computedObjToAdd = codeToAst(addComputed).program.body[0].declarations[0].init.properties[0];
  if (computed) {
    const computedPropsToAdd = computedObjToAdd.value.properties;
    computed.value.properties.push(...computedPropsToAdd);
  } else {
    declaration.properties.push(computedObjToAdd);
  }

  // Add/Modify Methods Props
  const methodsObjToAdd = codeToAst(addMethods).program.body[0].declarations[0].init.properties[0];
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

function transform(name, componentNode, state) {
  const { hasProps } = modifyVueComponent(componentNode);

  // Add props
  if (hasProps) {
    wrapComponentProps(componentNode);
    const getPropsFunctionNodes = codeToAst(getPropsFunctionCode).program.body;

    state.addDeclaration('__vueComponentPropKeys', getPropsFunctionNodes[0]);
    state.addDeclaration('__getVueComponentPropKeys', getPropsFunctionNodes[1]);
    state.addDeclaration('__getVueComponentProps', getPropsFunctionNodes[2]);
  }

  return componentNode;
}

module.exports = transform;
