/* eslint no-param-reassign: "off" */
/* eslint prefer-destructuring: "off" */
const codeToAst = require('../../compiler-utils/code-to-ast');
const toCamelCase = require('../../compiler-utils/to-camel-case');

const traversePhenomeComponent = require('../../compiler-utils/traverse-phenome-component');

const stateFunctionCode = `
this.state = (() => {})();
`;
const emptyArrowFunctionCode = `
(() => {})()
`;

const setPropsFunctionCallCode = `
__setReactComponentProps({{name}}, props);
`;

const reactClassCode = `
(class {{name}} extends __BaseReactComponent {
  constructor(props, context) {
    super(props, context);
  }
})
`;

const watchFunctionCode = `
__reactComponentWatch(this, {{watchFor}}, {{prevProps}}, {{prevState}}, () => {});
`;

function addClassMethod(classNode, method, forceKind) {
  const {
    key, computed, kind, id, generator, async, params, body,
  } = method;
  classNode.push({
    type: 'ClassMethod',
    static: method.static,
    key,
    computed,
    kind: forceKind || kind,
    id,
    generator,
    async,
    params,
    body,
  });
}

function addWatchers(watchers, propNode) {
  if (!propNode.params || propNode.params.length === 0) {
    propNode.params = [
      {
        type: 'Identifier',
        name: 'prevProps',
      },
      {
        type: 'Identifier',
        name: 'prevState',
      },
    ];
  } else if (propNode.params.length === 1) {
    propNode.params.push({
      type: 'Identifier',
      name: 'prevState',
    });
  }
  const methodArguments = [propNode.params[0].name, propNode.params[1].name];
  const newWatchers = [];
  watchers.forEach((watcher) => {
    const watcherCode = watchFunctionCode
      .replace(/{{watchFor}}/g, `'${watcher.key.value}'`)
      .replace(/{{prevProps}}/g, methodArguments[0])
      .replace(/{{prevState}}/g, methodArguments[1]);

    const watcherNode = codeToAst(watcherCode).program.body[0].expression;
    watcherNode.arguments[4].params = watcher.value.params;
    watcherNode.arguments[4].body = watcher.value.body;

    newWatchers.push(watcherNode)
  });
  propNode.body.body.unshift(...newWatchers);
}

function modifyReactClass(name, reactClassNode, componentObjectNode) {
  const reactClassBody = reactClassNode.body.body;
  let reactClassConstructor;

  reactClassBody.forEach((node) => {
    if (node.kind === 'constructor') reactClassConstructor = node;
  });

  let hasProps;
  let propsNode;
  let watchers;
  let hasWatchers;

  traversePhenomeComponent(componentObjectNode, {
    state(node) {
      const stateSetterBody = codeToAst(stateFunctionCode).program.body[0];
      stateSetterBody.expression.right.callee.body.body.push(...node.body.body);
      reactClassConstructor.body.body.push(stateSetterBody);
    },
    methods(node) {
      node.value.properties.forEach((method) => {
        addClassMethod(reactClassBody, method);
      });
    },
    computed(node) {
      node.value.properties.forEach((method) => {
        addClassMethod(reactClassBody, method, 'get');
      });
    },
    render(node) {
      addClassMethod(reactClassBody, node);
    },
    props(node) {
      hasProps = true;
      propsNode = node.value;
    },
    watch(node) {
      watchers = node.value.properties;
      hasWatchers = true;
    },
    componentWillCreate(node) {
      const emptyArrowFunction = codeToAst(emptyArrowFunctionCode).program.body[0];
      emptyArrowFunction.expression.callee.body.body.push(...node.body.body);
      reactClassConstructor.body.body.push(emptyArrowFunction);
    },
    componentDidCreate(node) {
      const emptyArrowFunction = codeToAst(emptyArrowFunctionCode).program.body[0];
      emptyArrowFunction.expression.callee.body.body.push(...node.body.body);
      reactClassConstructor.body.body.push(emptyArrowFunction);
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
      if (watchers) {
        addWatchers(watchers, node);
        watchers = undefined;
      }

      addClassMethod(reactClassBody, node);
    },
    componentWillUnmount(node) {
      addClassMethod(reactClassBody, node);
    },
  });

  if (watchers) {
    // there was no componentDidUpdate, lets add it with watchers
    const componentDidUpdateNode = {
      type: 'ObjectMethod',
      key: {
        type: 'Identifier',
        name: 'componentDidUpdate',
      },
      body: {
        type: 'BlockStatement',
        body: [],
      },
      params: [],
    };
    addWatchers(watchers, componentDidUpdateNode);
    addClassMethod(reactClassBody, componentDidUpdateNode);
  }

  return {
    hasProps,
    propsNode,
    hasWatchers,
  };
}

const transform = (name = 'MyComponent', componentNode, state) => {
  // Find name
  componentNode.properties.forEach((prop) => {
    if (prop.key && prop.key.name === 'name') {
      name = toCamelCase(prop.value.value);
    }
  });

  state.addImport('React', 'react');

  state.addRuntimeHelper('__BaseReactComponent', './runtime-helpers/base-react-component.js');

  const reactClassNode = codeToAst(reactClassCode.replace(/{{name}}/g, toCamelCase(name))).program.body[0].expression;

  const { hasProps, propsNode, hasWatchers } = modifyReactClass(
    name,
    reactClassNode,
    componentNode,
  );

  if (hasWatchers) {
    state.addRuntimeHelper('__reactComponentWatch', './runtime-helpers/react-component-watch.js');
  }

  if (hasProps) {
    state.addRuntimeHelper('__setReactComponentProps', './runtime-helpers/set-react-component-props.js');

    const setPropsFunctionCall = codeToAst(setPropsFunctionCallCode.replace(/{{name}}/g, name));

    setPropsFunctionCall.program.body[0].expression.arguments[1] = propsNode;

    state.addDeclaration('set-props-function-call', setPropsFunctionCall, true);
  }

  return reactClassNode;
};

module.exports = transform;
