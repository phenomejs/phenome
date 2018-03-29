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

function modifyReactClass(name, reactClassNode, componentObjectNode) {
  const reactClassBody = reactClassNode.body.body;
  let reactClassConstructor;
  reactClassBody.forEach((node) => {
    if (node.kind === 'constructor') reactClassConstructor = node;
  });

  let hasProps;
  let propsNode;

  componentObjectNode.properties.forEach((prop) => {
    if (prop.key && prop.key.name === 'componentWillCreate') {
      const emptyArrowFunction = codeToAst(emptyArrowFunctionCode).program.body[0];
      emptyArrowFunction.expression.callee.body.body.push(...prop.body.body);
      reactClassConstructor.body.body.push(emptyArrowFunction);
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
      addClassMethod(reactClassBody, prop);
    }
    if (prop.key && prop.key.name === 'componentWillUnmount') {
      addClassMethod(reactClassBody, prop);
    }
  });

  return {
    hasProps,
    propsNode,
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

  const { hasProps, propsNode } = modifyReactClass(
    name,
    reactClassNode,
    componentNode,
  );

  if (hasProps) {
    state.addRuntimeHelper('__setReactComponentProps', './runtime-helpers/set-react-component-props.js');

    const setPropsFunctionCall = codeToAst(setPropsFunctionCallCode.replace(/{{name}}/g, name));

    setPropsFunctionCall.program.body[0].expression.arguments[1] = propsNode;

    state.addDeclaration('set-props-function-call', setPropsFunctionCall, true);
  }

  return reactClassNode;
};

module.exports = transform;
