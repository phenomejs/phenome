/* eslint no-param-reassign: "off" */
/* eslint prefer-destructuring: "off" */
const babel = require('@babel/core');
const generate = require('@babel/generator').default;
const walk = require('babylon-walk');
const path = require('path');
const toCamelCase = require('../compiler-utils/to-camel-case.js');

function transform(code) {
  return babel.transform(code).ast;
}

const propTypesImportCode = `
import PropTypes from 'prop-types';
`;
const reactImportCode = `
import React from 'react';
`;
const reactClassCode = `
class {{name}} extends React.Component {
  constructor(props) {
    super(props);
  }
  dispatchEvent(event, ...args) {
    const self = this;
    if (!event || !event.trim().length) return;
    const eventName = (event || '')
      .trim()
      .split(/[ -_:]/)
      .map(word => word[0].toUpperCase() + word.substring(1))
      .join('');
    const propName = 'on' + eventName;
    if (self.props[propName]) self.props[propName](...args);
  }
  get children() {
    const self = this;
    const children = [];
    let child = self._reactInternalFiber && self._reactInternalFiber.child;
    function findChildren(node) {
      if (node.type && typeof node.type === 'function') {
        children.push(node.stateNode);
      } else if (node.child) {
        findChildren(node.child);
      }
      if (node.sibling) findChildren(node.sibling);
    }
    if (child) findChildren(child);
    return children;
  }
  get parent() {
    const self = this;
    const el = self.el;
    let parent;
    let reactProp;
    function checkParentNode(node) {
      if (!node) return;
      if (!reactProp) {
        for (let propName in node) {
          if (propName.indexOf('__reactInternalInstance') >= 0) reactProp = propName;
        }
      }
      if (
        node[reactProp] &&
        node[reactProp]._debugOwner &&
        typeof node[reactProp]._debugOwner.type === 'function' &&
        node[reactProp]._debugOwner.stateNode &&
        node[reactProp]._debugOwner.stateNode !== self
      ) {
        parent = node[reactProp]._debugOwner.stateNode;
        return;
      }
      checkParentNode(node.parentNode);
    }
    if (self._reactInternalFiber._debugOwner) return self._reactInternalFiber._debugOwner.stateNode;
    else if (el) checkParentNode(el);
    return parent;
  }
  get el() {
    const self = this;
    let el;
    let child = self._reactInternalFiber.child;
    while(!el && child) {
      if (child.stateNode && child.stateNode instanceof window.HTMLElement) {
        el = child.stateNode;
      } else {
        child = child.child;
      }
    }
    return el;
  }
}
`;
const reactClassExportCode = `
export default {{name}};
`;
const stateFunctionCode = `
this.state = (() => {})();
`;
const emptyArrowFunctionCode = `
(() => {})()
`;

