/* eslint no-param-reassign: "off" */
/* eslint prefer-destructuring: "off" */
/* eslint import/no-extraneous-dependencies: "off" */
const babel = require('@babel/core');
const generate = require('@babel/generator').default;
const toCamelCase = require('../utils/to-camel-case.js');

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

const defaultPropsCode = `
{{name}}.defaultProps = {};
`;

const createElementInterceptorCode = `
const __c = (name, props, ...children) => {
  if (props) {
    Object.keys(props).forEach(propName => {
      let newPropName;

      if (propName === 'class') {
        newPropName = 'className';
      } else if (propName.substring(0, 4) !== 'data') {
        newPropName = propName.trim().split(/[-_:]/).map(word => word[0].toLowerCase() + word.substring(1)).join('');
      } else {
        newPropName = propName;
      }

      if (propName !== newPropName) {
          props[newPropName] = props[propName];
          delete props[propName];
      }
    });
  }

  return React.createElement(name, props, ...children);
};
`;

function getPropType(type) {
  function map(value) {
    if (value === 'String') return 'string';
    if (value === 'Boolean') return 'bool';
    if (value === 'Function') return 'func';
    if (value === 'Number') return 'number';
    if (value === 'Object') return 'object';
    if (value === 'Array') return 'array';
    if (value === 'Symbol') return 'symbol';
    return `instanceOf(${value})`;
  }
  if (type.type === 'Identifier') {
    return `PropTypes.${map(type.name)}`;
  } else if (type.type === 'ArrayExpression') {
    return `
PropTypes.oneOfType([
  ${type.elements.map(el => `PropTypes.${map(el.name)}`).join(', ')}
])`.trim();
  } else if (type.type === 'MemberExpression' && type.object.name && type.property.name) {
    return `PropTypes.${map(`${type.object.name}.${type.property.name}`)}`;
  }
  return 'PropTypes.any';
}

function createProps(name, componentObjectNode) {
  const props = [];
  const defaultProps = [];
  componentObjectNode.properties.forEach((prop) => {
    if (prop.key && prop.key.name === 'props') {
      prop.value.properties.forEach((property) => {
        const propKey = property.key;
        let propType;
        let propIsRequired;
        let propDefaultValue;
        if (property.value.type === 'ObjectExpression') {
          property.value.properties.forEach((propProp) => {
            if (propProp.key.name === 'type') {
              propType = propProp.value;
            }
            if (propProp.key.name === 'default') {
              propDefaultValue = propProp.value;
            }
            if (propProp.key.name === 'required') {
              propIsRequired = propProp.value;
            }
          });
        } else {
          propType = property.value;
        }
        if (propDefaultValue) {
          defaultProps.push({
            key: propKey,
            value: propDefaultValue,
          });
        }
        props.push({
          key: propKey,
          type: propType,
          required: propIsRequired,
        });
      });
    }
  });

  let defaultPropsNode;
  if (defaultProps.length) {
    defaultPropsNode = transform(defaultPropsCode.replace(/{{name}}/, name)).program.body[0];
    defaultProps.forEach((prop) => {
      defaultPropsNode.expression.right.properties.push({
        type: 'ObjectProperty',
        key: prop.key,
        value: prop.value,
      });
    });
  }

  let propTypesNode;
  if (props.length) {
    const propTypesCode = `
      ${name}.propTypes = {
        ${props.map((prop) => {
          const propKey = prop.key.name;
          const propType = `${getPropType(prop.type)}${prop.required ? '.isRequired' : ''}`;
          return `${propKey}: ${propType}`;
        }).join(',\n  ')}
      }`;
    propTypesNode = transform(propTypesCode);
  }
  return { defaultPropsNode, propTypesNode };
}

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
}

function compile(componentString, callback) {
  const transformResult = babel.transform(
    componentString,
    {
      sourceType: 'module',
      code: false,
      plugins: [[
        '@babel/plugin-transform-react-jsx', {
          pragma: '__c'
        }
      ]],
    },
  );

  const ast = transformResult.ast;

  // Default name
  let name = 'MyComponent';
  let componentExportNode;

  // Find name and component declaration
  ast.program.body.forEach((node) => {
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

  modifyReactClass(name, reactClassNode, componentExportNode.declaration);

  const { defaultPropsNode, propTypesNode } = createProps(name, componentExportNode.declaration);
  if (defaultPropsNode) {
    ast.program.body.push(defaultPropsNode);
  }
  if (propTypesNode) {
    const propTypesImportNode = transform(propTypesImportCode).program.body[0];
    ast.program.body.splice(ast.program.body.indexOf(reactImportNode) + 1, 0, propTypesImportNode);
    ast.program.body.push(propTypesNode);
  }

  ast.program.body.push(reactClassExportNode);

  ast.program.body.push(transform(createElementInterceptorCode).program.body[0]);

  const generateResult = generate(ast, {});

  const code = generateResult.code;

  callback(code);
}

module.exports = compile;
