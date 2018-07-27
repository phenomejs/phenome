/* eslint no-param-reassign: "off" */
/* eslint prefer-destructuring: "off" */
const codeToAst = require('../../../compiler-utils/code-to-ast');
const toCamelCase = require('../../../compiler-utils/to-camel-case');
const walk = require('../../../compiler-utils/walk');

const traversePhenomeComponent = require('../../../compiler-utils/traverse-phenome-component');

const stateFunctionCode = `
this.state = (() => {})();
`;
const refsDeclarationCode = `
this.__reactRefs = {};
`;
const emptyArrowFunctionCode = `
(() => {})()
`;

const setPropsFunctionCallCode = `
__reactComponentSetProps({{name}}, props);
`;

const reactClassCode = `
class {{name}} extends React.Component {
  constructor(props, context) {
    super(props, context);
  }
}
`;
const reactFunctionCode = `
const {{name}} = function {{name}} () {

}
`;

const reactHelpersClassCode = `
class ReactHelpers {
  get slots() {
    return __reactComponentSlots(this.props);
  }
  get children() {
    return __reactComponentChildren(this);
  }
  get parent() {
    return __reactComponentParent(this);
  }
  get el() {
    return __reactComponentEl(this);
  }
  dispatchEvent(events, ...args) {
    return __reactComponentDispatchEvent(this, events, ...args);
  }
  get refs() {
    return this.__reactRefs;
  }
  set refs(refs) {}
}
`;

const watchFunctionCode = `
__reactComponentWatch(this, {{watchFor}}, {{prevProps}}, {{prevState}}, () => {});
`;

function findHelpers({ ast, componentNode, config, jsxHelpers }) {
  const thisAliases = ('this that self component').split(' ');
  const lookForHelpers = ('el slots children parent dispatchEvent state forceUpdate refs').split(' ');
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
          foundHelpers.push(prop.key.name);
        }
      });
    },
  });

  lookForHelpers.push('props', 'watch');

  traversePhenomeComponent(componentNode, {
    state() {
      if (foundHelpers.indexOf('state') < 0) foundHelpers.push('state');
    },
    props() {
      if (foundHelpers.indexOf('props') < 0) foundHelpers.push('props');
    },
    watch() {
      if (foundHelpers.indexOf('watch') < 0) foundHelpers.push('watch');
    },
  });
  const helpers = {};
  const configHelpers = config.helpers;
  lookForHelpers.forEach((helper) => {
    if (configHelpers && configHelpers[helper] === false) return;
    if (configHelpers && configHelpers[helper] === true) helpers[helper] = true;
    if (!configHelpers || (configHelpers && (configHelpers[helper] === 'auto' || typeof configHelpers[helper] === 'undefined'))) {
      if (jsxHelpers && jsxHelpers[helper] === true) helpers[helper] = true;
      if (foundHelpers.indexOf(helper) >= 0) helpers[helper] = true;
    }
  });

  // Dependant helpers
  if (helpers.parent) {
    helpers.el = true;
  }

  return helpers;
}

function addClassMethod(classBody, method, forceKind) {
  const {
    key, computed, kind, value,
  } = method;
  classBody.push({
    type: 'MethodDefinition',
    key,
    computed,
    kind: forceKind || kind,
    value,
  });
}

function addWatchers(watchers, propNode) {
  if (!propNode.value.params || propNode.value.params.length === 0) {
    propNode.value.params = [
      {
        type: 'Identifier',
        name: 'prevProps',
      },
      {
        type: 'Identifier',
        name: 'prevState',
      },
    ];
  } else if (propNode.value.params.length === 1) {
    propNode.value.params.push({
      type: 'Identifier',
      name: 'prevState',
    });
  }
  const methodArguments = [propNode.value.params[0].name, propNode.value.params[1].name];
  const newWatchers = [];
  watchers.forEach((watcher) => {
    const watcherCode = watchFunctionCode
      .replace(/{{watchFor}}/g, `'${watcher.key.value}'`)
      .replace(/{{prevProps}}/g, methodArguments[0])
      .replace(/{{prevState}}/g, methodArguments[1]);

    const watcherNode = codeToAst(watcherCode).body[0];
    watcherNode.expression.arguments[4].params = watcher.value.params;
    watcherNode.expression.arguments[4].body = watcher.value.body;

    newWatchers.push(watcherNode);
  });
  propNode.value.body.body.unshift(...newWatchers);
}