const transformReactJsxFunctionCode = `
function __transformReactJSXProps (props) {
  if (!props) return props;

  Object.keys(props).forEach(propName => {
    let newPropName;

    if (propName === 'class') {
      newPropName = 'className';
    } else {
      newPropName = propName;
    }

    if (propName !== newPropName) {
        props[newPropName] = props[propName];
        delete props[propName];
    }
  });

  return props;
};
`;
const getSlotFunctionCode = `
function __getReactComponentSlot(self, name, defaultChildren) {
  if (!self.props.children) {
    return defaultChildren;
  }

  let slotChildren;
  if (Array.isArray(self.props.children)) {
    slotChildren = [];
    self.props.children.forEach((child) => {
      const slotName = child.props.slot || 'default';
      if (slotName === name) {
        slotChildren.push(child);
      }
    });

    if (slotChildren.length === 1) return slotChildren[0];
    if (slotChildren.length > 1) return slotChildren;

  } else if (self.props.children.props && self.props.children.props.slot === name) {
    return self.props.children;
  } else if (self.props.children.props && !self.props.children.props.slot && name === 'default') {
    return self.props.children;
  }

  return defaultChildren;
}
`;
const setPropsFunctionCode = `
function __setComponentProps(props) {
  function propType(type) {
    if (type === String) return PropTypes.string;
    if (type === Boolean) return PropTypes.bool;
    if (type === Function) return PropTypes.func;
    if (type === Number) return PropTypes.number;
    if (type === Object) return PropTypes.object;
    if (type === Array) return PropTypes.array;
    if (type === Symbol) return PropTypes.symbol;
    if (type.constructor === Function) return PropTypes.instanceOf(type);
    return PropTypes.any;
  }

  {{name}}.propTypes = {};

  Object.keys(props).forEach((propName) => {
    const prop = props[propName];
    const required = typeof prop.required !== 'undefined';
    const defaultValue = typeof prop.default !== 'undefined';
    const type = prop.type || prop;

    if (Array.isArray(type)) {
      if (required) {
        {{name}}.propTypes[propName] = PropTypes.oneOfType(type.map(propType)).required;
      } else {
        {{name}}.propTypes[propName] = PropTypes.oneOfType(type.map(propType));
      }
    } else {
      if (required) {
        {{name}}.propTypes[propName] = propType(type).required;
      } else {
        {{name}}.propTypes[propName] = propType(type)
      }
    }
    if (defaultValue) {
      if (!{{name}}.defaultProps) {{name}}.defaultProps = {};
      {{name}}.defaultProps[propName] = defaultValue
    }
  });
}
__setComponentProps(props);
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
      const emptyArrowFunction = transform(emptyArrowFunctionCode).program.body[0];
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
      const stateSetterBody = transform(stateFunctionCode).program.body[0];
      stateSetterBody.expression.right.callee.body.body.push(...prop.body.body);
      reactClassConstructor.body.body.push(stateSetterBody);
    }
    if (prop.key && prop.key.name === 'componentDidCreate') {
      const emptyArrowFunction = transform(emptyArrowFunctionCode).program.body[0];
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

function compile(componentString, options) {
  const transformResult = babel.transform(
    componentString,
    {
      sourceType: 'module',
      code: false,
      plugins: [
        '@babel/plugin-transform-react-jsx',
      ],
    },
  );

  const ast = transformResult.ast;

  // Default name
  let name = 'MyComponent';
  let componentExportNode;

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
    // Find name and component declaration
    if (node.type === 'ExportDefaultDeclaration') {
      componentExportNode = node;
      node.declaration.properties.forEach((prop) => {
        if (prop.key && prop.key.name === 'name') {
          name = toCamelCase(prop.value.value);
        }
      });
    }
  });

  const reactImportNode = transform(reactImportCode).program.body[0];
  const reactClassNode = transform(reactClassCode.replace(/{{name}}/, name)).program.body[0];
  const reactClassExportNode = transform(reactClassExportCode.replace(/{{name}}/, name)).program.body[0];

  ast.program.body.unshift(reactImportNode);
  ast.program.body.splice(ast.program.body.indexOf(componentExportNode), 1);
  ast.program.body.push(reactClassNode);

  const { hasProps, propsNode } = modifyReactClass(name, reactClassNode, componentExportNode.declaration);
  if (hasProps) {
    const propTypesImportNode = transform(propTypesImportCode).program.body[0];
    const setPropsFunction = transform(setPropsFunctionCode.replace(/{{name}}/g, name));
    const setPropsFunctionDeclaration = setPropsFunction.program.body[0];
    const setPropsFunctionCall = setPropsFunction.program.body[1];
    setPropsFunctionCall.expression.arguments = [propsNode];
    ast.program.body.splice(ast.program.body.indexOf(reactImportNode) + 1, 0, propTypesImportNode);
    ast.program.body.push(setPropsFunctionDeclaration, setPropsFunctionCall);
  }

  // Add JSX Transforms
  let hasSlots;
  const transformReactJsxFunctionNode = transform(transformReactJsxFunctionCode).program.body[0];
  ast.program.body.splice(ast.program.body.indexOf(reactClassNode), 0, transformReactJsxFunctionNode);
  walk.simple(ast.program, {
    // eslint-disable-next-line
    CallExpression(node) {
      if (
        node.callee.type === 'MemberExpression' &&
        node.callee.object.name === 'React' &&
        node.callee.property.name === 'createElement' &&
        node.arguments &&
        node.arguments[1]
      ) {
        if (node.arguments[0] && node.arguments[0].type === 'StringLiteral' && node.arguments[0].value === 'slot') {
          hasSlots = true;
          node.callee = {
            type: 'Identifier',
            name: '__getReactComponentSlot',
          };
          const newArguments = [
            {
              type: 'ThisExpression',
            },
            {
              type: 'StringLiteral',
              value: node.arguments[1].properties ? node.arguments[1].properties[0].value.value : 'default',
            },
          ];
          if (node.arguments[2]) newArguments.push(node.arguments[2]);
          node.arguments = newArguments;
        } else if (node.arguments[1]) {
          node.arguments[1] = {
            type: 'CallExpression',
            callee: {
              type: 'Identifier',
              name: '__transformReactJSXProps',
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
      ast.program.body.splice(ast.program.body.indexOf(reactClassNode), 0, getSlotsNode);
    });
  }

  ast.program.body.push(reactClassExportNode);

  const generateResult = generate(ast, {});

  const code = generateResult.code;

  code.replace(/process.env.COMPILER/g, 'react');

  return code;
}

module.exports = compile;
