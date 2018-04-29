/* eslint no-param-reassign: "off" */
/* eslint prefer-destructuring: "off" */
/* eslint import/no-extraneous-dependencies: "off" */
const codeToAst = require('../../compiler-utils/code-to-ast');
const walk = require('../../compiler-utils/walk');
const traversePhenomeComponent = require('../../compiler-utils/traverse-phenome-component');

const getPropsFunctionCode = `
let __vueComponentPropsKeys;
function __vueComponentGetPropKeys(props) {
  __vueComponentPropsKeys = Object.keys(props);
  return props;
}
`;
const addComputed = `
  const obj = {
    computed: {
      props() {
        return __vueComponentProps(this, __vueComponentPropsKeys);
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
      forceUpdate() {
        return this.$forceUpdate();
      },
    }
  }
`;
const stateFunctionCode = `
function state() {
  const props = __vueComponentProps(this, __vueComponentPropsKeys);
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
          name: '__vueComponentGetPropKeys',
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

  // add-$-helpers
  const add$Helpers = ('el refs children parent slots').split(' ');
  let needToAdd$Helpers = false;
  Object.keys(requiredHelpers).forEach((requiredHelper) => {
    if (add$Helpers.indexOf(requiredHelper) >= 0) needToAdd$Helpers = true;
  });
  if (needToAdd$Helpers) {
    const thisAliases = ('this that self component').split(' ');
    walk(componentNode, {
      MemberExpression(node) {
        if (
          (
            (node.object.type === 'ThisExpression') ||
            (node.object.type === 'Identifier' && thisAliases.indexOf(node.object.name) >= 0)
          ) &&
          node.property.type === 'Identifier' &&
          add$Helpers.indexOf(node.property.name) >= 0
        ) {
          node.property.name = `$${node.property.name}`;
        }
      },
      VariableDeclarator(node) {
        const isDistructuring = node.id.type === 'ObjectPattern';
        if (!isDistructuring) return;
        const props = node.id.properties;
        const init = node.init.name;
        if (thisAliases.indexOf(init) < 0) return;
        props.forEach((prop) => {
          if (add$Helpers.indexOf(prop.key.name) >= 0) {
            prop.key.name = `$${prop.key.name}`;
          }
        });
      },
    });
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
    VariableDeclarator(node) {
      const isDistructuring = node.id.type === 'ObjectPattern';
      if (!isDistructuring) return;
      const props = node.id.properties;
      const init = node.init.name;
      if (thisAliases.indexOf(init) < 0) return;
      props.forEach((prop) => {
        if (
          lookForHelpers.indexOf(prop.key.name) >= 0 &&
          foundHelpers.indexOf(prop.key.name) < 0
        ) {
          foundHelpers.push(prop.key.name)
        }
      });
    },
  });

  traversePhenomeComponent(componentNode, {
    data() {
      if (foundHelpers.indexOf('state') < 0) foundHelpers.push('state');
    },
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
    const getPropsFunctionsNodes = codeToAst(getPropsFunctionCode).body;
    state.addRuntimeHelper('__vueComponentProps', './runtime-helpers/vue-component-props.js');

    state.addDeclaration('__vueComponentPropsKeys', getPropsFunctionsNodes[0]);
    state.addDeclaration('__vueComponentGetPropKeys', getPropsFunctionsNodes[1]);
  }

  return componentNode;
}

module.exports = transform;