function modifyReactFunction({ name, componentNode }) {
  const reactFunctionNode = codeToAst(reactFunctionCode.replace(/{{name}}/g, toCamelCase(name))).body[0];

  let propsNode;
  const staticProps = [];

  traversePhenomeComponent(componentNode, {
    static(node) {
      node.value.properties.forEach((prop) => {
        staticProps.push(prop);
      });
    },
    render(node) {
      reactFunctionNode.declarations[0].init.params = node.value.params;
      reactFunctionNode.declarations[0].init.body = node.value.body;
    },
    props(node) {
      propsNode = node.value;
    },

  });
  return {
    propsNode,
    staticProps,
    reactClassNode: reactFunctionNode,
  };
}
function modifyReactClass({ name, componentNode, requiredHelpers, functional }) {
  if (functional) {
    return modifyReactFunction({ name, componentNode });
  }

  const reactClassNode = codeToAst(reactClassCode.replace(/{{name}}/g, toCamelCase(name))).body[0];

  const reactClassBody = reactClassNode.body.body;
  const reactHelpersClassNode = codeToAst(reactHelpersClassCode).body[0];

  let reactClassConstructor;

  reactClassBody.forEach((node) => {
    if (node.kind === 'constructor') reactClassConstructor = node;
  });

  let propsNode;
  let watchers;

  const staticProps = [];

  if (requiredHelpers.refs) {
    reactClassConstructor.value.body.body.push(codeToAst(refsDeclarationCode).body[0]);
  }

  traversePhenomeComponent(componentNode, {
    static(node) {
      node.value.properties.forEach((prop) => {
        staticProps.push(prop);
      });
    },
    state(node) {
      const stateSetterBody = codeToAst(stateFunctionCode).body[0];
      stateSetterBody.expression.right.callee.body.body.push(...node.value.body.body);
      reactClassConstructor.value.body.body.push(stateSetterBody);
    },
    methods(node) {
      node.value.properties.forEach((method) => {
        addClassMethod(reactClassBody, method);
      });
    },
    computed(node) {
      node.value.properties.forEach((method) => {
        if (method.value.type === 'ObjectExpression') {
          // Suppose to be get/set
          method.value.properties.forEach((subMethod) => {
            const kind = subMethod.key.name;
            subMethod.key.name = method.key.name;
            addClassMethod(reactClassBody, subMethod, kind);
          });
          return;
        }
        addClassMethod(reactClassBody, method, 'get');
      });
    },
    render(node) {
      addClassMethod(reactClassBody, node);
    },
    props(node) {
      propsNode = node.value;
    },
    watch(node) {
      watchers = node.value.properties;
    },
  });

  traversePhenomeComponent(componentNode, {
    componentWillCreate(node) {
      const emptyArrowFunction = codeToAst(emptyArrowFunctionCode).body[0];
      emptyArrowFunction.expression.callee.body.body.push(...node.value.body.body);
      reactClassConstructor.value.body.body.splice(1, 0, emptyArrowFunction);
    },
    componentDidCreate(node) {
      const emptyArrowFunction = codeToAst(emptyArrowFunctionCode).body[0];
      emptyArrowFunction.expression.callee.body.body.push(...node.value.body.body);
      reactClassConstructor.value.body.body.push(emptyArrowFunction);
    },
    componentWillMount(node) {
      addClassMethod(reactClassBody, node);
    },
    componentDidMount(node) {
      addClassMethod(reactClassBody, node);
    },
    componentWillUpdate(node) {
      addClassMethod(reactClassBody, node);
    },
    componentDidUpdate(node) {
      if (watchers && requiredHelpers.watch) {
        addWatchers(watchers, node);
        watchers = undefined;
      }
      addClassMethod(reactClassBody, node);
    },
    componentWillUnmount(node) {
      addClassMethod(reactClassBody, node);
    },
    shouldComponentUpdate(node) {
      addClassMethod(reactClassBody, node);
    },
    getSnapshotBeforeUpdate(node) {
      addClassMethod(reactClassBody, node);
    },
    componentDidCatch(node) {
      addClassMethod(reactClassBody, node);
    },
  });

  // Add helpers from helpers class
  reactHelpersClassNode.body.body.forEach((helperMethod) => {
    if (requiredHelpers[helperMethod.key.name]) {
      addClassMethod(reactClassBody, helperMethod);
    }
  });

  // Add watchers with componentDidUpdate if wasn't added before
  if (watchers && requiredHelpers.watch) {
    // there was no componentDidUpdate, lets add it with watchers
    const componentDidUpdateNode = {
      type: 'Property',
      method: true,
      computed: false,
      kind: 'init',
      shorthand: false,
      key: {
        type: 'Identifier',
        name: 'componentDidUpdate',
      },
      value: {
        async: false,
        type: 'FunctionExpression',
        expression: false,
        body: {
          type: 'BlockStatement',
          body: [],
        },
        params: [],
      },
    };
    addWatchers(watchers, componentDidUpdateNode);
    addClassMethod(reactClassBody, componentDidUpdateNode);
  }

  return {
    propsNode,
    staticProps,
    reactClassNode,
  };
}

