/* eslint no-param-reassign: "off" */
/* eslint prefer-destructuring: "off" */
const codeToAst = require('../../compiler-utils/code-to-ast');
const toCamelCase = require('../../compiler-utils/to-camel-case');

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

  componentObjectNode.properties.forEach((prop) => {
    if (prop.key && prop.key.name === 'componentWillCreate') {
      const emptyArrowFunction = codeToAst(emptyArrowFunctionCode).program.body[0];
      emptyArrowFunction.expression.callee.body.body.push(...prop.body.body);
      reactClassConstructor.body.body.push(emptyArrowFunction);
    }
    if (prop.key && prop.key.name === 'watch') {
      watchers = prop.value.properties;
      hasWatchers = true;
    }
  });
  componentObjectNode.properties.forEach((prop) => {
    if (prop.key && prop.key.name === 'methods') {
      prop.value.properties.forEach((method) => {
        addClassMethod(reactClassBody, method);
      });
    }
    if (prop.key && prop.key.name === 'computed') {
      prop.value.properties.forEach((method) => {
        addClassMethod(reactClassBody, method, 'get');
      });
    }
    if (prop.key && prop.key.name === 'render') {
      addClassMethod(reactClassBody, prop);
    }
    if (prop.key && prop.key.name === 'props') {
      hasProps = true;
      propsNode = prop.value;
    }
    if (prop.key && prop.key.name === 'state') {
      const stateSetterBody = codeToAst(stateFunctionCode).program.body[0];
      stateSetterBody.expression.right.callee.body.body.push(...prop.body.body);
      reactClassConstructor.body.body.push(stateSetterBody);
    }
    if (prop.key && prop.key.name === 'componentDidCreate') {
      const emptyArrowFunction = codeToAst(emptyArrowFunctionCode).program.body[0];
      emptyArrowFunction.expression.callee.body.body.push(...prop.body.body);
      reactClassConstructor.body.body.push(emptyArrowFunction);
    }
    if (prop.key && prop.key.name === 'componentWillMount') {
      addClassMethod(reactClassBody, prop);
    }
    if (prop.key && prop.key.name === 'componentDidMount') {
      addClassMethod(reactClassBody, prop);
    }
    if (prop.key && prop.key.name === 'componentWillUpdate') {
      addClassMethod(reactClassBody, prop);
    }
    if (prop.key && prop.key.name === 'componentDidUpdate') {
      if (watchers) {
        addWatchers(watchers, prop);
        watchers = undefined;
      }
      addClassMethod(reactClassBody, prop);
    }
    if (prop.key && prop.key.name === 'componentWillUnmount') {
      addClassMethod(reactClassBody, prop);
    }
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
