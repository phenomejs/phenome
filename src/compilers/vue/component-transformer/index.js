/* eslint no-param-reassign: "off" */
/* eslint prefer-destructuring: "off" */
/* eslint import/no-extraneous-dependencies: "off" */
const codeToAst = require('../../compiler-utils/code-to-ast');
const walk = require('../../compiler-utils/walk');
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
      forceUpdate() {
        return this.$forceUpdate();
      },
    }
  }
`;
const addMethods = `
  const obj = {
    methods: {
      dispatchEvent(events, ...args) {
        __vueComponentDispatchEvent(this, events, ...args);
      },
      setState(updater, callback) {
        __vueComponentSetState(this, updater, callback);
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

function modifyVueComponent(componentNode, config, requiredHelpers) {
  let computed;
  let methods;

  traversePhenomeComponent(componentNode, {
    props(node) {
      if (!requiredHelpers.props) return;
      const newValue = {
        type: 'CallExpression',
        callee: {
          type: 'Identifier',
          name: '__getVueComponentPropKeys',
        },
        arguments: [node.value],
      };
      node.value = newValue;
    },
    state(node) {
      node.key.name = 'data';
      if (!requiredHelpers.state) {
        return;
      }
      if (node.value.params && node.value.params.length > 0) {
        node.value.params.splice(0, 1);
      }

      const stateFunctionNode = codeToAst(stateFunctionCode).body[0];
      stateFunctionNode.body.body[1].declarations[0].init.callee.body.body.push(...node.value.body.body);
      if (!requiredHelpers.props) {
        stateFunctionNode.body.body.splice(0, 1);
      }
      node.value.body = stateFunctionNode.body;
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

  // Add/Modify Computed Props Helpers
  const computedObjToAdd = codeToAst(addComputed).body[0].declarations[0].init.properties[0];
  if (!computed) {
    computed = {
      type: 'Property',
      method: false,
      kind: 'init',
      computed: false,
      key: {
        name: 'computed',
        type: 'Identifier',
      },
      value: {
        type: 'ObjectExpression',
        properties: [],
      },
    };
    componentNode.properties.push(computed);
  }
  computedObjToAdd.value.properties.forEach((helperProp) => {
    if (requiredHelpers[helperProp.key.name]) {
      computed.value.properties.push(helperProp);
    }
  });
  if (computed.value && computed.value.properties.length === 0) {
    componentNode.properties.splice(componentNode.properties.indexOf(computed), 1);
  }

  // Add/Modify Methods Props Helpers
  const methodsObjToAdd = codeToAst(addMethods).body[0].declarations[0].init.properties[0];
  if (!methods) {
    methods = {
      type: 'Property',
      method: false,
      kind: 'init',
      computed: false,
      key: {
        name: 'methods',
        type: 'Identifier',
      },
      value: {
        type: 'ObjectExpression',
        properties: [],
      },
    };
    componentNode.properties.push(methods);
  }
  methodsObjToAdd.value.properties.forEach((helperProp) => {
    if (requiredHelpers[helperProp.key.name]) {
      methods.value.properties.push(helperProp);
    }
  });
  if (methods.value && methods.value.properties.length === 0) {
    componentNode.properties.splice(componentNode.properties.indexOf(methods), 1);
  }
}

function findHelpers(ast, componentNode, config, jsxHelpers) {
  const thisAliases = ('this that self component').split(' ');
  const lookForHelpers = ('el slots props children parent refs dispatchEvent setState state forceUpdate').split(' ');
  const foundHelpers = [];

  walk(ast, {
    MemberExpression(node) {
      if (
        (
          (node.object.type === 'ThisExpression') ||
          (node.object.type === 'Identifier' && thisAliases.indexOf(node.object.name) >= 0)
        ) &&
        node.property.type === 'Identifier' &&
        lookForHelpers.indexOf(node.property.name) >= 0 &&
        foundHelpers.indexOf(node.property.name) < 0
      ) {
        foundHelpers.push(node.property.name);
      }
      if (node.object.type === 'Identifier' && node.object.name === 'props' && foundHelpers.indexOf('props') < 0) {
        foundHelpers.push('props');
      }
      if (node.object.type === 'Identifier' && node.object.name === 'state' && foundHelpers.indexOf('state') < 0) {
        foundHelpers.push('state');
      }
    },
  });

  traversePhenomeComponent(componentNode, {
    props() {
      if (foundHelpers.indexOf('props') < 0) foundHelpers.push('props');
    },
  });

  const helpers = {};
  const configHelpers = config.helpers;
  lookForHelpers.forEach((helper) => {
    if (configHelpers && configHelpers[helper] === false) return;
    if (configHelpers && configHelpers[helper] === true) helpers[helper] = true;
    if (!configHelpers || (configHelpers && (configHelpers[helper] === 'auto' || typeof configHelpers === 'undefined'))) {
      if (jsxHelpers && jsxHelpers[helper] === true) helpers[helper] = true;
      if (foundHelpers.indexOf(helper) >= 0) helpers[helper] = true;
    }
  });

  return helpers;
}
function transform(ast, name, componentNode, state, config, jsxHelpers) {
  const requiredHelpers = findHelpers(ast, componentNode, config, jsxHelpers);

  modifyVueComponent(componentNode, config, requiredHelpers);

  if (requiredHelpers.setState) {
    state.addRuntimeHelper('__vueComponentSetState', './runtime-helpers/vue-component-set-state.js');
  }
  if (requiredHelpers.dispatchEvent) {
    state.addRuntimeHelper('__vueComponentDispatchEvent', './runtime-helpers/vue-component-dispatch-event.js');
  }
  // Add props
  if (requiredHelpers.props) {
    // wrapComponentProps(componentNode);
    const getPropsFunctionsNodes = codeToAst(getPropsFunctionCode).body;

    state.addDeclaration('__vueComponentPropKeys', getPropsFunctionsNodes[0]);
    state.addDeclaration('__getVueComponentPropKeys', getPropsFunctionsNodes[1]);
    state.addDeclaration('__getVueComponentProps', getPropsFunctionsNodes[2]);
  }

  return componentNode;
}

module.exports = transform;