function transform({ ast, name = 'MyComponent', functional, componentNode, state, config, jsxHelpers }) {
  state.addImport('React', 'react', true, true);

  const camelCaseName = toCamelCase(name);
  const requiredHelpers = findHelpers({ ast, componentNode, config, jsxHelpers });
  const { reactClassNode, propsNode, staticProps } = modifyReactClass({ name: camelCaseName, componentNode, config, requiredHelpers, functional });

  if (requiredHelpers.watch) {
    state.addRuntimeHelper('__reactComponentWatch', './runtime-helpers/react-component-watch.js');
  }
  if (requiredHelpers.el) {
    state.addRuntimeHelper('__reactComponentEl', './runtime-helpers/react-component-el.js');
  }
  if (requiredHelpers.parent) {
    state.addRuntimeHelper('__reactComponentParent', './runtime-helpers/react-component-parent.js');
  }
  if (requiredHelpers.children) {
    state.addRuntimeHelper('__reactComponentChildren', './runtime-helpers/react-component-children.js');
  }
  if (requiredHelpers.dispatchEvent) {
    state.addRuntimeHelper('__reactComponentDispatchEvent', './runtime-helpers/react-component-dispatch-event.js');
  }
  if (requiredHelpers.slots) {
    state.addRuntimeHelper('__reactComponentSlots', './runtime-helpers/react-component-slots.js');
  }
  // Replace component
  state.replaceComponentNode(reactClassNode);

  if (requiredHelpers.props) {
    state.addRuntimeHelper('__reactComponentSetProps', './runtime-helpers/react-component-set-props.js');
    const setPropsFunctionCall = codeToAst(setPropsFunctionCallCode.replace(/{{name}}/g, camelCaseName));
    setPropsFunctionCall.body[0].expression.arguments[1] = propsNode;
    state.addDeclaration('set-props-function-call', setPropsFunctionCall, true);
  }
  let hasStaticDisplayName = false;
  if (staticProps.length) {
    staticProps.forEach((prop) => {
      if (prop.key.name === 'displayName') {
        hasStaticDisplayName = true;
      }
      const staticPropAst = codeToAst(`${camelCaseName}.${prop.key.name} = {}`).body[0];
      staticPropAst.expression.right = prop.value;
      state.addDeclaration(`set-static-prop-${prop.key.name}`, staticPropAst, true);
    });
  }
  // Set displayName
  if (!hasStaticDisplayName) {
    const displayNameAst = codeToAst(`${camelCaseName}.displayName = '${name}'`).body[0];
    state.addDeclaration('set-static-display-name', displayNameAst, true);
  }
  state.addExport(camelCaseName);
}

module.exports = transform;
