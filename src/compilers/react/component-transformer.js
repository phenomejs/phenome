/* eslint no-param-reassign: "off" */
/* eslint prefer-destructuring: "off" */
const codeToAst = require('../compiler-utils/code-to-ast');
const toCamelCase = require('../compiler-utils/to-camel-case');

const propTypesImportCode = `
import PropTypes from 'prop-types';
`;
const reactImportCode = `
import React from 'react';
`;
const reactClassCode = `
(() => {
  const {{name}} = class {{name}} extends React.Component {
    constructor(props) {
      super(props);
    }
    dispatchEvent(events, ...args) {
      const self = this;
      if (!events || !events.trim().length) return;
      events.trim().split(' ').forEach((event) => {
        const eventName = (event || '')
          .trim()
          .split(/[ -_:]/)
          .map(word => word[0].toUpperCase() + word.substring(1))
          .join('');
        const propName = 'on' + eventName;
        if (self.props[propName]) self.props[propName](...args);
      });
    }
    get slots() {
      const self = this;
      const slots = {};
      if (!self.props.children || self.props.children.length == 0) {
        return slots;
      }

      let slotChildren;
      if (Array.isArray(self.props.children)) {
        self.props.children.forEach((child) => {
          const slotName = child.props && child.props.slot || 'default';
          if (!slots[name]) slots[name] = [];
          slots[name].push(child);
        });
      } else if (self.props.children.props && self.props.children.props.slot === name) {
        if (!slots[name]) slots[name] = [];
        slots[name].push(child);
      } else if (self.props.children.props && !self.props.children.props.slot) {
        if (!slots.default) slots.default = [];
        slots.default.push(self.props.children)
      }

      return slots;
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

  return {{name}};
})()

`;

const stateFunctionCode = `
this.state = (() => {})();
`;
const emptyArrowFunctionCode = `
(() => {})()
`;

const setPropsFunctionCode = `
function __setComponentProps(component, props) {
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

  component.propTypes = {};

  Object.keys(props).forEach((propName) => {
    const prop = props[propName];
    const required = typeof prop.required !== 'undefined';
    const type = prop.type || prop;

    if (Array.isArray(type)) {
      if (required) {
        component.propTypes[propName] = PropTypes.oneOfType(type.map(propType)).required;
      } else {
        component.propTypes[propName] = PropTypes.oneOfType(type.map(propType));
      }
    } else {
      if (required) {
        component.propTypes[propName] = propType(type).required;
      } else {
        component.propTypes[propName] = propType(type)
      }
    }
    if (typeof prop.default !== 'undefined') {
      if (!component.defaultProps) component.defaultProps = {};
      component.defaultProps[propName] = prop.default
    }
  });
}
__setComponentProps({{name}}, props);
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

function transform(name = 'MyComponent', componentNode, state) {
  // Find name
  componentNode.properties.forEach((prop) => {
    if (prop.key && prop.key.name === 'name') {
      name = toCamelCase(prop.value.value);
    }
  });

  const reactImportNode = codeToAst(reactImportCode).program.body[0];
  const reactClassNode = codeToAst(reactClassCode.replace(/{{name}}/g, toCamelCase(name))).program.body[0].expression;

  state.imports.react = reactImportNode;

  const { hasProps, propsNode } = modifyReactClass(
    name,
    reactClassNode.callee.body.body[0].declarations[0].init,
    componentNode,
  );

  if (hasProps) {
    const propTypesImportNode = codeToAst(propTypesImportCode).program.body[0];
    const setPropsFunction = codeToAst(setPropsFunctionCode.replace(/{{name}}/g, name));
    const setPropsFunctionDeclaration = setPropsFunction.program.body[0];
    const setPropsFunctionCall = setPropsFunction.program.body[1];

    setPropsFunctionCall.expression.arguments[1] = propsNode;

    state.imports.propTypes = propTypesImportNode;

    state.declarations.setPropsFunction = setPropsFunctionDeclaration;
    reactClassNode.callee.body.body.splice(1, 0, setPropsFunctionCall);
  }

  return reactClassNode;
}

module.exports = transform;
